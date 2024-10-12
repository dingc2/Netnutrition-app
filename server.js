const express = require('express');
const mysql = require('mysql2');
require('dotenv').config(); 

// Create connection to MySQL
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Connect to MySQL
db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

const app = express();

// Fetch dining hall information
app.get('/dining-halls', (req, res) => {
    const query = `SELECT * FROM DiningHalls`;
    db.query(query, (err, results) => {
        if (err) {
            res.status(500).send('Error fetching dining halls');
            return;
        }
        res.json(results);
    });
});

// Fetch hours for a specific dining hall
app.get('/dining-halls/:id/hours', (req, res) => {
    const { id } = req.params;
    const query = `SELECT * FROM Hours WHERE dining_hall_id = ?`;
    db.query(query, [id], (err, results) => {
        if (err) {
            res.status(500).send('Error fetching hours');
            return;
        }
        res.json(results);
    });
});

// Fetch menu items for a specific dining hall
app.get('/dining-halls/:id/menu', (req, res) => {
    const { id } = req.params;
    const query = `SELECT * FROM MenuItems WHERE dining_hall_id = ?;`
    db.query(query, [id], (err, results) => {
        if (err) {
            res.status(500).send('Error fetching menu');
            return;
        }
        res.json(results);
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});