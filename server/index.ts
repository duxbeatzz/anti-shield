import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const debugLog = (message: string) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${message}`);
};

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  console.log(`\n📡 ${req.method} ${req.url}`);
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;
  let requestBody = req.body;

  if (Object.keys(requestBody).length > 0) {
    console.log('Request Body:', requestBody);
  }

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    console.log('Response Body:', bodyJson);
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${new Date().toLocaleTimeString()} [${req.method}] ${path} ${res.statusCode} in ${duration}ms`;
      
      if (Object.keys(requestBody).length > 0) {
        logLine += `\nRequest Body: ${JSON.stringify(requestBody)}`;
      }
      
      if (capturedJsonResponse) {
        logLine += `\nResponse: ${JSON.stringify(capturedJsonResponse)}`;
      }

      debugLog(logLine);
      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    
    debugLog(`Error: ${status} - ${message}`);
    log(`Error: ${status} - ${message}`);
    res.status(status).json({ message });
    throw err;
  });

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const PORT = 5000;
  server.listen(PORT, "0.0.0.0", () => {
    debugLog(`Server running on port ${PORT}`);
    log(`Server running on port ${PORT}`);
  });
})();
