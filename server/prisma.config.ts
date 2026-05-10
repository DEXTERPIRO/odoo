import { defineConfig } from 'prisma/config'
import { config } from 'dotenv'
import path from 'path'

// Load .env from the root traveloop/ folder (one level up from server/)
config({ path: path.resolve(process.cwd(), '../.env') })

export default defineConfig({
  datasourceUrl: process.env.DATABASE_URL,
})
