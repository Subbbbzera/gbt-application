const db = require("./db");

async function migrate() {
  try {
    console.log("🚀 Starting database migration for prepayment...");

    const runSql = async (sql, label) => {
        try {
            await db.query(sql);
            console.log(`✅ ${label}`);
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME' || err.code === 'ER_DUP_COLUMN_NAME') {
                console.log(`ℹ️ ${label} (вже існує)`);
            } else {
                throw err;
            }
        }
    };

    
    await runSql(`ALTER TABLE orders ADD COLUMN prepayment_amount DECIMAL(10, 2) DEFAULT 0 AFTER total_amount`, "prepayment_amount в orders");

    console.log("✨ Migration finished successfully.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  }
}

migrate();
