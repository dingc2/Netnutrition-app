from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import ElementClickInterceptedException, TimeoutException
from webdriver_manager.chrome import ChromeDriverManager
import concurrent.futures
import time
import csv
import os
import threading

# Cache to store previously scraped nutritional information
nutrition_cache = {}

# Load existing nutrition data into cache
nutrition_csv_filename = "nutrition_info.csv"
if os.path.exists(nutrition_csv_filename):
    with open(nutrition_csv_filename, mode='r', newline='', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            nutrition_cache[row["Food Name"]] = row

# Create a lock object for thread-safe CSV writing
write_lock = threading.Lock()

def create_driver():
    # Configure Chrome options for headless mode
    options = Options()
    # options.add_argument("--headless")  # Run Chrome in headless mode
    options.add_argument("--disable-gpu")  # Disable GPU hardware acceleration
    options.add_argument("--window-size=1920,1080")  # Set the window size to ensure everything fits correctly
    options.add_argument("--no-sandbox")  # Bypass OS security model
    options.add_argument("--disable-dev-shm-usage")  # Overcome limited resource problems

    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
    url = "https://netnutrition.cbord.com/nn-prod/vucampusdining"
    driver.get(url)

    # Handle the pop-up modal
    try:
        WebDriverWait(driver, 10).until(
            EC.visibility_of_element_located((By.ID, "cbo_nn_mobileDisclaimer"))
        )
        continue_button = driver.find_element(By.XPATH, '//button[@aria-label="Continue"]')
        continue_button.click()
        print("Pop-up closed successfully!")
    except Exception as e:
        print(f"An error occurred while closing the pop-up: {e}")

    time.sleep(0.5)  # Wait for the page to fully load

    return driver

def wait_and_click(driver, by_locator, retries=5):
    """
    Wait for an element to be clickable and attempt to click it with retries.
    """
    for attempt in range(retries):
        try:
            element = WebDriverWait(driver, 15).until(
                EC.element_to_be_clickable(by_locator)
            )
            driver.execute_script("arguments[0].scrollIntoView(true);", element)
            element.click()
            return True
        except ElementClickInterceptedException:
            # Handle modals if they're blocking
            try:
                close_buttons = driver.find_elements(By.XPATH, "//button[contains(@id, 'btn_nn_nutrition_close')]")
                for button in close_buttons:
                    if button.is_displayed():
                        button.click()
                        WebDriverWait(driver, 10).until(EC.invisibility_of_element(button))
            except Exception as e:
                print(f"Error ensuring modal is closed: {e}")

            time.sleep(1)  # Small delay before retrying
            print(f"Retrying click for {by_locator}. Attempt {attempt + 1}")
    return False


def wait_for_page_transition(driver, element_to_appear, timeout=20):
    """
    Wait for a specific element to appear after a page transition.
    """
    WebDriverWait(driver, timeout).until(
        EC.visibility_of_element_located(element_to_appear)
    )
    time.sleep(1)  # Adding a slight delay for stability

def scrape_meals_for_hall(hall_index, hall_name):
    driver = create_driver()
    csv_filename = "dining_meals_nutrition.csv"

    try:
        # Click dropdown to open dining halls list for each iteration
        if not wait_and_click(driver, (By.ID, "dropdownUnitButton")):
            print("Failed to click dining halls dropdown.")
            return

        print("Dining halls dropdown clicked!")

        # Retry mechanism for refreshing the dining halls element list
        retries = 5
        dining_halls = []
        for attempt in range(retries):
            dining_halls = driver.find_elements(By.XPATH, "//a[@data-unitoid!='-1']")
            if len(dining_halls) > 0:
                break
            print(f"Attempt {attempt + 1} to load dining halls failed, retrying...")
            time.sleep(3)

        if len(dining_halls) == 0:
            print("Failed to load dining halls after retries.")
            return

        # Click on the current dining hall
        hall = dining_halls[hall_index]
        hall.click()
        print(f"Clicked on dining hall: {hall_name}")
        wait_for_page_transition(driver, (By.ID, "cbo_nn_HeaderSelectedUnit"))

        time.sleep(2)  # Give time for the dining hall to load properly

        # Iterate over all available dates
        if not wait_and_click(driver, (By.ID, "dropdownDateButton")):
            print("Failed to click date dropdown.")
            return

        print("Date dropdown clicked!")

        # Retry mechanism for date selection
        dates = driver.find_elements(By.XPATH, "//a[@data-type='DT' and @data-date!='Show All Dates']")
        date_values = [date.get_attribute("data-date") for date in dates]

        if not date_values:
            print(f"No dates available for dining hall: {hall_name}")

        for date_value in date_values:
            for attempt in range(retries):
                try:
                    if not wait_and_click(driver, (By.ID, "dropdownDateButton")):
                        print(f"Failed to click date dropdown for date: {date_value}")
                        continue

                    date_option = WebDriverWait(driver, 20).until(
                        EC.visibility_of_element_located((By.XPATH, f"//a[@data-date='{date_value}']"))
                    )
                    driver.execute_script("arguments[0].click();", date_option)
                    print(f"Selected date: {date_value}")
                    break
                except TimeoutException:
                    print(f"Attempt {attempt + 1} to click on date {date_value} failed, retrying...")
                    time.sleep(2)
                    if attempt == retries - 1:
                        raise

            time.sleep(2)  # Wait for the date to be applied

            meal_times = ["Breakfast", "Lunch", "Dinner", "Daily Offerings", "Brunch"]

            # Iterate over all meal times
            for meal_time in meal_times:
                try:
                    if not wait_and_click(driver, (By.ID, "dropdownMealButton")):
                        print(f"Failed to click meal dropdown for meal: {meal_time}")
                        continue

                    meal_option = WebDriverWait(driver, 20).until(
                        EC.element_to_be_clickable((By.XPATH, f"//a[@title='{meal_time}']"))
                    )
                    meal_option.click()
                    print(f"Selected {meal_time}")

                    time.sleep(2)  # Allow time for meal content to load

                    # Check if there are meal items available
                    if check_meal_items(driver):
                        print(f"Meal items found for {meal_time} at {hall_name} on {date_value}")
                        expand_meal_items(driver)
                        scrape_nutritional_info(driver, hall_name, meal_time, date_value, csv_filename)
                    else:
                        print(f"No meal items available for {meal_time} at {hall_name} on {date_value}, skipping.")

                except Exception as e:
                    print(f"Error scraping {meal_time} at {hall_name} on {date_value}: {e}")
                    continue

    except Exception as e:
        print(f"Error scraping dining hall {hall_name}: {e}")
    finally:
        try:
            driver.quit()
        except Exception as e:
            print(f"Error while quitting the driver: {e}")


def check_meal_items(driver):
    """
    Check if meal items are available on the page.
    """
    try:
        meal_items = driver.find_elements(By.XPATH, ".//a[contains(@class, 'cbo_nn_itemHover')]")
        return len(meal_items) > 0
    except Exception as e:
        print(f"Error checking meal items: {e}")
        return False

def expand_meal_items(driver):
    """
    Expands the entire table holding the meal items by clicking all collapsible sections.
    """
    try:
        item_groups = driver.find_elements(By.CLASS_NAME, "cbo_nn_itemGroupRow")

        for group in item_groups:
            try:
                # Extract group (category) name
                category_name = group.find_element(By.XPATH, ".//div[@role='button']").text.strip()

                # Expand if it's collapsed (aria-expanded is "false")
                if group.get_attribute("aria-expanded") == "false":
                    group.click()
                    time.sleep(0.5)  # Give time for items to load after expanding
                    print(f"Expanded a meal item group: {category_name}")

                # Attach category name to the elements within this group
                meal_items = group.find_elements(By.XPATH, "following-sibling::tr[contains(@class, 'cbo_nn_itemPrimaryRow')]")
                for item in meal_items:
                    driver.execute_script("arguments[0].setAttribute('data-category', arguments[1]);", item, category_name)

            except Exception as e:
                print(f"Error while expanding a meal group: {e}")
                continue

    except Exception as e:
        print(f"Error expanding meal items: {e}")

def scrape_nutritional_info(driver, hall_name, meal_time, date_value, csv_filename):
    """
    Scrape the nutritional info by clicking each meal item and fetching data from the pop-up.
    """
    try:
        # Get all rows in the meal table (including category and item rows)
        meal_rows = driver.find_elements(By.XPATH, ".//tr[contains(@class, 'cbo_nn_item')]")

        current_category = None

        for row in meal_rows:
            # Check if the row is a category row (cbo_nn_itemGroupRow)
            if 'cbo_nn_itemGroupRow' in row.get_attribute('class'):
                try:
                    # Extract category name
                    current_category = row.find_element(By.XPATH, ".//div[@role='button']").text.strip()
                    print(f"New category detected: {current_category}")
                except Exception as e:
                    print(f"Error extracting category: {e}")
                    current_category = "Unknown"
            # Check if the row is an item row (cbo_nn_itemPrimaryRow or cbo_nn_itemAlternateRow)
            elif 'cbo_nn_itemPrimaryRow' in row.get_attribute('class') or 'cbo_nn_itemAlternateRow' in row.get_attribute('class'):
                try:
                    # Extract item details
                    item_name_element = row.find_element(By.XPATH, ".//a[contains(@class, 'cbo_nn_itemHover')]")
                    item_name = item_name_element.text.strip()

                    # Extract item attributes (filters)
                    filter_attributes = {
                        "Alcohol": False,
                        "Coconut": False,
                        "Dairy": False,
                        "Egg": False,
                        "Fish": False,
                        "Gluten": False,
                        "Peanut": False,
                        "Pork": False,
                        "Sesame": False,
                        "Shellfish": False,
                        "Soy": False,
                        "Tree Nut": False,
                        "Cage Free Certified": False,
                        "Certified Organic": False,
                        "Halal": False,
                        "Humanely Raised & Handled": False,
                        "Kosher": False,
                        "Local": False,
                        "Vegan": False,
                        "Vegetarian": False
                    }

                    # Find filter icons
                    filter_icons = item_name_element.find_elements(By.XPATH, ".//span[@class='pl-2']/img")
                    for icon in filter_icons:
                        filter_name = icon.get_attribute("title")
                        if filter_name in filter_attributes:
                            filter_attributes[filter_name] = True

                    # Check if the item is already in cache
                    if item_name in nutrition_cache:
                        print(f"Using cached data for item: {item_name}")
                        nutrition_info = nutrition_cache[item_name]
                        food_id = nutrition_info["Food ID"]
                    else:
                        # Click to open nutritional information
                        try:
                            print(f"Clicking on item: {item_name}")
                            driver.execute_script("arguments[0].click();", item_name_element)
                            time.sleep(0.5)

                            # Extract meal name and nutrition info
                            meal_name, nutrition_info = get_nutritional_info(driver)

                            # Assign a new Food ID and add the nutritional information to cache
                            food_id = len(nutrition_cache) + 1
                            nutrition_info["Food ID"] = food_id
                            nutrition_cache[item_name] = nutrition_info

                            # Save the nutritional information to the nutrition CSV if not already saved
                            with write_lock:
                                with open(nutrition_csv_filename, mode='a', newline='', encoding='utf-8') as file:
                                    writer = csv.writer(file)
                                    if file.tell() == 0:
                                        # Write header if the file is empty
                                        writer.writerow(["Food ID", "Food Name", "Serving Size", "Calories", "Calories from Fat", "Total Fat", "Total Fat %", "Saturated Fat", "Saturated Fat %", "Trans Fat", "Cholesterol", "Cholesterol %", "Sodium", "Sodium %", "Potassium", "Potassium %", "Total Carbohydrates", "Total Carbohydrates %", "Dietary Fiber", "Dietary Fiber %", "Sugars", "Protein", "Protein %", "Vitamin A %", "Vitamin C %", "Calcium %", "Iron %", "Vitamin D %", "Ingredients", "Alcohol", "Coconut", "Dairy", "Egg", "Fish", "Gluten", "Peanut", "Pork", "Sesame", "Shellfish", "Soy", "Tree Nut", "Cage Free Certified", "Certified Organic", "Halal", "Humanely Raised & Handled", "Kosher", "Local", "Vegan", "Vegetarian"])
                                    writer.writerow([food_id, item_name] + list(nutrition_info.values()) + list(filter_attributes.values()))

                        except Exception as e:
                            print(f"Error scraping nutrition info for {item_name}: {e}")
                            continue

                    # Write to dining_meals_nutrition CSV
                    with write_lock:
                        with open(csv_filename, mode='a', newline='', encoding='utf-8') as file:
                            writer = csv.writer(file)
                            writer.writerow([food_id, hall_name, date_value, meal_time, item_name, current_category])

                    # Close the nutrition pop-up if it's open
                    try:
                        close_button = driver.find_element(By.ID, "btn_nn_nutrition_close")
                        if close_button.is_displayed():
                            close_button.click()
                            time.sleep(1)
                    except Exception:
                        pass

                except Exception as e:
                    print(f"Error scraping meal item: {e}")
                    continue

    except Exception as e:
        print(f"Error while scraping meal items: {e}")

def get_nutritional_info(driver):
    """
    Extract meal name and nutritional info from the pop-up.
    """
    try:
        meal_name = driver.find_element(By.CLASS_NAME, "cbo_nn_LabelHeader").text

        nutrition_info = {}

        # Extract serving size
        try:
            serving_size_element = driver.find_element(By.CLASS_NAME, "cbo_nn_LabelBottomBorderLabel")
            nutrition_info["Serving Size"] = serving_size_element.text.split(':')[1].strip()
        except:
            nutrition_info["Serving Size"] = "N/A"

        # Extract calories and calories from fat
        try:
            calories_row = driver.find_element(By.XPATH, "//td[contains(text(), 'Calories')]/../..")
            cells = calories_row.find_elements(By.TAG_NAME, "td")
            if len(cells) == 2:
                nutrition_info["Calories"] = cells[0].find_element(By.CLASS_NAME, "cbo_nn_SecondaryNutrient").text.strip()
                nutrition_info["Calories from Fat"] = cells[1].find_element(By.CLASS_NAME, "cbo_nn_SecondaryNutrient").text.strip()
            else:
                nutrition_info["Calories"] = "N/A"
                nutrition_info["Calories from Fat"] = "N/A"
        except:
            nutrition_info["Calories"] = "N/A"
            nutrition_info["Calories from Fat"] = "N/A"

        # Extract other nutrition information
        nutrient_rows = driver.find_elements(By.XPATH, "//table[@style='width:100%;']//tr")
        for row in nutrient_rows:
            # Skip the row if it contains calories information to prevent re-adding it
            if "Calories" in row.text:
                continue

            cells = row.find_elements(By.TAG_NAME, "td")
            if len(cells) == 3:
                nutrient_name = cells[0].text.strip()
                nutrient_value = cells[1].text.strip()
                daily_value = cells[2].text.strip() if len(cells) > 2 else ""

                # Handle Total Carbohydrates separately
                if nutrient_name == "Total Carbohydrate":
                    nutrition_info["Total Carbohydrates"] = nutrient_value
                    nutrition_info["Total Carbohydrates %"] = daily_value
                # Only store percentage if it exists
                elif nutrient_name not in ["Trans Fat", "Sugars"]:
                    nutrition_info[nutrient_name] = nutrient_value
                    if daily_value:
                        nutrition_info[f"{nutrient_name} %"] = daily_value
                else:
                    nutrition_info[nutrient_name] = nutrient_value

        # Extract vitamin information (percent only)
        vitamin_rows = driver.find_elements(By.CLASS_NAME, "cbo_nn_SecondaryNutrientLabel")
        for vitamin_row in vitamin_rows:
            try:
                vitamin_name = vitamin_row.text.strip()
                vitamin_value = vitamin_row.find_element(By.XPATH, "following-sibling::td").text.strip()
                if vitamin_value.endswith("%"):
                    nutrition_info[f"{vitamin_name} %"] = vitamin_value
            except:
                continue

        # Extract Vitamin D specifically if not captured earlier
        try:
            vitamin_d_row = driver.find_elements(By.XPATH, "//tr[td[contains(text(), 'Vitamin D')]]")
            if vitamin_d_row:
                vitamin_d_cells = vitamin_d_row[0].find_elements(By.TAG_NAME, "td")
                if len(vitamin_d_cells) == 2:
                    nutrition_info["Vitamin D %"] = vitamin_d_cells[1].text.strip()
        except:
            nutrition_info["Vitamin D %"] = "N/A"

        # Extract ingredients
        try:
            ingredient_element = driver.find_elements(By.CLASS_NAME, "cbo_nn_LabelIngredients")
            if ingredient_element:
                nutrition_info["Ingredients"] = ingredient_element[0].text.strip()
            else:
                nutrition_info["Ingredients"] = "N/A"
        except:
            nutrition_info["Ingredients"] = "N/A"

        return meal_name, nutrition_info
    except Exception as e:
        print(f"Error getting nutritional info: {e}")
        return None, None

def parse_nutritional_info(nutrition_info):
    """
    Parse the nutritional information text into a dictionary.
    """
    return nutrition_info

def main():
    start_time = time.time()

    # Create initial driver to get the list of dining halls
    driver = create_driver()
    if wait_and_click(driver, (By.ID, "dropdownUnitButton")):
        print("Dining halls dropdown clicked!")
    else:
        print("Failed to click dining halls dropdown.")
        return

    # Get all dining halls (excluding 'Show All Units')
    dining_halls = driver.find_elements(By.XPATH, "//a[@data-unitoid!='-1']")
    dining_hall_names = [hall.get_attribute("title") for hall in dining_halls]

    driver.quit()

    # Recreate the CSV file to start with a blank file for each new run
    csv_filename = "dining_meals_nutrition.csv"
    if os.path.exists(csv_filename):
        os.remove(csv_filename)
    with open(csv_filename, mode='w', newline='', encoding='utf-8') as file:
        writer = csv.writer(file)
        writer.writerow(["Food ID", "Dining Hall", "Date", "Meal", "Food Name", "Category"])

    # Use ThreadPoolExecutor to scrape each dining hall in parallel
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
        futures = [executor.submit(scrape_meals_for_hall, i, name) for i, name in enumerate(dining_hall_names)]
        concurrent.futures.wait(futures)

    end_time = time.time()
    total_time = end_time - start_time
    print(f"Total runtime: {total_time:.2f} seconds")

if __name__ == "__main__":
    main()


