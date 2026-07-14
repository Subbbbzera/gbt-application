const express = require("express");
const db = require("../db");
const { authenticateToken } = require("./auth");

const router = express.Router();


const isAdmin = (req, res, next) => {
  if (req.user && (req.user.role === "admin" || req.user.username === "admin")) {
    next();
  } else {
    res.status(403).json({ error: "Доступ заборонено. Потрібні права адміністратора." });
  }
};


router.get("/income", authenticateToken, isAdmin, async (req, res) => {
  try {
    
    const [rows] = await db.query(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month, 
        SUM(CASE WHEN status = 'cancelled' THEN prepayment_amount ELSE total_amount END) as total 
      FROM orders 
      GROUP BY month 
      ORDER BY month ASC
    `);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching income stats:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


router.get("/popular", authenticateToken, isAdmin, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        card_title as title, 
        COUNT(*) as count 
      FROM order_items 
      GROUP BY card_id, card_title 
      ORDER BY count DESC 
      LIMIT 5
    `);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching popular stats:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


router.get("/orders-monthly", authenticateToken, isAdmin, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        DATE(created_at) as date, 
        COUNT(*) as count 
      FROM orders 
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY date 
      ORDER BY date ASC
    `);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching monthly orders stats:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


router.get("/users", authenticateToken, isAdmin, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        u.id, 
        u.username, 
        u.email, 
        u.role,
        u.created_at,
        (SELECT customer_phone FROM orders WHERE user_id = u.id ORDER BY created_at DESC LIMIT 1) as phone,
        (SELECT COUNT(*) FROM order_items oi JOIN orders o ON oi.order_id = o.id WHERE o.user_id = u.id AND o.status != 'cancelled' AND oi.type = 'rent') as active_rent_count,
        (SELECT SUM(oi.subtotal) FROM order_items oi JOIN orders o ON oi.order_id = o.id WHERE o.user_id = u.id AND o.status != 'cancelled' AND oi.type = 'rent') as active_rent_sum,
        (SELECT CONCAT(DATE_FORMAT(start_date, '%d.%m'), ' - ', DATE_FORMAT(end_date, '%d.%m')) FROM orders WHERE user_id = u.id AND status != 'cancelled' ORDER BY created_at DESC LIMIT 1) as last_rent_period
      FROM users u
      ORDER BY u.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching users list:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


router.get("/sales-report", authenticateToken, isAdmin, async (req, res) => {
  const { from, to } = req.query;
  
  try {
    
    const startDate = from ? `${from} 00:00:00` : '1970-01-01 00:00:00';
    const endDate = to ? `${to} 23:59:59` : '2099-12-31 23:59:59';

    const [rows] = await db.query(`
      SELECT 
        oi.card_title as title, 
        COUNT(*) as count, 
        GROUP_CONCAT(DISTINCT o.customer_name SEPARATOR ', ') as buyers
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.created_at BETWEEN ? AND ?
      GROUP BY oi.card_id, oi.card_title
      ORDER BY count DESC
    `, [startDate, endDate]);
    
    res.json(rows);
  } catch (error) {
    console.error("Error fetching sales report:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


router.get("/summary", authenticateToken, isAdmin, async (req, res) => {
  try {
    
    const [ordersSum] = await db.query(`
      SELECT SUM(total_amount) as total FROM orders WHERE status != 'cancelled'
    `);

    
    const [activeItemsCount] = await db.query(`
      SELECT COUNT(*) as count 
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status != 'cancelled'
    `);

    
    const [catalogCount] = await db.query(`
      SELECT COUNT(*) as count FROM cards WHERE is_available = 1
    `);

    res.json({
      activeOrdersTotal: ordersSum[0].total || 0,
      activeItemsCount: activeItemsCount[0].count || 0,
      catalogCount: catalogCount[0].count || 0
    });
  } catch (error) {
    console.error("Error fetching summary stats:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
