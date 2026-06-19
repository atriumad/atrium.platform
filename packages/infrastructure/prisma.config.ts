import path from "node:path"
import { defineConfig } from "prisma/config"
import { PrismaNeon } from "@prisma/adapter-neon"
import { Pool } from "@neondatabase/serverless"

export default defineConfig({
  schema: path.join(__dirname, "prisma/schema.prisma"),
  migrate: {
    async adapter(env) {
      const pool = new Pool({
        connectionString: env["DATABASE_URL_UNPOOLED"] as string,
      })
      return new PrismaNeon(pool)
    },
  },
})
