const express = require("express");
const router = express.Router();
const db = require("../db");
const { authenticateToken, isAdmin } = require("./auth");

const WHEEL_SECTORS = [
  { label: "10% ЗНИЖКА", value: 10, weight: 1 },
  { label: "", value: 0, weight: 4 },
  { label: "БЕЗ ЗНИЖКИ", value: 0, weight: 8 },
  { label: "", value: 0, weight: 4 },
  { label: "3% ЗНИЖКА", value: 3, weight: 5 },
  { label: "", value: 0, weight: 4 },
  { label: "5% ЗНИЖКА", value: 5, weight: 4 },
  { label: "", value: 0, weight: 4 },
];

const spunUsers = new Set();

const generateCouponCode = () => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  let code = "";
  for (let i = 0; i < 3; i++) {
    code += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  for (let i = 0; i < 3; i++) {
    code += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }
  return code;
};

router.get("/", authenticateToken, isAdmin, async (req, res) => {
  try {
    const [coupons] = await db.query("SELECT * FROM coupons ORDER BY created_at DESC");
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ error: "Помилка при отриманні купонів" });
  }
});

router.post("/", authenticateToken, isAdmin, async (req, res) => {
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
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "Такий код вже існує" });
    }
    res.status(500).json({ error: "Помилка при створенні купона" });
  }
});

router.delete("/:id", authenticateToken, isAdmin, async (req, res) => {
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
      discount: coupon.discount,
    });
  } catch (err) {
    res.status(500).json({ error: "Помилка при перевірці купона" });
  }
});

router.post("/spin", authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const [existingCoupons] = await db.query(
      "SELECT id, code, discount FROM coupons WHERE user_id = ? LIMIT 1",
      [userId]
    );

    if (existingCoupons.length > 0 || spunUsers.has(userId)) {
      return res.status(400).json({
        error: "Ви вже крутили колесо фортуни",
        existingCoupon: existingCoupons[0] || null,
      });
    }

    const totalWeight = WHEEL_SECTORS.reduce((acc, s) => acc + s.weight, 0);
    let random = Math.random() * totalWeight;
    let selectedSectorIndex = 0;

    for (let i = 0; i < WHEEL_SECTORS.length; i++) {
      if (random < WHEEL_SECTORS[i].weight) {
        selectedSectorIndex = i;
        break;
      }
      random -= WHEEL_SECTORS[i].weight;
    }

    const wonSector = WHEEL_SECTORS[selectedSectorIndex];
    spunUsers.add(userId);

    if (wonSector.value > 0) {
      let code = generateCouponCode();
      await db.query(
        "INSERT INTO coupons (code, discount, usage_limit, user_id) VALUES (?, ?, 1, ?)",
        [code, wonSector.value, userId]
      );

      return res.status(201).json({
        sectorIndex: selectedSectorIndex,
        label: wonSector.label,
        discount: wonSector.value,
        code,
      });
    }

    return res.json({
      sectorIndex: selectedSectorIndex,
      label: wonSector.label,
      discount: 0,
      code: null,
    });
  } catch (err) {
    console.error("Spin coupon wheel error:", err);
    res.status(500).json({ error: "Помилка при обертанні колеса фортуни" });
  }
});

module.exports = router;
