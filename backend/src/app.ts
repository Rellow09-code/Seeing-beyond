import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { environment } from "./config";
import authRoutes from "./routes/user.routes";
import chatRoutes from "./routes/chat.routes";
import messageRoutes from "./routes/message.routes";
import storyRoutes from "./routes/story.routes";
import "./database"; // initialize database
import { ApiError, ErrorType, InternalError, RateLimitError } from "./core/ApiError";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server as SocketServer } from "socket.io";
import { initSocketIo } from "./socket";
import path from "path";
import { RateLimitRequestHandler, rateLimit } from "express-rate-limit";
import requestIp from "request-ip";

const app = express();
const httpServer = createServer(app);

// ===================== RATE LIMIT =====================
const limiter: RateLimitRequestHandler = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => requestIp.getClientIp(req) || "",
  handler: (_req, _res, next, options) => {
    next(
      new RateLimitError(
        `You exceeded the request limit. Allowed ${options.max} requests per ${options.windowMs / 60000} minute.`
      )
    );
  },
});
app.use(requestIp.mw());
app.use(limiter);

// ===================== MIDDLEWARES =====================
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());
app.use(morgan("dev"));

// ===================== CORS =====================
const allowedOrigins = [
  "https://seeing-beyond-ai.vercel.app", // Vercel frontend
  "http://localhost:5173",                // local dev
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) callback(null, true);
      else callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

// ===================== ROUTES =====================
app.get("/health", (_req, res) => res.send("healthy running"));
app.use("/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/stories", storyRoutes);
app.use("/public", express.static(path.join(__dirname, "..", "public")));

// ===================== STATIC FRONTEND SERVE =====================
if (process.env.NODE_ENV === "production") {
  const frontendPath = path.join(__dirname, "../../client/dist"); // adjust if needed
  app.use(express.static(frontendPath));

  app.get("*", (_req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}

// ===================== SOCKET.IO =====================
const io = new SocketServer(httpServer, {
  pingTimeout: 60000,
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});
initSocketIo(io);
app.set("io", io);

// ===================== ERROR HANDLING =====================
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ApiError) {
    ApiError.handle(err, res);
    if (err.type === ErrorType.INTERNAL)
      console.error(`500 - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}\n${err.stack}`);
  } else {
    console.error(`500 - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}\n${err.stack}`);
    if (environment === "development") return res.status(500).send(err.stack);
    ApiError.handle(new InternalError(), res);
  }
});

export default httpServer;
