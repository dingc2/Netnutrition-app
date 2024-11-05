import unittest
from unittest.mock import patch, MagicMock
import scraper_other  # Import your main script, previously named scraper

class TestScraperFunctions(unittest.TestCase):

    @patch('scraper_other.create_driver')
    def test_create_driver(self, mock_create_driver):
        mock_driver = MagicMock()
        mock_create_driver.return_value = mock_driver
        driver = scraper_other.create_driver()
        self.assertEqual(driver, mock_driver)
    
    @patch('scraper_other.WebDriverWait')
    @patch('scraper_other.webdriver.Chrome')
    def test_wait_and_click_success(self, mock_chrome, mock_webdriverwait):
        mock_driver = MagicMock()
        mock_chrome.return_value = mock_driver
        mock_element = MagicMock()
        mock_webdriverwait.return_value.until.return_value = mock_element
        self.assertTrue(scraper_other.wait_and_click(mock_driver, (scraper_other.By.ID, "test")))

    @patch('scraper_other.WebDriverWait')
    @patch('scraper_other.webdriver.Chrome')
    def test_wait_and_click_fail(self, mock_chrome, mock_webdriverwait):
        mock_driver = MagicMock()
        mock_chrome.return_value = mock_driver
        mock_webdriverwait.return_value.until.side_effect = scraper_other.TimeoutException
        self.assertFalse(scraper_other.wait_and_click(mock_driver, (scraper_other.By.ID, "test")))

    @patch('scraper_other.create_driver')
    @patch('scraper_other.wait_and_click')
    def test_scrape_meals_for_hall(self, mock_wait_and_click, mock_create_driver):
        mock_driver = MagicMock()
        mock_create_driver.return_value = mock_driver
        mock_wait_and_click.return_value = True
        
        scraper_other.scrape_meals_for_hall(0, "Test Hall")
        mock_create_driver.assert_called_once()
        mock_wait_and_click.assert_called()

    @patch('scraper_other.webdriver.Chrome')
    def test_check_meal_items(self, mock_chrome):
        mock_driver = MagicMock()
        mock_chrome.return_value = mock_driver
        mock_driver.find_elements.return_value = ["item1", "item2"]
        self.assertTrue(scraper_other.check_meal_items(mock_driver))
    
    @patch('scraper_other.webdriver.Chrome')
    def test_expand_meal_items(self, mock_chrome):
        mock_driver = MagicMock()
        mock_chrome.return_value = mock_driver
        mock_group = MagicMock()
        mock_group.get_attribute.return_value = "false"
        mock_driver.find_elements.return_value = [mock_group]
        scraper_other.expand_meal_items(mock_driver)
        mock_group.click.assert_called()

if __name__ == '__main__':
    unittest.main()
