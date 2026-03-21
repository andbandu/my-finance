try {
  require("dotenv/config");
} catch (e) {
  // dotenv might not be installed yet, proceed with environment variables
}
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
