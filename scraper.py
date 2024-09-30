from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

chrome_options = webdriver.ChromeOptions()
# Add any desired options here, for example, headless mode:
# chrome_options.add_argument("--headless")

# Set up WebDriver using WebDriver Manager
driver = webdriver.Chrome(options=chrome_options)

# Navigate to the website
driver.get("https://netnutrition.cbord.com/nn-prod/vucampusdining")
driver.fullscreen_window()

wait = WebDriverWait(driver, 10)  # Wait up to 10 seconds
driver.save_screenshot('screenshot.png')

# Click the continue button
button = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[@aria-label='Continue']")))
button.click()

# Wait for the dropdown link to be clickable and click it
dropdown = wait.until(EC.element_to_be_clickable((By.ID, "dropdownUnitButton")))
dropdown.click()

# Wait for the dropdown items to be visible
wait.until(EC.visibility_of_element_located((By.CLASS_NAME, "dropdown-menu")))

# Retrieve the dropdown items for dining halls
dropdown_items = driver.find_elements(By.CSS_SELECTOR, ".dropdown-menu .dropdown-item a")

if dropdown_items:
    # Start from the first item (index 0)
    for item in dropdown_items[1:]:  # This slices the list to skip the first item
        print("Clicking on dining hall option: ", item.text)
        item.click()  # Click on the dining hall option
        
        time.sleep(1)  # Adjust the time as needed
        
        try:
            # Now click the date dropdown
            date_dropdown = wait.until(EC.element_to_be_clickable((By.ID, "dropdownDateButton")))
            date_dropdown.click()
            
            # Wait for the date dropdown items to be visible
            wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, "#nav-date-selector .dropdown-menu")))

            # Retrieve the dropdown items for dates
            date_items = driver.find_elements(By.CSS_SELECTOR, "#nav-date-selector .dropdown-menu .dropdown-item")

            if date_items:
                # Loop through date items and click each one
                for date_item in date_items:
                    print("Clicking on date option: ", date_item.text)
                    date_item.click()  # Click on the date option

                    time.sleep(1)  # Wait for 1 second before the next click
                    
                    # Reopen the date dropdown for the next item
                    date_dropdown.click()
                    
                    # Wait for the dropdown items to be visible again
                    wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, "#nav-date-selector .dropdown-menu")))
            else:
                print("No date items found!")
                
        except Exception as e:
            print("An error occurred while handling the date dropdown:", str(e))
        
        # Reopen the dining hall dropdown for the next item
        dropdown.click()
        
        # Wait for the dropdown items to be visible again
        wait.until(EC.visibility_of_element_located((By.CLASS_NAME, "dropdown-menu")))
else:
    print("No dropdown items found!")

# Close the browser when done
driver.quit()
