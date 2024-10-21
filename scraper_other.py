from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
import time
import csv


def scrape_dining_halls():
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

    time.sleep(3)  # Wait for the page to fully load

    return driver


def wait_for_page_transition(driver, element_to_appear, timeout=20):
    """
    Wait for a specific element to appear after a page transition.
    """
    WebDriverWait(driver, timeout).until(
        EC.visibility_of_element_located(element_to_appear)
    )
    time.sleep(2)  # Adding a slight delay for stability


def scrape_meals(driver):
    meal_times = ["Breakfast", "Lunch", "Dinner"]
    csv_filename = "dining_meals_nutrition.csv"

    # Initialize CSV with headers if it doesn't exist
    with open(csv_filename, mode='w', newline='', encoding='utf-8') as file:
        writer = csv.writer(file)
        writer.writerow(["Dining Hall", "Date", "Meal", "Food Name", "Serving Size", "Calories", "Calories from Fat", "Total Fat", "Total Fat %", "Saturated Fat", "Saturated Fat %", "Trans Fat", "Cholesterol", "Cholesterol %", "Sodium", "Sodium %", "Potassium", "Potassium %", "Total Carbohydrates", "Total Carbohydrates %", "Dietary Fiber", "Dietary Fiber %", "Sugars", "Protein", "Protein %", "Vitamin A %", "Vitamin C %", "Calcium %", "Iron %", "Vitamin D %", "Ingredients", "Alcohol", "Coconut", "Dairy", "Egg", "Fish", "Gluten", "Peanut", "Pork", "Sesame", "Shellfish", "Soy", "Tree Nut", "Cage Free Certified", "Certified Organic", "Halal", "Humanely Raised & Handled", "Kosher", "Local", "Vegan", "Vegetarian"])

    dining_halls_dropdown = WebDriverWait(driver, 15).until(
        EC.element_to_be_clickable((By.ID, "dropdownUnitButton"))
    )
   
    # Get all dining halls (excluding 'Show All Units')
    dining_halls = driver.find_elements(By.XPATH, "//a[@data-unitoid!='-1']")
   
    # Iterate over all dining halls
    for hall_index, hall in enumerate(dining_halls):
        # Click dropdown to open dining halls list for each iteration
        dining_halls_dropdown.click()
        print("Dining halls dropdown clicked!")

        # Refresh the dining halls element list because DOM may update
        dining_halls = driver.find_elements(By.XPATH, "//a[@data-unitoid!='-1']")
       
        # Click on the current dining hall
        hall = dining_halls[hall_index]
        hall_name = hall.get_attribute("title")
       
        try:
            hall.click()
            print(f"Clicked on dining hall: {hall_name}")
            # Wait for the dining hall page to load completely (update this selector to a unique element on the page)
            wait_for_page_transition(driver, (By.ID, "cbo_nn_HeaderSelectedUnit"))
        except Exception as e:
            print(f"Error clicking on {hall_name}: {e}")
            continue

        time.sleep(3)  # Give time for the dining hall to load properly

        # Iterate over all meal times
        for meal_time in meal_times:
            try:
                # Click meal dropdown
                meal_dropdown = WebDriverWait(driver, 15).until(
                    EC.element_to_be_clickable((By.ID, "dropdownMealButton"))
                )
                meal_dropdown.click()
                print(f"Clicked meal dropdown for {meal_time}")

                meal_option = WebDriverWait(driver, 15).until(
                    EC.element_to_be_clickable((By.XPATH, f"//a[@title='{meal_time}']"))
                )
                meal_option.click()
                print(f"Selected {meal_time}")

                time.sleep(5)

                # Check if there are meal items available
                if check_meal_items(driver):
                    print(f"Meal items found for {meal_time} at {hall_name}")
                    # Expand the whole meal item table before scraping
                    expand_meal_items(driver)

                    # Now scrape the nutritional info for all items
                    scrape_nutritional_info(driver, hall_name, meal_time, csv_filename)
                else:
                    print(f"No meal items available for {meal_time} at {hall_name}, skipping.")
                    continue

            except Exception as e:
                print(f"Error scraping {meal_time} at {hall_name}: {e}")
                continue


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
                # Expand if it's collapsed (aria-expanded is "false")
                if group.get_attribute("aria-expanded") == "false":
                    group.click()
                    time.sleep(1)  # Give time for items to load after expanding
                    print("Expanded a meal item group")
            except Exception as e:
                print(f"Error while expanding a meal group: {e}")
                continue

    except Exception as e:
        print(f"Error expanding meal items: {e}")


