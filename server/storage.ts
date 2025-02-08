import { BrowserProfile, InsertBrowserProfile } from "@shared/schema";

export interface IStorage {
  getProfile(id: number): Promise<BrowserProfile | undefined>;
  getAllProfiles(): Promise<BrowserProfile[]>;
  createProfile(profile: InsertBrowserProfile): Promise<BrowserProfile>;
  updateProfile(id: number, profile: Partial<InsertBrowserProfile>): Promise<BrowserProfile | undefined>;
  deleteProfile(id: number): Promise<boolean>;
  importProfiles(profiles: InsertBrowserProfile[]): Promise<BrowserProfile[]>;
  exportProfiles(): Promise<BrowserProfile[]>;
}

export class MemStorage implements IStorage {
  private profiles: Map<number, BrowserProfile>;
  private currentId: number;

  constructor() {
    this.profiles = new Map();
    this.currentId = 1;
  }

  async getProfile(id: number): Promise<BrowserProfile | undefined> {
    return this.profiles.get(id);
  }

  async getAllProfiles(): Promise<BrowserProfile[]> {
    return Array.from(this.profiles.values());
  }

  async createProfile(profile: InsertBrowserProfile): Promise<BrowserProfile> {
    const id = this.currentId++;
    const newProfile: BrowserProfile = {
      ...profile,
      id,
      cookies: []
    };
    this.profiles.set(id, newProfile);
    return newProfile;
  }

  async updateProfile(id: number, profile: Partial<InsertBrowserProfile>): Promise<BrowserProfile | undefined> {
    const existing = this.profiles.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...profile };
    this.profiles.set(id, updated);
    return updated;
  }

  async deleteProfile(id: number): Promise<boolean> {
    return this.profiles.delete(id);
  }

  async importProfiles(profiles: InsertBrowserProfile[]): Promise<BrowserProfile[]> {
    return Promise.all(profiles.map(p => this.createProfile(p)));
  }

  async exportProfiles(): Promise<BrowserProfile[]> {
    return Array.from(this.profiles.values());
  }
}

export const storage = new MemStorage();
