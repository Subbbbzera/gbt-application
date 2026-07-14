const express = require("express");
const multer = require("multer");
const db = require("../db");
const path = require("path");

const router = express.Router();


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });


router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM slider_images ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.post("/", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Потрібно вибрати файл" });
    }
    const imagePath = `/uploads/${req.file.filename}`;
    const [result] = await db.query(
      "INSERT INTO slider_images (image_path) VALUES (?)",
      [imagePath]
    );
    res.json({ id: result.insertId, image_path: imagePath });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM slider_images WHERE id = ?", [id]);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
