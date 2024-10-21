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
    url = "https://netnutrition.cbord.com/nn-prod/vucampusdining"  # Replace with the actual dining halls URL
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
    csv_data = []

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
                    scrape_nutritional_info(driver, hall_name, meal_time, csv_data)
                else:
                    print(f"No meal items available for {meal_time} at {hall_name}, skipping.")
                    continue

            except Exception as e:
                print(f"Error scraping {meal_time} at {hall_name}: {e}")
                continue

    return csv_data

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

def scrape_nutritional_info(driver, hall_name, meal_time, csv_data):
    """
    Scrape the nutritional info by clicking each meal item and fetching data from the pop-up.
    """
    try:
        meal_items = driver.find_elements(By.XPATH, ".//a[contains(@class, 'cbo_nn_itemHover')]")

        for index, item in enumerate(meal_items):  # Removed the limit, will scrape all items
            try:
                # Get the category (parent group name)
                category_element = driver.find_element(By.XPATH, "//tr[@class='cbo_nn_itemGroupRow bg-faded js-expanded']/td/div")
                category_name = category_element.text if category_element else "N/A"

                print(f"Clicking on item: {item.text}")
                driver.execute_script("arguments[0].click();", item)  # Click the meal item
                time.sleep(5)

                # Extract meal name and nutrition info
                meal_name, nutrition_info = get_nutritional_info(driver)

                if meal_name and nutrition_info:
                    nutrition_dict = parse_nutritional_info(nutrition_info)
                    csv_data.append([hall_name, time.strftime('%Y-%m-%d'), meal_time, category_name, meal_name, 
                                     nutrition_dict.get("Serving Size", "N/A"),
                                     nutrition_dict.get("Calories", "N/A"),
                                     nutrition_dict.get("Calories from Fat", "N/A"),
                                     nutrition_dict.get("Total Fat", "N/A"),
                                     nutrition_dict.get("Saturated Fat", "N/A"),
                                     nutrition_dict.get("Trans Fat", "N/A"),
                                     nutrition_dict.get("Cholesterol", "N/A"),
                                     nutrition_dict.get("Sodium", "N/A"),
                                     nutrition_dict.get("Potassium", "N/A"),
                                     nutrition_dict.get("Total Carbohydrates", "N/A"),
                                     nutrition_dict.get("Dietary Fiber", "N/A"),
                                     nutrition_dict.get("Sugars", "N/A"),
                                     nutrition_dict.get("Protein", "N/A"),
                                     nutrition_dict.get("Vitamin A", "N/A"),
                                     nutrition_dict.get("Vitamin C", "N/A"),
                                     nutrition_dict.get("Calcium", "N/A"),
                                     nutrition_dict.get("Iron", "N/A"),
                                     nutrition_dict.get("Vitamin D", "N/A"),
                                     nutrition_dict.get("Ingredients", "N/A")])

                # Close the nutrition pop-up
                close_button = WebDriverWait(driver, 10).until(
                    EC.element_to_be_clickable((By.ID, "btn_nn_nutrition_close"))
                )
                close_button.click()
                time.sleep(2)

            except Exception as e:
                print(f"Error scraping nutrition info for {item.text}: {e}")

    except Exception as e:
        print(f"Error while scraping meal items: {e}")

def get_nutritional_info(driver):
    """
    Extract meal name and nutritional info from the pop-up.
    """
    try:
        meal_name = driver.find_element(By.CLASS_NAME, "cbo_nn_LabelHeader").text

        nutrition_label = driver.find_element(By.ID, "nutritionLabel")
        nutrition_info = nutrition_label.text

        return meal_name, nutrition_info
    except Exception as e:
        print(f"Error getting nutritional info: {e}")
        return None, None

def parse_nutritional_info(nutrition_info):
    """
    Parse the nutritional information text into a dictionary.
    """
    nutrition_dict = {}
    lines = nutrition_info.splitlines()

    for line in lines:
        parts = line.split(":")
        if len(parts) == 2:
            key, value = parts
            nutrition_dict[key.strip()] = value.strip()

    return nutrition_dict

def save_to_csv(data, filename):
    """
    Save scraped data to a CSV file.
    """
    with open(filename, mode='w', newline='', encoding='utf-8') as file:
        writer = csv.writer(file)
        writer.writerow(["Dining Hall", "Date", "Meal", "Category", "Food Name", "Serving Size", "Calories", "Calories from Fat", "Total Fat", "Saturated Fat", "Trans Fat", "Cholesterol", "Sodium", "Potassium", "Total Carbohydrates", "Dietary Fiber", "Sugars", "Protein", "Vitamin A", "Vitamin C", "Calcium", "Iron", "Vitamin D", "Ingredients"])
        writer.writerows(data)

def main():
    driver = scrape_dining_halls()
    csv_data = scrape_meals(driver)
    save_to_csv(csv_data, "dining_meals_nutrition.csv")
    driver.quit()

if __name__ == "__main__":
    main()
