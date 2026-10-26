import express from "express";

const app = express();

// lets us read JSON request bodies
app.use(express.json());

// simple route to check the server is alive
app.get("/ping", (req, res) => {
  res.json({ success: true, data: { status: "ok" } });
});

export default app;