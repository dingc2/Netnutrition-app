-- Insert new dining halls
INSERT INTO DiningHalls (name) VALUES 
    ('Rothschild Dining Hall'),
    ('Rand Dining Center'),
    ('The Pub'),
    ('Commons'),
    ('E. Bronson Ingram'),
    ('Zeppos'),
    ('The Kitchen at Kissam');

-- Insert new dining hours for each dining hall
INSERT INTO Hours (dining_hall_id, day_of_week, meal_type_id, opening_time, closing_time) VALUES
    
    (1, 'Monday', 1, '07:00:00', '09:30:00'),  -- Breakfast
    (1, 'Monday', 2, '11:30:00', '14:00:00'),  -- Lunch
    (1, 'Monday', 3, '17:30:00', '20:00:00'),  -- Dinner
    (1, 'Tuesday', 1, '07:00:00', '09:30:00'),
    (1, 'Tuesday', 2, '11:30:00', '14:00:00'),
    (1, 'Tuesday', 3, '17:30:00', '20:00:00'),
  
    (2, 'Monday', 1, '07:30:00', '10:00:00'),
    (2, 'Monday', 2, '11:00:00', '14:30:00'),
    (2, 'Monday', 3, '17:00:00', '21:00:00'),
    (2, 'Tuesday', 1, '07:30:00', '10:00:00'),
    (2, 'Tuesday', 2, '11:00:00', '14:30:00'),
    (2, 'Tuesday', 3, '17:00:00', '21:00:00'),
   
    (3, 'Monday', 1, '07:00:00', '10:30:00'),
    (3, 'Monday', 2, '11:00:00', '14:00:00'),
    (3, 'Monday', 3, '17:00:00', '21:00:00'),
    (3, 'Tuesday', 1, '07:00:00', '10:30:00'),
    (3, 'Tuesday', 2, '11:00:00', '14:00:00'),
    (3, 'Tuesday', 3, '17:00:00', '21:00:00'),
   
    (4, 'Monday', 1, '08:00:00', '10:30:00'),
    (4, 'Monday', 2, '11:00:00', '14:30:00'),
    (4, 'Monday', 3, '17:00:00', '21:00:00'),
    (4, 'Tuesday', 1, '08:00:00', '10:30:00'),
    (4, 'Tuesday', 2, '11:00:00', '14:30:00'),
    (4, 'Tuesday', 3, '17:00:00', '21:00:00'),
  
    (5, 'Monday', 1, '07:30:00', '09:30:00'),
    (5, 'Monday', 2, '11:30:00', '13:30:00'),
    (5, 'Monday', 3, '17:30:00', '20:00:00'),
    (5, 'Tuesday', 1, '07:30:00', '09:30:00'),
    (5, 'Tuesday', 2, '11:30:00', '13:30:00'),
    (5, 'Tuesday', 3, '17:30:00', '20:00:00'),
  
    (6, 'Monday', 1, '08:00:00', '10:00:00'),
    (6, 'Monday', 2, '11:00:00', '14:00:00'),
    (6, 'Monday', 3, '16:00:00', '19:00:00'),
    (6, 'Tuesday', 1, '08:00:00', '10:00:00'),
    (6, 'Tuesday', 2, '11:00:00', '14:00:00'),
    (6, 'Tuesday', 3, '16:00:00', '19:00:00'),
    
    (7, 'Monday', 1, '07:00:00', '09:30:00'),
    (7, 'Monday', 2, '11:30:00', '14:00:00'),
    (7, 'Monday', 3, '17:30:00', '20:00:00'),
    (7, 'Tuesday', 1, '07:00:00', '09:30:00'),
    (7, 'Tuesday', 2, '11:30:00', '14:00:00'),
    (7, 'Tuesday', 3, '17:30:00', '20:00:00');


INSERT INTO WeeklyMenus (dining_hall_id, meal_type_id, day_of_week, week_start_date) VALUES
    -- Monday
    (1, 1, 'Monday', '2024-10-21'),    -- Breakfast
    (1, 2, 'Monday', '2024-10-21'),    -- Lunch
    (1, 3, 'Monday', '2024-10-21'),    -- Dinner
    -- Tuesday
    (1, 1, 'Tuesday', '2024-10-21'),
    (1, 2, 'Tuesday', '2024-10-21'),
    (1, 3, 'Tuesday', '2024-10-21');

INSERT INTO MenuItems (weekly_menu_id, item_name, dietary_info) VALUES
    (1, 'Classic Oatmeal', 'Vegetarian, Gluten-Free'),
    (1, 'Scrambled Eggs', 'Gluten-Free'),
    (1, 'Whole Grain Toast', 'Vegan'),
    (1, 'Fresh Fruit Bowl', 'Vegan, Gluten-Free'),
    (1, 'Greek Yogurt Parfait', 'Vegetarian'),
    -- Monday lunch
    (2, 'Grilled Chicken Sandwich', 'Dairy-Free'),
    (2, 'Quinoa Bowl', 'Vegan, Gluten-Free'),
    (2, 'Caesar Salad', 'Vegetarian'),
    (2, 'Tomato Basil Soup', 'Vegetarian, Gluten-Free'),
    -- Monday dinner
    (3, 'Herb-Roasted Salmon', 'Gluten-Free'),
    (3, 'Vegetable Stir-Fry', 'Vegan, Gluten-Free'),
    (3, 'Brown Rice', 'Vegan, Gluten-Free'),
    (3, 'Steamed Broccoli', 'Vegan, Gluten-Free');

