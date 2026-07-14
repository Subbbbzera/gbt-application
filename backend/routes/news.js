
const express = require("express");
const router = express.Router();
const db = require("../db");


router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM news ORDER BY date DESC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.post("/", async (req, res) => {
  const { title, text, date } = req.body;
  try {
    const [result] = await db.query(
      "INSERT INTO news (title, text, date) VALUES (?, ?, ?)",
      [title, text, date]
    );
    res.json({ id: result.insertId, title, text, date });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM news WHERE id = ?", [id]);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { title, text } = req.body;
  try {
    await db.query(
      "UPDATE news SET title = ?, text = ? WHERE id = ?",
      [title, text, id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
