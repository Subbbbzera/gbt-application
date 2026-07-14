const express = require("express");
const router = express.Router();
const crypto = require("crypto");


const PUBLIC_KEY = process.env.LIQPAY_PUBLIC_KEY || "sandbox_i76355811464"; 
const PRIVATE_KEY = process.env.LIQPAY_PRIVATE_KEY || "sandbox_Hu8hEDu4iPFe67ypVBQIpMqRBVsCmb6EuBEBKzlU";

router.post("/get-liqpay-params", (req, res) => {
    const { amount, order_id, description } = req.body;

    if (!amount || !order_id) {
        return res.status(400).json({ error: "Відсутні обов'язкові параметри" });
    }

    const origin = req.get("origin") || "http://localhost:3000";

    const json_string = {
        public_key: PUBLIC_KEY,
        version: 3,
        action: "pay",
        amount: amount,
        currency: "UAH",
        description: description || `Оплата замовлення #${order_id}`,
        order_id: order_id,
        result_url: `${origin}/orders`, 
        server_url: "http://your-domain.com/payments/callback" 
    };

    const data = Buffer.from(JSON.stringify(json_string)).toString("base64");
    
    
    const signature = crypto
        .createHash("sha1")
        .update(PRIVATE_KEY + data + PRIVATE_KEY)
        .digest("base64");

    res.json({ data, signature });
});

module.exports = router;