-- Insert nutritional information for menu items
INSERT INTO NutritionalInfo (
    menu_item_id, 
    serving_size, 
    calories, 
    protein_g, 
    carbohydrates_g, 
    fat_g, 
    fiber_g, 
    sodium_mg, 
    allergens
) VALUES
    -- Classic Oatmeal
    (1, '1 cup (234g)', 150, 6.0, 27.0, 3.0, 4.0, 100, 'Contains: Oats'),
    -- Scrambled Eggs
    (2, '2 eggs (100g)', 180, 12.0, 2.0, 14.0, 0.0, 350, 'Contains: Eggs'),
    -- Whole Grain Toast
    (3, '2 slices (56g)', 140, 4.0, 28.0, 2.0, 4.0, 200, 'Contains: Wheat'),
    -- Fresh Fruit Bowl
    (4, '1 cup (150g)', 95, 1.0, 24.0, 0.5, 3.0, 0, 'None'),
    -- Greek Yogurt Parfait
    (5, '8 oz (227g)', 220, 14.0, 32.0, 6.0, 3.0, 85, 'Contains: Milk'),
    -- Grilled Chicken Sandwich
    (6, '1 sandwich (250g)', 420, 32.0, 48.0, 12.0, 3.0, 800, 'Contains: Wheat'),
    -- Quinoa Buddha Bowl
    (7, '1 bowl (350g)', 380, 12.0, 58.0, 14.0, 8.0, 450, 'Contains: Tree Nuts'),
    -- Caesar Salad
    (8, '1 bowl (200g)', 320, 10.0, 12.0, 28.0, 3.0, 600, 'Contains: Eggs, Milk, Fish'),
    -- Tomato Basil Soup
    (9, '1 cup (240ml)', 120, 3.0, 22.0, 3.5, 4.0, 850, 'None'),
    -- Herb-Roasted Salmon
    (10, '6 oz (170g)', 350, 34.0, 0.0, 22.0, 0.0, 420, 'Contains: Fish'),
    -- Vegetable Stir-Fry
    (11, '1.5 cups (240g)', 180, 6.0, 32.0, 5.0, 6.0, 520, 'Contains: Soy'),
    -- Brown Rice
    (12, '1 cup (195g)', 220, 5.0, 45.0, 2.0, 3.0, 10, 'None'),
    -- Steamed Broccoli
    (13, '1 cup (156g)', 55, 4.0, 11.0, 0.5, 5.0, 45, 'None');

-- Insert weekly menus for Tuesday
INSERT INTO WeeklyMenus (dining_hall_id, meal_type_id, day_of_week, week_start_date) VALUES
    (1, 1, 'Tuesday', '2024-10-21'),    -- Breakfast
    (1, 2, 'Tuesday', '2024-10-21'),    -- Lunch
    (1, 3, 'Tuesday', '2024-10-21');    -- Dinner

-- Insert menu items for Tuesday
INSERT INTO MenuItems (weekly_menu_id, item_name, dietary_info) VALUES
    -- Tuesday breakfast
    (4, 'Belgian Waffles', 'Vegetarian'),
    (4, 'Turkey Breakfast Sausage', 'Dairy-Free'),
    (4, 'Fresh Berry Medley', 'Vegan, Gluten-Free'),
    -- Tuesday lunch
    (5, 'Turkey Club Sandwich', 'Dairy-Free'),
    (5, 'Vegetarian Chili', 'Vegan, Gluten-Free'),
    (5, 'Garden Salad', 'Vegan, Gluten-Free'),
    -- Tuesday dinner
    (6, 'Grilled Tofu Steak', 'Vegan, Gluten-Free'),
    (6, 'Roasted Sweet Potatoes', 'Vegan, Gluten-Free'),
    (6, 'Sautéed Green Beans', 'Vegan, Gluten-Free');

-- Insert nutritional information for Tuesday's menu items
INSERT INTO NutritionalInfo (
    menu_item_id,
    serving_size,
    calories,
    protein_g,
    carbohydrates_g,
    fat_g,
    fiber_g,
    sodium_mg,
    allergens
) VALUES
    -- Belgian Waffles
    (14, '2 waffles (180g)', 410, 8.0, 56.0, 18.0, 2.0, 680, 'Contains: Wheat, Eggs, Milk'),
    -- Turkey Breakfast Sausage
    (15, '2 links (56g)', 160, 9.0, 1.0, 13.0, 0.0, 430, 'None'),
    -- Fresh Berry Medley
    (16, '1 cup (150g)', 85, 1.0, 21.0, 0.5, 4.0, 0, 'None'),
    -- Turkey Club Sandwich
    (17, '1 sandwich (280g)', 450, 28.0, 48.0, 18.0, 3.0, 980, 'Contains: Wheat'),
    -- Vegetarian Chili
    (18, '1 cup (245g)', 280, 15.0, 42.0, 6.0, 14.0, 600, 'None'),
    -- Garden Salad
    (19, '2 cups (100g)', 35, 2.0, 7.0, 0.0, 3.0, 45, 'None'),
    -- Grilled Tofu Steak
    (20, '6 oz (170g)', 220, 20.0, 9.0, 14.0, 2.0, 380, 'Contains: Soy'),
    -- Roasted Sweet Potatoes
    (21, '1 cup (200g)', 180, 2.0, 41.0, 0.5, 6.0, 70, 'None'),
    -- Sautéed Green Beans
    (22, '1 cup (125g)', 55, 2.0, 10.0, 0.0, 4.0, 160, 'None');