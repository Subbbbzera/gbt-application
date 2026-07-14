const express = require("express");
const db = require("../db");
const { authenticateToken } = require("./auth");

const router = express.Router();


router.get("/", authenticateToken, async (req, res) => {
  try {
    const [favorites] = await db.query(
      `SELECT c.* 
       FROM user_favorites uf
       JOIN cards c ON uf.card_id = c.id
       WHERE uf.user_id = ?`,
      [req.user.id]
    );
    res.json(favorites);
  } catch (error) {
    console.error("Помилка завантаження улюблених:", error);
    res.status(500).json({ error: 'Помилка завантаження улюблених' });
  }
});


router.post("/", authenticateToken, async (req, res) => {
  try {
    const { card_id } = req.body;
    if (!card_id) return res.status(400).json({ error: "Card ID required" });

    await db.query(
      "INSERT IGNORE INTO user_favorites (user_id, card_id) VALUES (?, ?)",
      [req.user.id, card_id]
    );
    res.json({ message: "Додано в улюблені" });
  } catch (error) {
    console.error("Помилка додавання в улюблені:", error);
    res.status(500).json({ error: 'Помилка додавання в улюблені' });
  }
});


router.delete("/:card_id", authenticateToken, async (req, res) => {
  try {
    const { card_id } = req.params;
    await db.query(
      "DELETE FROM user_favorites WHERE user_id = ? AND card_id = ?",
      [req.user.id, card_id]
    );
    res.json({ message: "Видалено з улюблених" });
  } catch (error) {
    console.error("Помилка видалення з улюблених:", error);
    res.status(500).json({ error: 'Помилка видалення з улюблених' });
  }
});

module.exports = router;
