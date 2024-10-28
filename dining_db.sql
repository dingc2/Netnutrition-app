-- Drop the existing database if it exists
DROP DATABASE IF EXISTS dining_db;

-- Create the new database
CREATE DATABASE dining_db;

-- Use the new database
USE dining_db;

CREATE TABLE DiningHalls (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE MealTypes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    meal_name VARCHAR(50) NOT NULL  -- 'breakfast', 'lunch', 'dinner'
);

CREATE TABLE Hours (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dining_hall_id INT,
    day_of_week VARCHAR(20),
    meal_type_id INT,  -- Added column for meal type
    opening_time TIME,
    closing_time TIME,
    FOREIGN KEY (dining_hall_id) REFERENCES DiningHalls(id),
    FOREIGN KEY (meal_type_id) REFERENCES MealTypes(id)
);



CREATE TABLE WeeklyMenus (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dining_hall_id INT,
    meal_type_id INT,
    day_of_week VARCHAR(20),
    week_start_date DATE,
    FOREIGN KEY (dining_hall_id) REFERENCES DiningHalls(id),
    FOREIGN KEY (meal_type_id) REFERENCES MealTypes(id)
);

CREATE TABLE MenuItems (
    id INT AUTO_INCREMENT PRIMARY KEY,
    weekly_menu_id INT,
    item_name VARCHAR(255),
    dietary_info VARCHAR(255),
    FOREIGN KEY (weekly_menu_id) REFERENCES WeeklyMenus(id)
);

CREATE TABLE NutritionalInfo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    menu_item_id INT,
    serving_size VARCHAR(50),
    calories INT,
    protein_g DECIMAL(5,2),
    carbohydrates_g DECIMAL(5,2),
    fat_g DECIMAL(5,2),
    fiber_g DECIMAL(5,2),
    sodium_mg INT,
    allergens TEXT,
    FOREIGN KEY (menu_item_id) REFERENCES MenuItems(id)
);

-- Insert default meal types
INSERT INTO MealTypes (meal_name) VALUES 
    ('breakfast'),
    ('lunch'),
    ('dinner');
    
    