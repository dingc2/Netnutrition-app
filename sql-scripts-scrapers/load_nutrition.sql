USE dining_halls;

DROP TABLE IF EXISTS foods;

CREATE TABLE foods (
    id INT AUTO_INCREMENT PRIMARY KEY,
    food_id INT,
    food_name VARCHAR(255),
    serving_size VARCHAR(50),
    calories INT NULL,
    calories_from_fat INT NULL,
    total_fat VARCHAR(10),
    total_fat_pdv INT,
    saturated_fat VARCHAR(10),
    saturated_fat_pdv INT,
    trans_fat VARCHAR(10),
    cholesterol VARCHAR(10),
    cholesterol_pdv INT,
    sodium VARCHAR(10),
    sodium_pdv INT,
    potassium VARCHAR(10),
    potassium_pdv INT,
    total_carbohydrates VARCHAR(10),
    total_carbohydrates_pdv INT,
    dietary_fiber VARCHAR(10),
    dietary_fiber_pdv INT,
    sugars VARCHAR(10),
    protein VARCHAR(10),
    protein_pdv INT,
    vitamin_a_pdv INT,
    vitamin_c_pdv INT,
    calcium_pdv INT,
    iron_pdv INT,
    vitamin_d_pdv INT,
    ingredients TEXT,
    has_alcohol BOOLEAN,
    has_coconut BOOLEAN,
    has_dairy BOOLEAN,
    has_egg BOOLEAN,
    has_fish BOOLEAN,
    has_gluten BOOLEAN,
    has_peanut BOOLEAN,
    has_pork BOOLEAN,
    has_sesame BOOLEAN,
    has_shellfish BOOLEAN,
    has_soy BOOLEAN,
    has_tree_nut BOOLEAN,
    is_cage_free_certified BOOLEAN,
    is_certified_organic BOOLEAN,
    is_halal BOOLEAN,
    is_humanely_raised BOOLEAN,
    is_kosher BOOLEAN,
    is_local BOOLEAN,
    is_vegan BOOLEAN,
    is_vegetarian BOOLEAN,
    INDEX idx_food_id (food_id)  
);

-- Load data from CSV file
LOAD DATA INFILE '/Users/sung-linhsieh/Desktop/Netnutrition-app/sql-scripts-scrapers/nutrition_info.csv'
IGNORE
INTO TABLE foods
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 LINES
(@food_id, food_name, serving_size, @calories, @calories_from_fat, 
 @total_fat, @total_fat_pdv, @saturated_fat, @saturated_fat_pdv, @trans_fat,
 @cholesterol, @cholesterol_pdv, @sodium, @sodium_pdv, @potassium, @potassium_pdv,
 @total_carbohydrates, @total_carbohydrates_pdv, @dietary_fiber, @dietary_fiber_pdv,
 @sugars, @protein, @protein_pdv, @vitamin_a_pdv, @vitamin_c_pdv,
 @calcium_pdv, @iron_pdv, @vitamin_d_pdv, ingredients,
 @has_alcohol, @has_coconut, @has_dairy, @has_egg, @has_fish, @has_gluten,
 @has_peanut, @has_pork, @has_sesame, @has_shellfish, @has_soy, @has_tree_nut,
 @is_cage_free_certified, @is_certified_organic, @is_halal, @is_humanely_raised,
 @is_kosher, @is_local, @is_vegan, @is_vegetarian)
