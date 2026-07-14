const db = require("./db");

async function checkSchema() {
  try {
    const [rows] = await db.query("DESCRIBE orders");
    console.log("Columns in 'orders' table:");
    rows.forEach(row => {
      console.log(`${row.Field} - ${row.Type}`);
    });
    process.exit(0);
  } catch (err) {
    console.error("Error describing orders table:", err);
    process.exit(1);
  }
}

checkSchema();

