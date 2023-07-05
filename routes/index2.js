var express = require('express');
var router = express.Router();
var puppeteer = require('puppeteer');
const fs = require("fs");

// /* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });

async function collectPhoneNumbersForFirstResult() {
    console.log("start launching...");
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: false,
        userDataDir: "./tmp"
    });
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

    // Step 6: Collect clinic phone number and collect clinic address from clinic contents
    const clinic_content = await page.$$eval('.Io6YTe.fontBodyMedium.kR99db', clinic_content => {
        return clinic_content.map(clinic_content => clinic_content.textContent);
    });

    console.log("clinic_content", clinic_content)

    let clinic_adr = clinic_content[0];
    console.log('clinic_adr is', clinic_adr);

    let clinic_Pnum = clinic_content[2];
    console.log('clinic_Pnum is', clinic_Pnum);

    // Step 6.5: Get Clinic name (bfr clicking on the result)
    const clinic_name = await page.$eval(
        '.DUwDvf', el => el.textContent
    );
    console.log('clinic_name is', clinic_name);
}

// function from stackoverflow
async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            var totalHeight = 0;
            var distance = 200;
            var timer = setInterval(() => {
                var scrollHeight = document.querySelectorAll('.section-scrollbox')[1];
                var scrollHeight = element.scrollHeight;
                element.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}

async function collectPhoneNumbersForAllResult() {
    console.log("start launching...");
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: false,
        userDataDir: "./tmp"
    });
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

    // //scroll towards the end
    // async function autoScroll(page) {
    //     await page.evaluate(async () => {
    //         await new Promise((resolve) => {
    //             var totalHeight = 0;
    //             var distance = 200;
    //             var timer = setInterval(() => {
    //                 var scrollHeight = document.querySelectorAll('.m6QErb');
    //                 console.log(scrollHeight);
    //                 var scrollHeight = element.scrollHeight;
    //                 element.scrollBy(0, distance);
    //                 totalHeight += distance;

    //                 if (totalHeight >= scrollHeight) {
    //                     clearInterval(timer);
    //                     resolve();
    //                 }
    //             }, 100);
    //         });
    //     });
    // }

    // await autoScroll(page);

    // const url = await page.url();
    // console.log(url);
    // counter = 0

    // let isLoadingAvailable = true // Your condition-to-stop

    // while (isLoadingAvailable) {
    //     await scrollPageToBottom(page, { size: 500 })
    //     await page.waitForResponse(
    //         response => response.url() === url && response.status() === 200
    //     )
    //     if (counter > 100){
    //         isLoadingAvailable = false // Update your condition-to-stop value
    //     }
    //     counter++
    //     console.log('counter is ',counter)
    // }

    // await browser.close()

    //=================================================================================================

    // collects data for each clinic
    const links = await page.$$('.hfpxzc');

    console.log("links:", links)

    for (let i = 0; i < links.length; i++) {
        await links[i].click();

        // Step 5: Wait for phone number to appear
        await page.waitForSelector('.Io6YTe.fontBodyMedium.kR99db');
        await page.waitForTimeout(1000);
        // Collecting info
        const clinic_content = await page.$$eval('.Io6YTe.fontBodyMedium.kR99db', clinic_content => {
            return clinic_content.map(clinic_content => clinic_content.textContent);
        });

        let clinic_name = 'null';
        let clinic_Pnum = 'null';
        let clinic_adr = 'null';

        console.log("clinic_content", clinic_content)

        clinic_adr = clinic_content[0];
        console.log('clinic_adr is', clinic_adr);

        clinic_Pnum = clinic_content[2];
        console.log('clinic_Pnum is', clinic_Pnum);

        clinic_name = await page.$eval(
            '.DUwDvf', el => el.textContent
        );
        console.log('clinic_name is', clinic_name);

        await page.waitForTimeout(1000);

        fs.appendFile(
          "results.csv",
          `${clinic_name},${clinic_adr},${clinic_Pnum}\n`,
          function (err) {
            if (err) throw err;
          }
        );
    }

}

// collectPhoneNumbersForFirstResult();
collectPhoneNumbersForAllResult();

// module.exports = router;