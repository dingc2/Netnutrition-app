USE dining_halls;

DROP TABLE IF EXISTS dining_hours;
-- Create the initial table
CREATE TABLE dining_hours (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dining_hall VARCHAR(100),
    day VARCHAR(20),
    breakfast VARCHAR(50),
    lunch VARCHAR(50),
    dinner VARCHAR(50),
    dummy VARCHAR(1)
);


-- Load the CSV data
LOAD DATA INFILE '/Users/sung-linhsieh/Desktop/Netnutrition-app/dininghall_hours.csv'
INTO TABLE dining_hours
FIELDS TERMINATED BY ','
LINES TERMINATED BY '\n'
IGNORE 1 LINES
(dining_hall, day, breakfast, lunch, dinner, @dummy);

DROP TABLE IF EXISTS dining_halls_times;
-- Create a new table with split time intervals
CREATE TABLE dining_halls_times (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dining_hall VARCHAR(100),
    day VARCHAR(20),
    breakfast_open TIME,
    breakfast_close TIME,
    lunch_open TIME,
    lunch_close TIME,
    dinner_open TIME,
    dinner_close TIME
);

INSERT INTO dining_halls_times (
    dining_hall,
    day,
    breakfast_open,
    breakfast_close,
    lunch_open,
    lunch_close,
    dinner_open,
    dinner_close
)
SELECT 
    dining_hall,
    day,
    CASE 
        WHEN breakfast = 'CLOSED' THEN NULL 
        ELSE STR_TO_DATE(SUBSTRING_INDEX(breakfast, '-', 1), '%l:%i%p')
    END AS breakfast_open,
    CASE 
        WHEN breakfast = 'CLOSED' THEN NULL 
        ELSE STR_TO_DATE(SUBSTRING_INDEX(breakfast, '-', -1), '%l:%i%p')
    END AS breakfast_close,
    CASE 
        WHEN lunch = 'CLOSED' THEN NULL 
        ELSE STR_TO_DATE(SUBSTRING_INDEX(lunch, '-', 1), '%l:%i%p')
    END AS lunch_open,
    CASE 
        WHEN lunch = 'CLOSED' THEN NULL 
        ELSE STR_TO_DATE(SUBSTRING_INDEX(lunch, '-', -1), '%l:%i%p')
    END AS lunch_close,
    CASE 
        WHEN dinner = 'CLOSED' THEN NULL 
        ELSE STR_TO_DATE(SUBSTRING_INDEX(dinner, '-', 1), '%l:%i%p')
    END AS dinner_open,
    CASE 
        WHEN dinner = 'CLOSED' THEN NULL 
        ELSE STR_TO_DATE(SUBSTRING_INDEX(dinner, '-', -1), '%l:%i%p')
    END AS dinner_close
FROM dining_hours;