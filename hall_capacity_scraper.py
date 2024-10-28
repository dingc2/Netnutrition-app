from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
import csv
import time

# Configure Chrome options
options = Options()
options.add_argument("--disable-gpu")  # Disable GPU hardware acceleration
options.add_argument("--window-size=1920,1080")  # Set window size to ensure everything fits correctly
options.add_argument("--no-sandbox")  # Bypass OS security model
options.add_argument("--disable-dev-shm-usage")  # Overcome limited resource problems
options.add_argument("--headless")  # Run Chrome in headless mode

# Initialize WebDriver
driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)

# URL to scrape
url = "https://campusdining.vanderbilt.edu/wait-times/"
driver.get(url)

# Wait for the element to load
try:
    WebDriverWait(driver, 10).until(
        EC.visibility_of_element_located((By.ID, "dining-facility-wrapper"))
    )
except Exception as e:
    print(f"Error loading the page: {e}")
    driver.quit()
    exit()

# Scraping the required information
dining_facilities = driver.find_elements(By.CLASS_NAME, "dining-facility")

# Prepare CSV file to store results
csv_filename = "vanderbilt_wait_times.csv"
with open(csv_filename, mode='w', newline='', encoding='utf-8') as file:
    writer = csv.writer(file)
    writer.writerow(["Unit", "Seating Capacity", "Percentage Full"])  # CSV Header

    # Loop through each facility and extract data
    for facility in dining_facilities:
        try:
            unit_name = facility.find_element(By.TAG_NAME, "h6").text
            seating_capacity = facility.find_element(By.TAG_NAME, "p").text.split(": ")[1]
            percentage_full = facility.find_element(By.CLASS_NAME, "capacity-chart-metric").text
            
            # Write to CSV
            writer.writerow([unit_name, seating_capacity, percentage_full])
            print(f"Scraped: {unit_name} - Seating Capacity: {seating_capacity}, Percentage Full: {percentage_full}")
        except Exception as e:
            print(f"Error scraping facility: {e}")

# Close the WebDriver
driver.quit()

print(f"Scraping completed. Data saved to {csv_filename}")
