const express = require("express");
const db = require("../db");
const { authenticateToken, isAdmin } = require("./auth");
const { uploadImages } = require("../utils/upload");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM slider_images ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", authenticateToken, isAdmin, uploadImages.single("image"), async (req, res) => {
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
