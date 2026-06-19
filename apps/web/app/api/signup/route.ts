import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@atrium/infrastructure"

export async function POST(req: Request) {
  const body = await req.json() as { name?: unknown; email?: unknown; password?: unknown }

  const name     = typeof body.name     === "string" ? body.name.trim()     : ""
  const email    = typeof body.email    === "string" ? body.email.trim()    : ""
  const password = typeof body.password === "string" ? body.password        : ""

  if (!name || !email || !password) {
    return NextResponse.json({ error: "name, email, and password are required" }, { status: 400 })
  }

  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 })
  }

  const passwordHash = await bcrypt.hash(password, 12)
  const slug = `${email.split("@")[0]!.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Date.now()}`

  await prisma.$transaction(async (tx) => {
    const tenant = await tx.tenant.create({
      data: {
        name,
        slug,
        timezone: "America/New_York",
      },
    })

    await tx.user.create({
      data: {
        email,
        passwordHash,
        role: "owner",
        tenantId: tenant.id,
      },
    })

    // Seed system segments for the new tenant
    const SYSTEM_SEGMENTS = ["vip", "at_risk", "new", "loyal", "dormant", "one_time"] as const
    const SEGMENT_RULES: Record<string, object[]> = {
      vip:      [{ field: "ltv_percentile",         operator: "gte", value: 0.95 }],
      at_risk:  [{ field: "days_since_last_order",  operator: "gte", value: 45  },
                 { field: "visit_frequency",         operator: "lte", value: 20  }],
      new:      [{ field: "days_since_first_order", operator: "lte", value: 30  }],
      loyal:    [{ field: "total_orders",           operator: "gte", value: 5   },
                 { field: "days_since_last_order",  operator: "lte", value: 30  }],
      dormant:  [{ field: "days_since_last_order",  operator: "gte", value: 90  }],
      one_time: [{ field: "total_orders",           operator: "eq",  value: 1   },
                 { field: "days_since_last_order",  operator: "gte", value: 60  }],
    }

    await tx.customerSegment.createMany({
      data: SYSTEM_SEGMENTS.map((name) => ({
        tenantId: tenant.id,
        name,
        type: "system",
        rules: SEGMENT_RULES[name] ?? [],
      })),
    })
  })

  return NextResponse.json({ ok: true }, { status: 201 })
}
