const db = require("./db");

async function migrate() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS order_documents (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        file_path VARCHAR(255) NOT NULL,
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
      )
    `);
    console.log("✅ Table order_documents created successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration error:", error);
    process.exit(1);
  }
}

migrate();
