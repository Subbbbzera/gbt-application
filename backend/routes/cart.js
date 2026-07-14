const express = require("express");
const db = require("../db");
const { authenticateToken } = require("./auth");

const router = express.Router();


router.get("/", authenticateToken, async (req, res) => {
  try {
    const [cartItems] = await db.query(`
      SELECT c.*, uc.added_at 
      FROM user_cart uc 
      JOIN cards c ON uc.card_id = c.id 
      WHERE uc.user_id = ?
      ORDER BY uc.added_at DESC
    `, [req.user.id]);

    res.json(cartItems);
  } catch (err) {
    console.error("Помилка отримання кошика:", err);
    res.status(500).json({ error: "Не вдалося завантажити кошик" });
  }
});


router.post("/", authenticateToken, async (req, res) => {
  try {
    const { card_id } = req.body;

    if (!card_id) {
      return res.status(400).json({ error: "ID картки обов'язковий" });
    }

    
    const [cards] = await db.query("SELECT id FROM cards WHERE id = ?", [card_id]);
    if (cards.length === 0) {
      return res.status(404).json({ error: "Картку не знайдено" });
    }

    
    await db.query(
      "INSERT IGNORE INTO user_cart (user_id, card_id) VALUES (?, ?)",
      [req.user.id, card_id]
    );

    res.json({ message: "Товар додано в кошик" });
  } catch (err) {
    console.error("Помилка додавання в кошик:", err);
    res.status(500).json({ error: "Не вдалося додати товар в кошик" });
  }
});


router.delete("/:cardId", authenticateToken, async (req, res) => {
  try {
    const { cardId } = req.params;

    await db.query(
      "DELETE FROM user_cart WHERE user_id = ? AND card_id = ?",
      [req.user.id, cardId]
    );

    res.json({ message: "Товар видалено з кошика" });
  } catch (err) {
    console.error("Помилка видалення з кошика:", err);
    res.status(500).json({ error: "Не вдалося видалити товар з кошика" });
  }
});


router.delete("/", authenticateToken, async (req, res) => {
  try {
    await db.query("DELETE FROM user_cart WHERE user_id = ?", [req.user.id]);
    res.json({ message: "Кошик очищено" });
  } catch (err) {
    console.error("Помилка очищення кошика:", err);
    res.status(500).json({ error: "Не вдалося очистити кошик" });
  }
});

module.exports = router;