var puppeteer = require('puppeteer');
const fs = require("fs");

async function collectClinicInfo() {

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

    // Step 4: Gets the number of clinics found
    const links = await page.$$('.hfpxzc');

    console.log("links:", links);

    console.log("Number if clinics found is ",links.length);

    const num_of_iterations = links.length;

    // Step 5: Iteratively gets the name, phone number and address for each clinic (for only the initially loaded clinics)
    for (let i = 0; i < num_of_iterations; i++) {

        // Variable initialization
        let clinic_name = null;
        let clinic_Pnum = null;
        let clinic_adr = null;
        
        // Clicks into the clinic
        await links[i].click();

        // Wait for the parent class that contains all the info
        await page.waitForSelector('.Io6YTe.fontBodyMedium.kR99db');
        await page.waitForTimeout(1000);

        // Collect name 
        clinic_name = await page.$eval(
            '.DUwDvf', el => el.textContent
        );
        console.log('clinic_name is', clinic_name);

        // Collect address and phone number 
        const clinic_content = await page.$$eval('.Io6YTe.fontBodyMedium.kR99db', clinic_content => {
            return clinic_content.map(clinic_content => clinic_content.textContent);
        });
        
        // Conditional statements to handle phone number positioning bug
        let  condition1 = (clinic_content[1].length ==12 && clinic_content[1][0]=="0") || (clinic_content[1].length ==13 && clinic_content[1][0]=="0");
        let condition2 = (clinic_content[2].length ==12 && clinic_content[2][0]=="0") || (clinic_content[2].length ==13 && clinic_content[2][0]=="0");

        if (condition1){
            clinic_Pnum = clinic_content[1];
            console.log('clinic_Pnum is', clinic_Pnum);
        }
        else if (condition2){
            clinic_Pnum = clinic_content[2];
            console.log('clinic_Pnum is', clinic_Pnum);
        }
        else{
            clinic_Pnum = null;
            console.log('clinic_Pnum is', clinic_Pnum);
        }

        clinic_adr = clinic_content[0];
        
        console.log('clinic_adr is', clinic_adr);

        console.log("\nContents",clinic_content);
``
        console.log('======================================================');
        await page.waitForTimeout(1000);

        // Saving information into .csv in the same folder
        fs.appendFile(
          "results.csv",
          `${clinic_name},${clinic_adr},${clinic_Pnum}\n`,
          function (err) {
            if (err) throw err;
          }
        );
    }

}

collectClinicInfo();
