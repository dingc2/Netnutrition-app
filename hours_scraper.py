import csv
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import traceback

# Set up Selenium WebDriver
options = webdriver.ChromeOptions()
options.add_argument("--start-maximized")  # Maintain maximizing the window as preferred
# Make sure to replace 'chromedriver' with the correct path if necessary
driver = webdriver.Chrome(options=options)
driver.get("https://netnutrition.cbord.com/nn-prod/vucampusdining")

# Function to handle the 'Continue' button
def click_continue():
    try:
        continue_button = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.XPATH, "//button[@aria-label='Continue']"))
        )
        continue_button.click()
        print("Clicked 'Continue' button.")
    except Exception as e:
        print("Error clicking 'Continue' button:", e)
        print(traceback.format_exc())
        driver.quit()
        exit()

# Click the 'Continue' button to proceed to the dining halls page
click_continue()

# Wait for the units list to load
WebDriverWait(driver, 10).until(
    EC.presence_of_element_located((By.ID, "cbo_nn_unitDataList"))
)

# Open CSV file for writing
with open('dining_hall_hours.csv', mode='w', newline='') as file:
    writer = csv.writer(file)
    writer.writerow(["Dining Hall", "Day", "Opening", "Closing"])

    # Find all unit elements and iterate through them
    units = driver.find_elements(By.CLASS_NAME, "unit__wrapper")

    for unit in units:
        try:
            # Find the name and the schedule button
            name_element = unit.find_element(By.CLASS_NAME, "unit__name-link")
            schedule_button = unit.find_element(By.XPATH, ".//a[contains(@class, 'badge')]")
            
            # Scroll schedule button into view and click it using JavaScript
            driver.execute_script("arguments[0].scrollIntoView(true);", schedule_button)
            time.sleep(0.1)  # Let the scrolling animation finish before attempting to click
            driver.execute_script("arguments[0].click();", schedule_button)
            print(f"Clicked schedule button for: {name_element.text}")

            # Short delay to allow the modal to initialize
            time.sleep(0.1)

            # Wait for the modal to appear
            modal = WebDriverWait(driver, 20).until(
                EC.visibility_of_element_located((By.XPATH, "//div[@id='cbo_nn_hoursOfOperation' and contains(@class, 'modal show')]"))
            )
            print(f"Modal appeared for: {name_element.text}")

            # Extract schedule information from the modal
            rows = WebDriverWait(modal, 20).until(
                EC.presence_of_all_elements_located((By.XPATH, ".//div[@class='table-responsive']//tr"))
            )
            
            for row in rows:
                columns = row.find_elements(By.TAG_NAME, "td")
                if len(columns) == 3:
                    day = columns[0].text
                    opening = columns[1].text
                    closing = columns[2].text
                    writer.writerow([name_element.text, day, opening, closing])
                    print(f"Recorded schedule for {name_element.text}: {day} - {opening} to {closing}")
                elif len(columns) == 2:  # Handle the case where the dining hall is closed
                    day = columns[0].text
                    status = columns[1].text
                    writer.writerow([name_element.text, day, status, "Closed"])
                    print(f"Recorded schedule for {name_element.text}: {day} - {status}")

            # Close the modal using the 'x' button with JavaScript
            close_button = WebDriverWait(modal, 20).until(
                EC.element_to_be_clickable((By.XPATH, "//button[@id='btn_nn_hours_close']"))
            )
            driver.execute_script("arguments[0].click();", close_button)
            print(f"Closed modal for: {name_element.text}")
            
            # Wait for the modal to be completely closed
            WebDriverWait(driver, 20).until(
                EC.invisibility_of_element_located((By.XPATH, "//div[@id='cbo_nn_hoursOfOperation' and contains(@class, 'modal show')]"))
            )
            
            # Pause briefly to ensure the modal is fully closed before continuing
            time.sleep(0.1)
        except Exception as e:
            print(f"Error processing unit {name_element.text if name_element else 'unknown'}: {e}")
            print(traceback.format_exc())

# Close the WebDriver
driver.quit()
