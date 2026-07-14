const express = require("express");
const router = express.Router();
const db = require("../db");


router.get("/user/:userId", async (req, res) => {
  const { userId } = req.params;
  
  try {
    const [rows] = await db.query(
      `SELECT r.*, c.title as card_title, c.image as card_image
       FROM reviews r 
       JOIN cards c ON r.card_id = c.id 
       WHERE r.user_id = ? 
       ORDER BY r.date DESC`, 
      [userId]
    );
    
    res.json(rows);
  } catch (err) {
    console.error("Помилка при отриманні відгуків користувача:", err);
    res.status(500).json({ error: err.message });
  }
});


router.get("/:cardId", async (req, res) => {
  const { cardId } = req.params;
  
  try {
    const [rows] = await db.query(
      `SELECT r.*, u.username 
       FROM reviews r 
       LEFT JOIN users u ON r.user_id = u.id 
       WHERE r.card_id = ? 
       ORDER BY r.date ASC`, 
      [cardId]
    );
    
    res.json(rows);
  } catch (err) {
    console.error("Помилка при отриманні відгуків:", err);
    res.status(500).json({ error: err.message });
  }
});


router.post("/", async (req, res) => {
  const { card_id, text, rating, parent_id, user_id } = req.body;
  
  if (!card_id || !text?.trim()) {
    return res.status(400).json({ error: "card_id і text обов'язкові" });
  }

  try {
    const [result] = await db.query(
      "INSERT INTO reviews (card_id, text, rating, parent_id, user_id) VALUES (?, ?, ?, ?, ?)",
      [card_id, text.trim(), rating || null, parent_id || null, user_id || null]
    );

    const [newReview] = await db.query(
      "SELECT r.*, u.username FROM reviews r LEFT JOIN users u ON r.user_id = u.id WHERE r.id = ?",
      [result.insertId]
    );

    res.json(newReview[0]);
  } catch (err) {
    console.error("Помилка при додаванні відгуку:", err);
    res.status(500).json({ error: err.message });
  }
});


router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  
  try {
    await db.query("DELETE FROM reviews WHERE id = ?", [id]);
    console.log(`Видалено відгук з id: ${id}`);
    res.json({ message: "Відгук видалено успішно" });
  } catch (err) {
    console.error("Помилка при видаленні відгуку:", err);
    res.status(500).json({ error: err.message });
  }
});


router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { text, rating } = req.body;

  if (!text?.trim()) {
    return res.status(400).json({ error: "Текст відгуку не може бути порожнім" });
  }

  try {
    await db.query(
      "UPDATE reviews SET text = ?, rating = ? WHERE id = ?",
      [text.trim(), rating || null, id]
    );
    res.json({ message: "Відгук оновлено успішно" });
  } catch (err) {
    console.error("Помилка при оновленні відгуку:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;