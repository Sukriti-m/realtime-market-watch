import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Market watch backend is running"
  });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});