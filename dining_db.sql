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
CREATE TABLE Hours (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dining_hall_id INT,
    day_of_week VARCHAR(20),
    opening_time TIME,
    closing_time TIME,
    FOREIGN KEY (dining_hall_id) REFERENCES DiningHalls(id)
);
CREATE TABLE MenuItems (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dining_hall_id INT,
    item_name VARCHAR(255),
    dietary_info VARCHAR(255),
    FOREIGN KEY (dining_hall_id) REFERENCES DiningHalls(id)
);