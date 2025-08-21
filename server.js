app.post('/api/create-square-payment-link', async (req, res) => {
    try {
        const { result } = await client.checkoutApi.createPaymentLink({
            order: {
                locationId: process.env.SQUARE_LOCATION_ID,
                orderSource: {
                    name: "Elite Taxi Booking"
                },
                lineItems: [{
                    name: "Taxi Ride",
                    basePriceMoney: {
                        amount: req.body.amount,
                        currency: 'USD'
                    },
                    quantity: '1'
                }]
            },
            checkoutOptions: {
                redirectUrl: req.body.redirectUrl
            }
        });

        res.json({ paymentLink: result.paymentLink });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
