const puppeteer = require('puppeteer');

(async () => {
    // Launch a new browser instance with optional settings
    const browser = await puppeteer.launch({
        headless: false,  // Set to 'true' to run in headless mode
        args: ['--start-fullscreen'] // Launch in fullscreen
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Navigate to the website
    await page.goto('https://netnutrition.cbord.com/nn-prod/vucampusdining');
    
    // Take a screenshot
    await page.screenshot({ path: 'screenshot.png' });

    // Wait for and click the continue button
    await page.waitForSelector("button[aria-label='Continue']", { visible: true });
    await page.click("button[aria-label='Continue']");

    // Wait for and click the dining hall dropdown button
    await page.waitForSelector("#dropdownUnitButton", { visible: true });
    await page.click("#dropdownUnitButton");

    // Wait for the dropdown items to be visible
    await page.waitForSelector(".dropdown-menu", { visible: true });

    // Retrieve the dropdown items for dining halls
    const dropdownItems = await page.$$(".dropdown-menu .dropdown-item a");

    if (dropdownItems.length > 0) {
        // Loop through the dining hall options, starting from index 1
        for (let i = 1; i < dropdownItems.length; i++) {
            const item = dropdownItems[i];
            const text = await (await item.getProperty('textContent')).jsonValue();
            console.log(`Clicking on dining hall option: ${text}`);
            await item.click();

            //await page.waitFor(1000); // Adjust the delay as needed

            try {
                // Click the date dropdown
                await page.waitForSelector("#dropdownDateButton", { visible: true });
                await page.click("#dropdownDateButton");

                // Wait for the date dropdown items to be visible
                await page.waitForSelector("#nav-date-selector .dropdown-menu", { visible: true });

                // Retrieve the date dropdown items
                const dateItems = await page.$$("#nav-date-selector .dropdown-menu .dropdown-item");

                if (dateItems.length > 0) {
                    // Loop through the date items and click each one
                    for (const dateItem of dateItems) {
                        const dateText = await (await dateItem.getProperty('textContent')).jsonValue();
                        console.log(`Clicking on date option: ${dateText}`);
                        await dateItem.click();

                        //await page.waitFor(1000); // Wait for 1 second

                        // Reopen the date dropdown for the next item
                        await page.click("#dropdownDateButton");
                        await page.waitForSelector("#nav-date-selector .dropdown-menu", { visible: true });
                    }
                } else {
                    console.log("No date items found!");
                }
            } catch (error) {
                console.log("An error occurred while handling the date dropdown:", error);
            }

            // Reopen the dining hall dropdown for the next item
            await page.click("#dropdownUnitButton");
            await page.waitForSelector(".dropdown-menu", { visible: true });
        }
    } else {
        console.log("No dropdown items found!");
    }

    // Close the browser
    await browser.close();
})();
