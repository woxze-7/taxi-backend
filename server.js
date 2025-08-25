const express = require('express');
const { Client } = require('square');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const client = new Client({
    accessToken: process.env.SQUARE_ACCESS_TOKEN,
    environment: 'sandbox'
});

// Configurar nodemailer para envío de emails
const transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'mail.ohare.taxi',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER || 'info@ohare.taxi',
        pass: process.env.SMTP_PASSWORD
    }
});

// Función para enviar emails
async function sendNotificationEmail(bookingData) {
    const emailHTML = `
        <h2>Nueva Reserva - Elite Taxi</h2>
        <p><strong>Booking ID:</strong> ETX${Date.now()}</p>
        <p><strong>Pickup:</strong> ${bookingData.tripDetails.pickup}</p>
        <p><strong>Destination:</strong> ${bookingData.tripDetails.destination}</p>
        <p><strong>Date & Time:</strong> ${bookingData.tripDetails.datetime}</p>
        <p><strong>Passengers:</strong> ${bookingData.tripDetails.passengers}</p>
        <p><strong>Vehicle:</strong> ${bookingData.tripDetails.vehicle}</p>
        <p><strong>Total:</strong> $${bookingData.costs.total.toFixed(2)}</p>
        
        <h3>Customer Info:</h3>
        <p><strong>Name:</strong> ${bookingData.mainPassenger.name}</p>
        <p><strong>Email:</strong> ${bookingData.mainPassenger.email}</p>
        <p><strong>Phone:</strong> ${bookingData.mainPassenger.phone}</p>
    `;

    try {
        await transporter.sendMail({
            from: process.env.SMTP_USER || 'info@ohare.taxi',
            to: process.env.NOTIFICATION_EMAIL || 'info@ohare.taxi',
            subject: 'Nueva Reserva - Elite Taxi',
            html: emailHTML
        });
        console.log('Email enviado exitosamente');
    } catch (error) {
        console.error('Error enviando email:', error);
    }
}

// Endpoint existente de Square
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

// NUEVO: Endpoint para Stripe
app.post('/api/process-stripe-payment', async (req, res) => {
    try {
        const { booking_data } = req.body;
        
        // Enviar email de notificación
        await sendNotificationEmail(booking_data);
        
        // Simular procesamiento exitoso (reemplaza con lógica real de Stripe si es necesario)
        res.json({ 
            success: true, 
            payment_intent_id: 'demo_pi_' + Date.now(),
            message: 'Pago procesado y notificación enviada'
        });
    } catch (error) {
        console.error('Error procesando pago:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
