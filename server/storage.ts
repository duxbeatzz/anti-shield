//
import { browserProfiles, type BrowserProfile, type InsertBrowserProfile } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getProfile(id: number): Promise<BrowserProfile | undefined>;
  getAllProfiles(): Promise<BrowserProfile[]>;
  createProfile(profile: InsertBrowserProfile): Promise<BrowserProfile>;
  updateProfile(id: number, profile: Partial<InsertBrowserProfile>): Promise<BrowserProfile | undefined>;
  deleteProfile(id: number): Promise<boolean>;
  importProfiles(profiles: InsertBrowserProfile[]): Promise<BrowserProfile[]>;
  exportProfiles(): Promise<BrowserProfile[]>;
}

export class DatabaseStorage implements IStorage {
  async getProfile(id: number): Promise<BrowserProfile | undefined> {
    const [profile] = await db.select().from(browserProfiles).where(eq(browserProfiles.id, id));
    return profile;
  }

  async getAllProfiles(): Promise<BrowserProfile[]> {
    return await db.select().from(browserProfiles);
  }

  async createProfile(profile: InsertBrowserProfile): Promise<BrowserProfile> {
    const [created] = await db.insert(browserProfiles).values(profile).returning();
    return created;
  }

  async updateProfile(id: number, profile: Partial<InsertBrowserProfile>): Promise<BrowserProfile | undefined> {
    const [updated] = await db
      .update(browserProfiles)
      .set(profile)
      .where(eq(browserProfiles.id, id))
      .returning();
    return updated;
  }

  async deleteProfile(id: number): Promise<boolean> {
    const [deleted] = await db
      .delete(browserProfiles)
      .where(eq(browserProfiles.id, id))
      .returning();
    return !!deleted;
  }

  async importProfiles(profiles: InsertBrowserProfile[]): Promise<BrowserProfile[]> {
    return await db.insert(browserProfiles).values(profiles).returning();
  }

  async exportProfiles(): Promise<BrowserProfile[]> {
    return await db.select().from(browserProfiles);
  }
}

export const storage = new DatabaseStorage();