def scrape_nutritional_info(driver, hall_name, meal_time, csv_filename):
    """
    Scrape the nutritional info by clicking each meal item and fetching data from the pop-up.
    """
    try:
        meal_items = driver.find_elements(By.XPATH, ".//a[contains(@class, 'cbo_nn_itemHover')]")

        for index, item in enumerate(meal_items):  # Removed the limit, will scrape all items
            try:
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
                filter_icons = item.find_elements(By.XPATH, ".//span[@class='pl-2']/img")
                for icon in filter_icons:
                    filter_name = icon.get_attribute("title")
                    if filter_name in filter_attributes:
                        filter_attributes[filter_name] = True

                print(f"Clicking on item: {item.text}")
                driver.execute_script("arguments[0].click();", item)  # Click the meal item
                time.sleep(5)

                # Extract meal name and nutrition info
                meal_name, nutrition_info = get_nutritional_info(driver)

                # Write to CSV regardless of success in extracting all fields
                nutrition_dict = parse_nutritional_info(nutrition_info) if nutrition_info else {}
                row = [hall_name, time.strftime('%Y-%m-%d'), meal_time, 
                       meal_name if meal_name else "N/A",
                       nutrition_dict.get("Serving Size", "N/A"),
                       nutrition_dict.get("Calories", "N/A"),
                       nutrition_dict.get("Calories from Fat", "N/A"),
                       nutrition_dict.get("Total Fat", "N/A"),
                       nutrition_dict.get("Total Fat %", "N/A"),
                       nutrition_dict.get("Saturated Fat", "N/A"),
                       nutrition_dict.get("Saturated Fat %", "N/A"),
                       nutrition_dict.get("Trans Fat", "N/A"),
                       nutrition_dict.get("Cholesterol", "N/A"),
                       nutrition_dict.get("Cholesterol %", "N/A"),
                       nutrition_dict.get("Sodium", "N/A"),
                       nutrition_dict.get("Sodium %", "N/A"),
                       nutrition_dict.get("Potassium", "N/A"),
                       nutrition_dict.get("Potassium %", "N/A"),
                       nutrition_dict.get("Total Carbohydrates", "N/A"),
                       nutrition_dict.get("Total Carbohydrates %", "N/A"),
                       nutrition_dict.get("Dietary Fiber", "N/A"),
                       nutrition_dict.get("Dietary Fiber %", "N/A"),
                       nutrition_dict.get("Sugars", "N/A"),
                       nutrition_dict.get("Protein", "N/A"),
                       nutrition_dict.get("Protein %", "N/A"),
                       nutrition_dict.get("Vitamin A %", "N/A"),
                       nutrition_dict.get("Vitamin C %", "N/A"),
                       nutrition_dict.get("Calcium %", "N/A"),
                       nutrition_dict.get("Iron %", "N/A"),
                       nutrition_dict.get("Vitamin D %", "N/A"),
                       nutrition_dict.get("Ingredients", "N/A")]

                # Add filter attributes to the row
                row.extend([filter_attributes[filter] for filter in filter_attributes])

                # Write the row to CSV immediately
                with open(csv_filename, mode='a', newline='', encoding='utf-8') as file:
                    writer = csv.writer(file)
                    writer.writerow(row)

                # Close the nutrition pop-up
                close_button = WebDriverWait(driver, 10).until(
                    EC.element_to_be_clickable((By.ID, "btn_nn_nutrition_close"))
                )
                close_button.click()
                time.sleep(2)

            except Exception as e:
                print(f"Error scraping nutrition info for {item.text}: {e}")
                # Write to CSV with only the available information if an error occurs
                row = [hall_name, time.strftime('%Y-%m-%d'), meal_time, 
                       item.text if item.text else "N/A",
                       "N/A", "N/A", "N/A", "N/A", "N/A", "N/A", "N/A", "N/A", "N/A", "N/A", "N/A", "N/A", "N/A", "N/A", "N/A", "N/A", "N/A", "N/A", "N/A", "N/A", "N/A", "N/A", "N/A", "N/A", "N/A", "N/A", "N/A"]
                row.extend([filter_attributes[filter] for filter in filter_attributes])
                with open(csv_filename, mode='a', newline='', encoding='utf-8') as file:
                    writer = csv.writer(file)
                    writer.writerow(row)

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
    driver = scrape_dining_halls()
    scrape_meals(driver)
    driver.quit()


if __name__ == "__main__":
    main()
