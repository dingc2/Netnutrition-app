const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

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

// Error handling middleware
const handleDatabaseError = (err, res) => {
    console.error('Database error:', err);
    res.status(500).json({
        error: 'Database error occurred',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
};

// Routes

// Get all dining halls
app.get('/dining-halls', (req, res) => {
    const query = `SELECT * FROM DiningHalls`;
    
    db.query(query, (err, results) => {
        if (err) {
            handleDatabaseError(err, res);
            return;
        }
        res.json(results);
    });
});

// Get specific dining hall
app.get('/dining-halls/:id', (req, res) => {
    const query = `SELECT * FROM DiningHalls WHERE id = ?`;
    
    db.query(query, [req.params.id], (err, results) => {
        if (err) {
            handleDatabaseError(err, res);
            return;
        }
        if (results.length === 0) {
            res.status(404).json({ error: 'Dining hall not found' });
            return;
        }
        res.json(results[0]);
    });
});

// API to fetch hours grouped by day and meal type
app.get('/dining-halls/:id/hours', (req, res) => {
    const hallId = req.params.id;
    const sqlQuery = `
        SELECT day_of_week, meal_name, opening_time, closing_time
        FROM Hours
        JOIN MealTypes ON Hours.meal_type_id = MealTypes.id
        WHERE dining_hall_id = ?
        ORDER BY FIELD(day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'), meal_type_id
    `;
    db.query(sqlQuery, [hallId], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Database query error' });
        } else {
            res.json(results);
        }
    });
});

// Get all meal types
app.get('/meal-types', (req, res) => {
    const query = `SELECT * FROM MealTypes`;
    
    db.query(query, (err, results) => {
        if (err) {
            handleDatabaseError(err, res);
            return;
        }
        res.json(results);
    });
});

// Get menu for a specific dining hall, meal type, and day
app.get('/dining-halls/:id/menu/:mealTypeId/:day', (req, res) => {
    const { id, mealTypeId, day } = req.params;
    const query = `
        SELECT 
            mi.id,
            mi.item_name,
            mi.dietary_info,
            wm.day_of_week,
            wm.week_start_date
        FROM MenuItems mi
        JOIN WeeklyMenus wm ON mi.weekly_menu_id = wm.id
        WHERE wm.dining_hall_id = ? 
        AND wm.meal_type_id = ?
        AND wm.day_of_week = ?
        AND wm.week_start_date = (
            SELECT MAX(week_start_date)
            FROM WeeklyMenus
            WHERE dining_hall_id = ?
            AND meal_type_id = ?
            AND day_of_week = ?
        )
    `;
    
    db.query(query, [id, mealTypeId, day, id, mealTypeId, day], (err, results) => {
        if (err) {
            handleDatabaseError(err, res);
            return;
        }
        res.json(results);
    });
});

// Get nutritional information for a specific menu item
app.get('/menu-items/:id/nutrition', (req, res) => {
    const query = `
        SELECT 
            ni.*,
            mi.item_name
        FROM NutritionalInfo ni
        JOIN MenuItems mi ON ni.menu_item_id = mi.id
        WHERE ni.menu_item_id = ?
    `;
    
    db.query(query, [req.params.id], (err, results) => {
        if (err) {
            handleDatabaseError(err, res);
            return;
        }
        if (results.length === 0) {
            res.status(404).json({ error: 'Nutritional information not found' });
            return;
        }
        res.json(results[0]);
    });
});

// Get weekly menu for a dining hall
app.get('/dining-halls/:id/weekly-menu', (req, res) => {
    const query = `
        SELECT 
            wm.id as weekly_menu_id,
            wm.day_of_week,
            mt.meal_name,
            mi.id as item_id,
            mi.item_name,
            mi.dietary_info
        FROM WeeklyMenus wm
        JOIN MealTypes mt ON wm.meal_type_id = mt.id
        JOIN MenuItems mi ON mi.weekly_menu_id = wm.id
        WHERE wm.dining_hall_id = ?
        AND wm.week_start_date = (
            SELECT MAX(week_start_date)
            FROM WeeklyMenus
            WHERE dining_hall_id = ?
        )
        ORDER BY
            CASE wm.day_of_week
                WHEN 'Monday' THEN 1
                WHEN 'Tuesday' THEN 2
                WHEN 'Wednesday' THEN 3
                WHEN 'Thursday' THEN 4
                WHEN 'Friday' THEN 5
                WHEN 'Saturday' THEN 6
                WHEN 'Sunday' THEN 7
            END,
            mt.id
    `;
    
    db.query(query, [req.params.id, req.params.id], (err, results) => {
        if (err) {
            handleDatabaseError(err, res);
            return;
        }
        
        // Transform the results into a nested structure
        const weeklyMenu = {};
        results.forEach(item => {
            if (!weeklyMenu[item.day_of_week]) {
                weeklyMenu[item.day_of_week] = {};
            }
            if (!weeklyMenu[item.day_of_week][item.meal_name]) {
                weeklyMenu[item.day_of_week][item.meal_name] = [];
            }
            weeklyMenu[item.day_of_week][item.meal_name].push({
                id: item.item_id,
                name: item.item_name,
                dietary_info: item.dietary_info
            });
        });
        
        res.json(weeklyMenu);
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    db.query('SELECT 1', (err) => {
        if (err) {
            res.status(500).json({ status: 'error', message: 'Database connection failed' });
            return;
        }
        res.json({ status: 'healthy', message: 'Server is running and database is connected' });
    });
});

// Error handling for undefined routes
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: 'An unexpected error occurred',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// shutdown server
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Closing HTTP server and database connection...');
    db.end(() => {
        console.log('Database connection closed.');
        process.exit(0);
    });
});