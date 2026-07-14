const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "6f650fec6eb2a4748ae921cda6ff0546391aa2f34c9625aa27da3444798220f3cd125810ebf5553da711f7faeccd4be219dba7ae4f65db8b7835226dce72d19e"; 
const SALT_ROUNDS = 10;


const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};


router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    
    if (!username || !email || !password) {
      return res.status(400).json({ error: "Всі поля обов'язкові" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Пароль повинен містити принаймні 6 символів" });
    }

    
    const [existingUsers] = await db.query(
      "SELECT id FROM users WHERE username = ? OR email = ?",
      [username, email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: "Користувач з таким ім'ям або email вже існує" });
    }

    
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    
    const [result] = await db.query(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
      [username, email, hashedPassword]
    );

    
    const token = jwt.sign(
      { id: result.insertId, username, email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: "Користувач успішно зареєстрований",
      token,
      user: { 
        id: result.insertId, 
        username, 
        email, 
        email_notifications: 1, 
        role: 'user' 
      }
    });

  } catch (err) {
    console.error("Помилка реєстрації:", err);
    res.status(500).json({ error: "Внутрішня помилка сервера" });
  }
});



router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Всі поля обов'язкові" });
    }

    
    if (username === "admin" && password === "admin123") {
      const token = jwt.sign(
        { id: 0, username: "admin", email: "admin@example.com", role: "admin" }, 
        JWT_SECRET, 
        { expiresIn: "7d" }
      );

      return res.json({
        message: "Авторизація як адмін успішна",
        token,
        user: { id: 0, username: "admin", email: "admin@example.com", role: "admin" }
      });
    }

    
    const [users] = await db.query(
      "SELECT id, username, email, password, role FROM users WHERE username = ? OR email = ?",
      [username, username]
    );

    if (users.length === 0) {
      return res.status(400).json({ error: "Невірне ім'я користувача або пароль" });
    }

    const user = users[0];

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: "Невірне ім'я користувача або пароль" });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Авторизація успішна",
      token,
      user: { 
        id: user.id, 
        username: user.username, 
        email: user.email, 
        role: user.role,
        email_notifications: user.email_notifications
      }
    });

  } catch (err) {
    console.error("Помилка авторизації:", err);
    res.status(500).json({ error: "Внутрішня помилка сервера" });
  }
});



router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const [users] = await db.query(
      "SELECT id, username, email, created_at, email_notifications FROM users WHERE id = ?",
      [req.user.id]
    );

    if (users.length === 0) {
      
      if (req.user.id === 0) {
        return res.json({ id: 0, username: "admin", email: "admin@example.com", created_at: new Date(), email_notifications: 1 });
      }
      return res.status(404).json({ error: "Користувача не знайдено" });
    }

    res.json(users[0]);
  } catch (err) {
    console.error("Помилка отримання профілю:", err);
    res.status(500).json({ error: "Внутрішня помилка сервера" });
  }
});


router.patch("/profile", authenticateToken, async (req, res) => {
  try {
    const { username, email, password, email_notifications } = req.body;
    const userId = req.user.id;

    if (userId === 0) {
      return res.status(403).json({ error: "Неможливо змінити дані хардкодного адміна" });
    }

    let updateFields = [];
    let values = [];

    if (username) {
      updateFields.push("username = ?");
      values.push(username);
    }
    if (email) {
      updateFields.push("email = ?");
      values.push(email);
    }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      updateFields.push("password = ?");
      values.push(hashedPassword);
    }
    if (email_notifications !== undefined) {
      updateFields.push("email_notifications = ?");
      values.push(email_notifications ? 1 : 0);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: "Немає даних для оновлення" });
    }

    values.push(userId);
    const query = `UPDATE users SET ${updateFields.join(", ")} WHERE id = ?`;

    await db.query(query, values);

    
    const [users] = await db.query("SELECT id, username, email, role, email_notifications FROM users WHERE id = ?", [userId]);
    const updatedUser = users[0];

    
    const token = jwt.sign(
      { id: updatedUser.id, username: updatedUser.username, email: updatedUser.email, role: updatedUser.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Профіль успішно оновлено",
      token,
      user: updatedUser
    });

  } catch (err) {
    console.error("Помилка оновлення профілю:", err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: "Це ім'я або email вже зайняті" });
    }
    res.status(500).json({ error: "Внутрішня помилка сервера" });
  }
});


router.get("/profile/coupons", authenticateToken, async (req, res) => {
  try {
    const [coupons] = await db.query(
      "SELECT * FROM coupons WHERE user_id = ? ORDER BY created_at DESC",
      [req.user.id]
    );
    res.json(coupons);
  } catch (err) {
    console.error("Fetch user coupons error:", err);
    res.status(500).json({ error: "Помилка при отриманні купонів" });
  }
});


router.post("/logout", (req, res) => {
  res.json({ message: "Ви успішно вийшли з системи" });
});

module.exports = { router, authenticateToken };