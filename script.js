const File = require('./models/file');

const fs = require('fs');

const connectDB = require('./config/db');
connectDB();

async function fetchData() {
    //24 hours
    //milli seconds
    const pastDate = new Date(Date.now() - 1000 * 60 * 60 * 24);
    const files = await File.find({ createdAt: { $lt: pastDate } });

    if (files.length) {
        for (const file of files) {
            try {
                false.unlinkSync(file.path);
                await file.remove();
                console.log(`successfully deleted ${file.filename}`);
            } catch (err) {
                console.log(`error while deleting file ${err}`);
            }
        }
        
    }
    console.log('Job done!');
}

fetchData().then(process.exit);