import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const browserProfiles = pgTable("browser_profiles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  userAgent: text("user_agent").notNull(),
  screenResolution: text("screen_resolution").notNull(),
  platform: text("platform").notNull(),
  language: text("language").notNull(),
  timezone: text("timezone").notNull(),
  webglVendor: text("webgl_vendor").notNull(),
  webglRenderer: text("webgl_renderer").notNull(),
  hardwareConcurrency: integer("hardware_concurrency").notNull(),
  deviceMemory: integer("device_memory").notNull(),
  proxyEnabled: boolean("proxy_enabled").default(false),
  proxyHost: text("proxy_host"),
  proxyPort: integer("proxy_port"),
  proxyUsername: text("proxy_username"),
  proxyPassword: text("proxy_password"),
  cookies: jsonb("cookies").default([])
});

export const insertBrowserProfileSchema = createInsertSchema(browserProfiles)
  .omit({ id: true, cookies: true })
  .extend({
    proxyEnabled: z.boolean().optional(),
    proxyHost: z.string().optional(),
    proxyPort: z.number().min(1).max(65535).optional(),
    proxyUsername: z.string().optional(),
    proxyPassword: z.string().optional()
  });

export type InsertBrowserProfile = z.infer<typeof insertBrowserProfileSchema>;
export type BrowserProfile = typeof browserProfiles.$inferSelect;
