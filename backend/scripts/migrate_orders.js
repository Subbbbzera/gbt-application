const db = require("../db");

async function migrate() {
  try {
    console.log("рџљЂ Starting database migration...");

    const runSql = async (sql, label) => {
        try {
            await db.query(sql);
            console.log(`вњ… ${label}`);
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME' || err.code === 'ER_DUP_COLUMN_NAME') {
                console.log(`в„№пёЏ ${label} (РІР¶Рµ С–СЃРЅСѓС”)`);
            } else {
                throw err;
            }
        }
    };

    
    await runSql(`ALTER TABLE orders ADD COLUMN customer_email VARCHAR(255) AFTER customer_name`, "customer_email РІ orders");

    
    await runSql(`ALTER TABLE order_items ADD COLUMN price_buy DECIMAL(10, 2) AFTER price_per_day`, "price_buy РІ order_items");

    
    await runSql(`ALTER TABLE order_items ADD COLUMN type VARCHAR(50) DEFAULT 'rent' AFTER subtotal`, "type РІ order_items");

    console.log("вњЁ Migration finished successfully.");
    process.exit(0);
  } catch (err) {
    console.error("вќЊ Migration failed:", err);
    process.exit(1);
  }
}

migrate();

