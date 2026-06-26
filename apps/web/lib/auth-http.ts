import type { AuthError } from "@atrium/application"
import { NextResponse } from "next/server"

export function authErrorResponse(error: AuthError): NextResponse {
  return NextResponse.json(
    { error: error.message },
    { status: authStatusCode(error) },
  )
}

export function unexpectedAuthErrorResponse(action: string, error: unknown): NextResponse {
  console.error(`Unable to ${action}`, error)
  return NextResponse.json(
    { error: `Unable to ${action} right now` },
    { status: 500 },
  )
}

function authStatusCode(error: AuthError): number {
  switch (error.code) {
    case "EMAIL_ALREADY_REGISTERED":
      return 409
    case "INVALID_CREDENTIALS":
      return 401
    case "VALIDATION_ERROR":
      return 400
  }
}
