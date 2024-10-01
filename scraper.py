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

    # Loop through the dining halls without unnecessary waits
    for dining_hall in dining_halls:
        # Get the visible text of the dining hall (which is the full name)
        dining_hall_name = dining_hall.text.strip()
        print(f"Dining Hall: {dining_hall_name}")  # Print the dining hall name
        
        # Click the dining hall using JavaScript to avoid interactable error
        driver.execute_script("arguments[0].click();", dining_hall)

        # Immediately close the dropdown and select the next dining hall
        dining_hall_dropdown.click()
        
        # Get dining halls again without waiting
        dining_halls = driver.find_elements(By.CSS_SELECTOR, "#nav-unit-selector .dropdown-item a")

except Exception as e:
    print("Error during dining hall iteration:", e)

# Close the browser
driver.quit()
