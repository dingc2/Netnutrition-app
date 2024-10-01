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

        # Close the dining hall dropdown
        dining_hall_dropdown.click()

        # Wait for the date dropdown to be available (the second dropdown)
        try:
            date_dropdown = WebDriverWait(driver, 10).until(
                EC.element_to_be_clickable((By.ID, "dropdownDateButton"))
            )
            date_dropdown.click()

            # Wait for date options to be visible and select from the second item onwards
            date_options = WebDriverWait(driver, 10).until(
                EC.visibility_of_all_elements_located((By.CSS_SELECTOR, "#nav-date-selector .dropdown-item"))
            )[1:]  # Get all date options starting from the second item

            # Loop through the date options
            for date_option in date_options:
                date_name = date_option.get_attribute("innerText").strip()
                print(f"Date: {date_name}")  # Print the date
                
                # Click the date using JavaScript
                driver.execute_script("arguments[0].click();", date_option)

                # Refresh the date options without waiting
                date_options = driver.find_elements(By.CSS_SELECTOR, "#nav-date-selector .dropdown-item")[1:]

            # Go back to the dining hall dropdown for the next iteration
            dining_hall_dropdown.click()
            dining_halls = driver.find_elements(By.CSS_SELECTOR, "#nav-unit-selector .dropdown-item a")  # Refresh dining halls

        except Exception as e:
            print("Error interacting with date dropdown:", e)
            # Close the dining hall dropdown if there's an error
            dining_hall_dropdown.click()

except Exception as e:
    print("Error during dining hall iteration:", e)

# Close the browser
driver.quit()
