import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import dotenv from "dotenv";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  const upload = multer({
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
  });

  app.use(express.json());

  // API Route for PDF parsing only
  app.post("/api/parse-pdf", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file provided" });
      }

      console.log("Parsing PDF file, size:", req.file.size);
      
      // Robust PDF extraction
      let pdfFunction = pdf;
      if (typeof pdfFunction !== 'function' && pdf.default) {
        pdfFunction = pdf.default;
      }
      
      if (typeof pdfFunction !== 'function') {
        throw new Error("PDF parsing engine initialization failed. Found type: " + typeof pdfFunction);
      }

      const data = await pdfFunction(req.file.buffer);
      
      if (!data || !data.text) {
        throw new Error("Failed to extract text from PDF");
      }
      
      let cleanedText = data.text
        .replace(/\s+/g, " ") // Remove extra spaces
        .replace(/[^a-zA-Z0-9.,\n\-\(\):; ]/g, "") // Remove random symbols but keep basic punctuation
        .trim();

      if (cleanedText.length < 20) {
        return res.status(400).json({ 
          error: "Unable to read this PDF clearly. It might be image-based or poorly formatted. Please paste syllabus manually." 
        });
      }

      console.log("Extracted text (first 200 chars):", cleanedText.substring(0, 200));

      return res.json({
        success: true,
        text: cleanedText
      });
    } catch (error: any) {
      console.error("PDF parsing failed:", error);
      res.status(500).json({ error: error.message || "Failed to parse PDF" });
    }
  });

  // Reset Data API
  app.post("/api/reset-data", async (req, res) => {
    try {
      // In a real app with server-side sessions, we'd clear them here.
      // For this client-side focused app, we acknowledge the reset.
      console.log("Reset data request received");
      res.json({ success: true, message: "Data reset acknowledged" });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to process reset request" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("FATAL: Failed to start server:", err);
  process.exit(1);
});
