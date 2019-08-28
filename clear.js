const storage = require('node-persist');

async function setUpYourStorage() {
    try {
        await storage.init({
            dir: 'relative/path/to/persist',

            stringify: JSON.stringify,

            parse: JSON.parse,

            encoding: 'utf8',

            logging: false,  // can also be custom logging function

            ttl: false, // ttl* [NEW], can be true for 24h default or a number in MILLISECONDS or a valid Javascript Date object

            expiredInterval: 2 * 60 * 1000, // every 2 minutes the process will clean-up the expired cache

            // in some cases, you (or some other service) might add non-valid storage files to your
            // storage dir, i.e. Google Drive, make this true if you'd like to ignore these files and not throw an error
            forgiveParseErrors: true
        });
        // // Clear all storage
        await storage.clear();

        // // Clear map to zero
        // await storage.removeItem('map');

        // // See your map
        // console.log(`This is your map: ${await storage.getItem(`${process.env.NAME}'s-map`)}`) 



        // await storage.setItem(`Store-Room-ID`, 1);
    }
    catch (err) {
        console.error(err)
    };
}

setUpYourStorage();