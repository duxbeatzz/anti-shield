// server/routes.ts

import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBrowserProfileSchema } from "@shared/schema";
import { launchBrowser } from "./browser";
import { ZodError } from "zod";

export function registerRoutes(app: Express): Server {
  app.get("/api/profiles", async (req, res) => {
    const profiles = await storage.getAllProfiles();
    res.json(profiles);
  });

  app.get("/api/profiles/:id", async (req, res) => {
    const profile = await storage.getProfile(parseInt(req.params.id));
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    res.json(profile);
  });

  app.post("/api/profiles", async (req, res) => {
    try {
      const profile = insertBrowserProfileSchema.parse(req.body);
      const created = await storage.createProfile(profile);
      res.status(201).json(created);
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({ message: err.errors });
      }
      throw err;
    }
  });

  app.patch("/api/profiles/:id", async (req, res) => {
    try {
      const partial = insertBrowserProfileSchema.partial().parse(req.body);
      const updated = await storage.updateProfile(parseInt(req.params.id), partial);
      if (!updated) {
        return res.status(404).json({ message: "Profile not found" });
      }
      res.json(updated);
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({ message: err.errors });
      }
      throw err;
    }
  });

  app.delete("/api/profiles/:id", async (req, res) => {
    const deleted = await storage.deleteProfile(parseInt(req.params.id));
    if (!deleted) {
      return res.status(404).json({ message: "Profile not found" });
    }
    res.status(204).end();
  });

  app.post("/api/profiles/:id/launch", async (req, res) => {
    const profile = await storage.getProfile(parseInt(req.params.id));
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    try {
      await launchBrowser(profile);
      res.json({ message: "Browser launched successfully" });
    } catch (err) {
      res.status(500).json({ message: "Failed to launch browser" });
    }
  });

  app.post("/api/profiles/import", async (req, res) => {
    try {
      const profiles = await storage.importProfiles(req.body);
      res.json(profiles);
    } catch (err) {
      res.status(400).json({ message: "Invalid profile data" });
    }
  });

  app.get("/api/profiles/export", async (req, res) => {
    const profiles = await storage.exportProfiles();
    res.json(profiles);
  });

  const httpServer = createServer(app);
  return httpServer;
}
