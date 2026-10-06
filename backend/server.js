require("dotenv").config();
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const authRoutes = require("./routes/auth");
const recordsRoutes = require("./routes/records");
const app = express();
const PORT = process.env.PORT || 5050;
const isProduction = process.env.NODE_ENV === "production";
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
const frontendOrigin = process.env.FRONTEND_ORIGIN || frontendUrl;
if (isProduction) {
  app.set("trust proxy", 1);
}
app.use(
  cors({
    origin: frontendOrigin,
    credentials: true,
  }),
);
app.use(express.json());
const sessionOptions = {
  secret: process.env.SESSION_SECRET || "development-secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 1000 * 60 * 60,
  },
};
app.use(session(sessionOptions));
app.get("/", (req, res) => {
  res.json({
    message: "Salesforce CRUD API is running",
  });
});
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Backend is working",
  });
});
app.use("/auth", authRoutes);
app.use("/api/records", recordsRoutes);
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
