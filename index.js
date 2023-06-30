import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import postRoutes from "./routes/posts.js";
import userRoutes from "./routes/users.js";

dotenv.config();

const app = express();
const cspDirectives = {
  connectSrc: ["'self'", "https://accounts.google.com/gsi/"],
  frameSrc: ["'self'", "https://accounts.google.com/gsi/"],
  scriptSrc: ["'self'", "https://accounts.google.com/gsi/client"],
  styleSrc: ["'self'", "https://accounts.google.com/gsi/style"],
};
app.use(cors());
app.use(express.json());
app.use(
  helmet.contentSecurityPolicy({
    directives: cspDirectives,
  })
);
app.use("/posts", postRoutes);
app.use("/user", userRoutes);

const CONNECTION_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 5000;

mongoose
  .connect(CONNECTION_URI)
  .then(() =>
    app.listen(PORT, () => console.log(`Server running on port ${PORT}...`))
  )
  .catch((err) => console.log(err.message));
