import { CorsOptions } from "cors";

// Get the origin from the environment variable
const frontendOrigin = process.env.FRONTEND_ORIGIN;

// Fail fast: if the origin is missing, crash the app with a clear error
if (!frontendOrigin) {
  throw new Error("FRONTEND_ORIGIN NOT FOUND");
}

export const corsOptions: CorsOptions = {
  origin: frontendOrigin,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
  ],
  credentials: true,
};
