var puppeteer = require('puppeteer');
const fs = require("fs");

async function collectClinicInfo(boundingBoxArr) {

    console.log("start launching...");
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: false,
        userDataDir: "./tmp"
    });

    num_of_boxes = boundingBoxArr.length;
    const page = await browser.newPage();
    for (j=0;j<num_of_boxes;j++){
        console.log(boundingBoxArr[j])
        for (k=0;k<2;k++){
            if (k==0){
                var currentLat = boundingBoxArr[j].nw.lat;
                var currentLng = boundingBoxArr[j].nw.lng;
            }
            else if (k==1){
                var currentLat = boundingBoxArr[j].se.lat;
                var currentLng = boundingBoxArr[j].se.lng;
            }
            console.log(currentLat,currentLng);
            await page.setGeolocation({latitude: currentLat, longitude: currentLng});
            const requestParams = {
                baseURL: `http://google.com`,
                query: `clinics+near+this+coordinate`,   
                coordinates: `@${currentLat},${currentLng},15z`,
                hl: "en",
            }
            const URL = `${requestParams.baseURL}/maps/search/${requestParams.query}/${requestParams.coordinates}?hl=${requestParams.hl}`;

            console.log("loading map...");
            await page.goto(URL);

            console.log("searching...");
            await page.waitForTimeout(5000);

            // Step 1: Enter search query
            // await page.click('.searchboxinput');
            // await page.keyboard.type('clinics near me');

            // // Step 2: Perform search
            // await page.click('.mL3xi');

            // Step 3: Wait for search results
            // await page.waitForSelector('.hfpxzc');

            // // Step 4: Gets the number of clinics found
            // const links = await page.$$('.hfpxzc');

            // console.log("links:", links);

            // console.log("Number if clinics found is ", links.length);

            // const num_of_iterations = links.length;

            // // Step 5: Iteratively gets the name, phone number and address for each clinic (for only the initially loaded clinics)
            // for (let i = 0; i < num_of_iterations; i++) {

            //     // Variable initialization
            //     let clinic_name = null;
            //     let clinic_Pnum = null;
            //     let clinic_adr = null;

            //     // Clicks into the clinic
            //     await links[i].click();

            //     // Wait for the parent class that contains all the info
            //     await page.waitForSelector('.Io6YTe.fontBodyMedium.kR99db');
            //     await page.waitForTimeout(1000);

            //     // Collect name 
            //     clinic_name = await page.$eval(
            //         '.DUwDvf', el => el.textContent
            //     );
            //     console.log('clinic_name is', clinic_name);

            //     // Collect address and phone number 
            //     const clinic_content = await page.$$eval('.Io6YTe.fontBodyMedium.kR99db', clinic_content => {
            //         return clinic_content.map(clinic_content => clinic_content.textContent);
            //     });

            //     // Conditional statements to handle phone number positioning bug
            //     let condition1 = (clinic_content[1].length == 12 && clinic_content[1][0] == "0") || (clinic_content[1].length == 13 && clinic_content[1][0] == "0");
            //     let condition2 = (clinic_content[2].length == 12 && clinic_content[2][0] == "0") || (clinic_content[2].length == 13 && clinic_content[2][0] == "0");

            //     if (condition1) {
            //         clinic_Pnum = clinic_content[1];
            //         console.log('clinic_Pnum is', clinic_Pnum);
            //     }
            //     else if (condition2) {
            //         clinic_Pnum = clinic_content[2];
            //         console.log('clinic_Pnum is', clinic_Pnum);
            //     }
            //     else {
            //         clinic_Pnum = null;
            //         console.log('clinic_Pnum is', clinic_Pnum);
            //     }

            //     clinic_adr = clinic_content[0];

            //     console.log('clinic_adr is', clinic_adr);

            //     console.log("\nContents", clinic_content);
            //     ``
            //     console.log('======================================================');
            //     await page.waitForTimeout(1000);

            //     // Saving information into .csv in the same folder
            //     fs.appendFile(
            //         "results2.csv",
            //         `${clinic_name},${clinic_adr},${clinic_Pnum}\n`,
            //         function (err) {
            //             if (err) throw err;
            //         }
                // );
            // }
        }
    }
}

const BOUNDING_BOX = {
    nw: { lat: 3.3387321172465754, lng: 101.04703914876758 },
    se: { lat: 2.5778990854275157, lng: 102.20900924807071 }
};
const ZOOM_LEVEL = 15;
const SMALLER_BOX_SIZE = 0.0447213596; // Approximately 0.0447213596 degrees corresponds to 5km

// Function to split the bounding box into smaller boxes
function splitBoundingBox() {
    const smallerBoxes = [];
    const latSteps = Math.floor((BOUNDING_BOX.nw.lat - BOUNDING_BOX.se.lat) / SMALLER_BOX_SIZE);
    const lngSteps = Math.floor((BOUNDING_BOX.se.lng - BOUNDING_BOX.nw.lng) / SMALLER_BOX_SIZE);

    for (let i = 0; i < latSteps; i++) {
        for (let j = 0; j < lngSteps; j++) {
            const box = {
                nw: {
                    lat: BOUNDING_BOX.nw.lat - i * SMALLER_BOX_SIZE,
                    lng: BOUNDING_BOX.nw.lng + j * SMALLER_BOX_SIZE
                },
                se: {
                    lat: BOUNDING_BOX.nw.lat - (i + 1) * SMALLER_BOX_SIZE,
                    lng: BOUNDING_BOX.nw.lng + (j + 1) * SMALLER_BOX_SIZE
                }
            };
            smallerBoxes.push(box);
        }
    }

    return smallerBoxes;
}

boundingBoxArr = splitBoundingBox();
// console.log(boundingBoxArr.length);
// console.log(boundingBoxArr[10]);
// console.log(boundingBoxArr[10].nw);
// console.log(boundingBoxArr[10].nw.lat);
collectClinicInfo(boundingBoxArr);

