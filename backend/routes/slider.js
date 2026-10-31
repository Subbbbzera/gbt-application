const express = require("express");
const multer = require("multer");
const db = require("../db");
const path = require("path");
const { authenticateToken, isAdmin } = require("./auth");

const router = express.Router();

const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".pdf"];
const ALLOWED_MIMETYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname).toLowerCase());
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_EXTENSIONS.includes(ext) && ALLOWED_MIMETYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error("Дозволені лише файли форматів: .jpg, .jpeg, .png, .webp, .pdf");
    error.status = 400;
    cb(error, false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});

router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM slider_images ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", authenticateToken, isAdmin, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Потрібно вибрати файл" });
    }
    const imagePath = `/uploads/${req.file.filename}`;
    const [result] = await db.query(
      "INSERT INTO slider_images (image_path) VALUES (?)",
      [imagePath]
    );
    res.status(201).json({ id: result.insertId, image_path: imagePath });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", authenticateToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM slider_images WHERE id = ?", [id]);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
