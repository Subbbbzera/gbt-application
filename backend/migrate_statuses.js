const db = require("./db");

async function migrate() {
  try {
    
    
    
    await db.query(`
      ALTER TABLE orders 
      MODIFY COLUMN status ENUM('verification', 'awaiting_prepayment', 'prepaid', 'confirmed', 'cancelled', 'completed', 'in_progress', 'pending') 
      DEFAULT 'verification'
    `);

    console.log("✅ Order statuses updated successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration error:", error);
    process.exit(1);
  }
}

migrate();
