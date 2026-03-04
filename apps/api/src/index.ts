import express, { type Express } from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import todoRoutes from "./routes/todos";
import { setupSwagger } from "./swagger";
import { errorHandler } from "./middleware/errorHandler";

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3001;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/todo-app";

app.use(cors());
app.use(express.json());

setupSwagger(app);

app.use("/api/todos", todoRoutes);

app.use(errorHandler);

async function main(): Promise<void> {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Swagger UI available at http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1);
  }
}

const isMainModule =
  process.argv[1] &&
  (process.argv[1].includes("index.ts") ||
    process.argv[1].includes("index.js"));

if (isMainModule) {
  main();
}

export { app };
