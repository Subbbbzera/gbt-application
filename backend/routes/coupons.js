const express = require("express");
const router = express.Router();
const db = require("../db");


router.get("/", async (req, res) => {
  try {
    const [coupons] = await db.query("SELECT * FROM coupons ORDER BY created_at DESC");
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ error: "Помилка при отриманні купонів" });
  }
});


router.post("/", async (req, res) => {
  const { code, discount, usage_limit } = req.body;
  if (!code || !discount) {
    return res.status(400).json({ error: "Код та відсоток знижки обов'язкові" });
  }
  try {
    await db.query(
      "INSERT INTO coupons (code, discount, usage_limit) VALUES (?, ?, ?)",
      [code.toUpperCase(), discount, usage_limit || 1]
    );
    res.status(201).json({ message: "Купон успішно створено" });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: "Такий код вже існує" });
    }
    res.status(500).json({ error: "Помилка при створенні купона" });
  }
});


router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM coupons WHERE id = ?", [id]);
    res.json({ message: "Купон видалено" });
  } catch (err) {
    res.status(500).json({ error: "Помилка при видаленні купона" });
  }
});


router.post("/validate", async (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: "Код не вказано" });

  try {
    const [coupons] = await db.query(
      "SELECT * FROM coupons WHERE code = ?",
      [code.toUpperCase()]
    );

    if (coupons.length === 0) {
      return res.status(404).json({ error: "Купон не знайдено" });
    }

    const coupon = coupons[0];
    if (coupon.used_count >= coupon.usage_limit) {
      return res.status(400).json({ error: "Купон вичерпав ліміт використань" });
    }

    res.json({
      code: coupon.code,
      discount: coupon.discount
    });
  } catch (err) {
    res.status(500).json({ error: "Помилка при перевірці купона" });
  }
});


router.post("/generate", async (req, res) => {
  const { code, discount, userId } = req.body;
  if (!code || !discount) {
    return res.status(400).json({ error: "Код та знижка обов'язкові" });
  }
  try {
    await db.query(
      "INSERT INTO coupons (code, discount, usage_limit, user_id) VALUES (?, ?, ?, ?)",
      [code.toUpperCase(), discount, 1, userId || null]
    );
    res.status(201).json({ message: "Купон успішно створено", code: code.toUpperCase() });
  } catch (err) {
    console.error("Generate coupon error:", err);
    res.status(500).json({ error: "Помилка при генерації купона" });
  }
});

module.exports = router;
