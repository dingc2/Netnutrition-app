import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# Set up your browser driver with options for maximizing the window
options = webdriver.ChromeOptions()
options.add_argument("--start-maximized")  # Start the browser maximized
driver = webdriver.Chrome(options=options)

# Open the NetNutrition URL
driver.get('https://netnutrition.cbord.com/nn-prod/vucampusdining')

# Wait for the "Continue" button to appear and click it
try:
    continue_button = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//button[@aria-label='Continue']"))
    )
    continue_button.click()
    print("Clicked 'Continue' button.")
except Exception as e:
    print("Error clicking 'Continue' button:", e)
    driver.quit()
    exit()

# Wait for the dining hall dropdown to be available
try:
    dining_hall_dropdown = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, "dropdownUnitButton"))
    )
    dining_hall_dropdown.click()

    # Get all dining hall options
    dining_halls = driver.find_elements(By.CSS_SELECTOR, "#nav-unit-selector .dropdown-item a")

    # Loop through the dining halls
    for dining_hall in dining_halls:
        # Get the visible text of the dining hall
        dining_hall_name = dining_hall.get_attribute("innerText").strip()
        print(f"Dining Hall: {dining_hall_name}")

        # Click the dining hall using JavaScript
        driver.execute_script("arguments[0].click();", dining_hall)

        # Select "Show All Dates"
        try:
            date_dropdown = WebDriverWait(driver, 10).until(
                EC.element_to_be_clickable((By.ID, "dropdownDateButton"))
            )
            date_dropdown.click()

            # Wait for date options and select "Show All Dates"
            all_dates_option = WebDriverWait(driver, 10).until(
                EC.element_to_be_clickable((By.XPATH, "//a[text()='Show All Dates']"))
            )
            all_dates_option.click()
            print("Selected 'Show All Dates'.")
        except Exception as e:
            print("Error selecting 'Show All Dates':", e)

        # Check for the presence of the menu panel and its content
        time.sleep(2)  # Wait for the content to load
        try:
            menu_list = driver.find_elements(By.CLASS_NAME, "cbo_nn_menuListDiv")
            if menu_list:
                # Check if there's at least one menu item in the list
                menu_items = menu_list[0].find_elements(By.XPATH, ".//a[contains(@class, 'cbo_nn_menuLink')]")
                if menu_items:
                    print("Menu List: Yes")
                else:
                    print("Menu List: No (No menu items found)")
            else:
                print("Menu List: No (Menu list div not found)")
        except Exception as e:
            print("Error checking for menu list class:", e)

        # Go back to the dining hall dropdown for the next iteration
        dining_hall_dropdown.click()

except Exception as e:
    print("Error during dining hall iteration:", e)

# Close the browser
driver.quit()
