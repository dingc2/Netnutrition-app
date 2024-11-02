-- Create the database
CREATE DATABASE IF NOT EXISTS dining_halls;
USE dining_halls;

DROP TABLE IF EXISTS menu_items;

CREATE TABLE IF NOT EXISTS menu_items (
    food_id INT,
    dining_hall VARCHAR(100),
    date DATE,
    meal VARCHAR(50),
    food_name VARCHAR(255),
    category VARCHAR(100),
    INDEX idx_food_id (food_id)  
);

-- Load data from CSV file
LOAD DATA INFILE '/Users/sung-linhsieh/Desktop/Netnutrition-app/dining_meals_nutrition.csv'
INTO TABLE menu_items
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(food_id, dining_hall, @date_str, meal, food_name, category)
SET date = CASE 
    WHEN @date_str = 'Today' THEN CURDATE()
    ELSE STR_TO_DATE(@date_str, '%Y/%m/%d')
END;