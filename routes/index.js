var express = require('express');
var router = express.Router();
var puppeteer = require('puppeteer');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

async function collectPhoneNumbers() {
  console.log("start launching...");
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  console.log("loading map...");
  await page.goto('https://www.google.com/maps');

  console.log("searching...");
  // Step 1: Enter search query
  await page.click('.searchboxinput');
  await page.keyboard.type('clinics near me');

  // Step 2: Perform search
  await page.click('.mL3xi');

  // Step 3: Wait for search results
  await page.waitForSelector('.hfpxzc');

  // Step 4: Click on the first result
  await page.click('.hfpxzc');

  // Step 5: Wait for phone number to appear
  await page.waitForSelector('.Io6YTe.fontBodyMedium.kR99db');

  // Step 6: Collect phone numbers
  const data = await page.$$eval('.Io6YTe.fontBodyMedium.kR99db', elements =>
    elements.map(element => element.textContent.trim())
  );

  let phoneNumbers = [data[3]];
  console.log(phoneNumbers);

  // Step 7: Collect phone numbers for the next 10 search results
  for (let i = 0; i <= 10; i++) {
    console.log(`Clicking on result ${i + 1}`);
    await page.click(`.hfpxzc:nth-child(${i + 1})`);
    await page.waitForSelector('.Io6YTe.fontBodyMedium.kR99db');
    const additionalData = await page.$$eval('.Io6YTe.fontBodyMedium.kR99db', elements =>
      elements.map(element => element.textContent.trim())
    );
    phoneNumbers.push(additionalData[3]);
    console.log(additionalData[3]);
    await page.goBack();
    await page.waitForSelector('.hfpxzc');
  }

  console.log(phoneNumbers);

  await browser.close();
}

collectPhoneNumbers();

module.exports = router;