SET
    food_id = NULLIF(@food_id, ''),
    calories = CASE 
        WHEN @calories IN ('NA', 'N/A', '', 'NULL') THEN NULL 
        ELSE CAST(@calories AS SIGNED)
    END,
    calories_from_fat = CASE 
        WHEN @calories_from_fat IN ('NA', 'N/A', '', 'NULL') THEN NULL 
        ELSE CAST(@calories_from_fat AS SIGNED)
    END,
    total_fat = NULLIF(NULLIF(NULLIF(@total_fat, 'NA'), 'N/A'), ''),
    total_fat_pdv = CASE 
        WHEN @total_fat_pdv IN ('NA', 'N/A', '', '%', 'NULL') THEN NULL 
        ELSE CAST(REGEXP_REPLACE(@total_fat_pdv, '%', '') AS SIGNED)
    END,
    saturated_fat = NULLIF(NULLIF(NULLIF(@saturated_fat, 'NA'), 'N/A'), ''),
    saturated_fat_pdv = CASE 
        WHEN @saturated_fat_pdv IN ('NA', 'N/A', '', '%', 'NULL') THEN NULL 
        ELSE CAST(REGEXP_REPLACE(@saturated_fat_pdv, '%', '') AS SIGNED)
    END,
    trans_fat = NULLIF(NULLIF(NULLIF(@trans_fat, 'NA'), 'N/A'), ''),
    cholesterol = NULLIF(NULLIF(NULLIF(@cholesterol, 'NA'), 'N/A'), ''),
    cholesterol_pdv = CASE 
        WHEN @cholesterol_pdv IN ('NA', 'N/A', '', '%', 'NULL') THEN NULL 
        ELSE CAST(REGEXP_REPLACE(@cholesterol_pdv, '%', '') AS SIGNED)
    END,
    sodium = NULLIF(NULLIF(NULLIF(@sodium, 'NA'), 'N/A'), ''),
    sodium_pdv = CASE 
        WHEN @sodium_pdv IN ('NA', 'N/A', '', '%', 'NULL') THEN NULL 
        ELSE CAST(REGEXP_REPLACE(@sodium_pdv, '%', '') AS SIGNED)
    END,
    potassium = NULLIF(NULLIF(NULLIF(@potassium, 'NA'), 'N/A'), ''),
    potassium_pdv = CASE 
        WHEN @potassium_pdv IN ('NA', 'N/A', '', '%', 'NULL') THEN NULL 
        ELSE CAST(REGEXP_REPLACE(@potassium_pdv, '%', '') AS SIGNED)
    END,
    total_carbohydrates = NULLIF(NULLIF(NULLIF(@total_carbohydrates, 'NA'), 'N/A'), ''),
    total_carbohydrates_pdv = CASE 
        WHEN @total_carbohydrates_pdv IN ('NA', 'N/A', '', '%', 'NULL') THEN NULL 
        ELSE CAST(REGEXP_REPLACE(@total_carbohydrates_pdv, '%', '') AS SIGNED)
    END,
    dietary_fiber = NULLIF(NULLIF(NULLIF(@dietary_fiber, 'NA'), 'N/A'), ''),
    dietary_fiber_pdv = CASE 
        WHEN @dietary_fiber_pdv IN ('NA', 'N/A', '', '%', 'NULL') THEN NULL 
        ELSE CAST(REGEXP_REPLACE(@dietary_fiber_pdv, '%', '') AS SIGNED)
    END,
    sugars = NULLIF(NULLIF(NULLIF(@sugars, 'NA'), 'N/A'), ''),
    protein = NULLIF(NULLIF(NULLIF(@protein, 'NA'), 'N/A'), ''),
    protein_pdv = CASE 
        WHEN @protein_pdv IN ('NA', 'N/A', '', '%', 'NULL') THEN NULL 
        ELSE CAST(REGEXP_REPLACE(@protein_pdv, '%', '') AS SIGNED)
    END,
    vitamin_a_pdv = CASE 
        WHEN @vitamin_a_pdv IN ('NA', 'N/A', '', '%', 'NULL') THEN NULL 
        ELSE CAST(REGEXP_REPLACE(@vitamin_a_pdv, '%', '') AS SIGNED)
    END,
    vitamin_c_pdv = CASE 
        WHEN @vitamin_c_pdv IN ('NA', 'N/A', '', '%', 'NULL') THEN NULL 
        ELSE CAST(REGEXP_REPLACE(@vitamin_c_pdv, '%', '') AS SIGNED)
    END,
    calcium_pdv = CASE 
        WHEN @calcium_pdv IN ('NA', 'N/A', '', '%', 'NULL') THEN NULL 
        ELSE CAST(REGEXP_REPLACE(@calcium_pdv, '%', '') AS SIGNED)
    END,
    iron_pdv = CASE 
        WHEN @iron_pdv IN ('NA', 'N/A', '', '%', 'NULL') THEN NULL 
        ELSE CAST(REGEXP_REPLACE(@iron_pdv, '%', '') AS SIGNED)
    END,
    vitamin_d_pdv = CASE 
        WHEN @vitamin_d_pdv IN ('NA', 'N/A', '', '%', 'NULL') THEN NULL 
        ELSE CAST(REGEXP_REPLACE(@vitamin_d_pdv, '%', '') AS SIGNED)
    END,
    
    has_alcohol = IF(@has_alcohol = 'True', 1, 0),
    has_coconut = IF(@has_coconut = 'True', 1, 0),
    has_dairy = IF(@has_dairy = 'True', 1, 0),
    has_egg = IF(@has_egg = 'True', 1, 0),
    has_fish = IF(@has_fish = 'True', 1, 0),
    has_gluten = IF(@has_gluten = 'True', 1, 0),
    has_peanut = IF(@has_peanut = 'True', 1, 0),
    has_pork = IF(@has_pork = 'True', 1, 0),
    has_sesame = IF(@has_sesame = 'True', 1, 0),
    has_shellfish = IF(@has_shellfish = 'True', 1, 0),
    has_soy = IF(@has_soy = 'True', 1, 0),
    has_tree_nut = IF(@has_tree_nut = 'True', 1, 0),
    is_cage_free_certified = IF(@is_cage_free_certified = 'True', 1, 0),
    is_certified_organic = IF(@is_certified_organic = 'True', 1, 0),
    is_halal = IF(@is_halal = 'True', 1, 0),
    is_humanely_raised = IF(@is_humanely_raised = 'True', 1, 0),
    is_kosher = IF(@is_kosher = 'True', 1, 0),
    is_local = IF(@is_local = 'True', 1, 0),
    is_vegan = IF(@is_vegan = 'True', 1, 0),
    is_vegetarian = IF(@is_vegetarian = 'True', 1, 0);