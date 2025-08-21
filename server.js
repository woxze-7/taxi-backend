const express = require('express');
const { Client } = require('square');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const client = new Client({
    accessToken: process.env.SQUARE_ACCESS_TOKEN,
    environment: 'sandbox'
});

app.post('/api/process-square-payment', async (req, res) => {
    try {
        const { result } = await client.paymentsApi.createPayment({
            sourceId: req.body.sourceId,
            amountMoney: {
                amount: req.body.amount,
                currency: 'USD'
            },
            idempotencyKey: req.body.idempotencyKey,
            locationId: process.env.SQUARE_LOCATION_ID
        });

        res.json({ success: true, payment: result.payment });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(3000, () => console.log('Server running on port 3000'));
