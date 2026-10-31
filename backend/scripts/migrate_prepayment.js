const db = require("../db");

async function migrate() {
  try {
    console.log("рџљЂ Starting database migration for prepayment...");

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

    
    await runSql(`ALTER TABLE orders ADD COLUMN prepayment_amount DECIMAL(10, 2) DEFAULT 0 AFTER total_amount`, "prepayment_amount РІ orders");

    console.log("вњЁ Migration finished successfully.");
    process.exit(0);
  } catch (err) {
    console.error("вќЊ Migration failed:", err);
    process.exit(1);
  }
}

migrate();

