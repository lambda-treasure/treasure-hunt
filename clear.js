const storage = require('node-persist');

async function setUpYourStorage() {
    try {
        await storage.init();
        // // Clear all storage
        // await storage.clear();

        // // Clear map to zero
        // await storage.removeItem('map');

        // // See your map
        // console.log(`This is your map: ${await storage.getItem(`${process.env.NAME}'s-map`)}`) 



        await storage.setItem(`Store-Room-ID`, 1);
    }
    catch (err) {
        console.error(err)
    };
}

setUpYourStorage();