const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const File = require('../models/file');
const { v4: uuidv4 } = require('uuid');
const { send } = require('process');



let storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
        // each file name in a unique way will be stored as ---> (timestamp-randomNumber.extname) 
        cb(null, uniqueName);
    }
});

let upload = multer({
    storage,
    limit: { fileSize: 1000000 * 100 }
}).single('myfile');

router.post('/', (req, res) => {



    // store file

    upload(req, res, async (err) => {

        // validate request

        if (!req.file) {
            return res.json({ error: "All fields are required." });
        }

        if (err) {
            return res.status(500).send({ error: err.message })
        }

        // store into database
        const file = new File({
            filename: req.file.filename,
            uuid: uuidv4(),
            path: req.file.path,
            size: req.file.size
        });

        const response = await file.save();
        return res.json({ file: `${process.env.APP_BASE_URL}/files/${response.uuid}` });

        // to get dynamically our domain name we download the file we use {process.env.APP_BASE_URL}
        // http://localhost:3000/files/235564545hjdhskjd-454446545hjkdbj (our url of download link)

        // uuid is to get the unique link of eachfile

    });




    // Response  -> Link
});

router.post('/send', async (req, res) => {
    // console.log(req.body);
    // return res.send({});
    const { uuid, emailTo, emailFrom } = req.body;


    //Validate request

    if (!uuid || !emailTo || !emailFrom) {
        return res.status(422).send({ error: 'All Fields are required.' });
    }

    // Get Data From database

    const file = await File.findOne({ uuid: uuid });
    if (file.sender) {
        return res.status(422).send({ error: 'Email Already sent.' });
    }

    file.sender = emailFrom;
    file.receiver = emailTo;
    const response = await file.save();

    // Send email

    const sendMail = require('../services/emailService');
    sendMail({
        from: emailFrom,
        to: emailTo,
        subject: 'inShare file sharing',
        text: `${emailFrom} shared  file with you`,
        html: require('../services/emailTemplate')({
            emailFrom: emailFrom,
            downloadLink: `${process.env.APP_BASE_URL}/files/${file.uuid}`,
            size: parseInt(file.size / 1000) + ' KB',
            expires: '24 hours'
        })
    });

    return res.send({ success: true });
});

module.exports = router;