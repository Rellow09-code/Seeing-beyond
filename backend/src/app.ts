import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { corsUrl, environment } from "./config";
import authRoutes from "./routes/user.routes";
import chatRoutes from "./routes/chat.routes";
import messageRoutes from "./routes/message.routes";
import storyRoutes from "./routes/story.routes";

import "./database"; // initialize database
import {
  ApiError,
  ErrorType,
  InternalError,
  RateLimitError,
} from "./core/ApiError";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server as SocketServer } from "socket.io";
import { initSocketIo } from "./socket";
import { rateLimit, RateLimitRequestHandler } from "express-rate-limit";
import requestIp from "request-ip";

const app = express();

// HTTP server for Socket.IO
const httpServer = createServer(app);

// === RATE LIMITER ===
const limiter: RateLimitRequestHandler = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => requestIp.getClientIp(req) || "",
  handler: (_req, _res, next, options) =>
    next(
      new RateLimitError(
        `You exceeded the request limit. Allowed ${options.max} requests per minute.`
      )
    ),
});
app.use(limiter);

// === MIDDLEWARES ===
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());
app.use(morgan("dev"));
app.use(requestIp.mw());

// === CORS ===
const allowedOrigins = [
  "https://seeing-beyond-ai.vercel.app", // Vercel frontend
  "http://localhost:5173", // local dev
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

// === HEALTH CHECK ===
app.get("/health", (_req, res) => res.send("Backend is healthy"));

// === API ROUTES ===
app.use("/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/stories", storyRoutes);

// === STATIC FILES ===
app.use("/public", express.static("public"));

// === SOCKET.IO ===
const io = new SocketServer(httpServer, {
  pingTimeout: 60000,
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});
initSocketIo(io);
app.set("io", io);

// === ERROR HANDLER ===
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ApiError) {
    ApiError.handle(err, res);
    if (err.type === ErrorType.INTERNAL)
      console.error(`500 - ${err.message} - ${req.originalUrl}`);
  } else {
    console.error(`500 - ${err.message} - ${req.originalUrl}`);
    if (environment === "development") return res.status(500).send(err.stack);
    ApiError.handle(new InternalError(), res);
  }
});

export default httpServer;
