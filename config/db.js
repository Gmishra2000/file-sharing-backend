require('dotenv').config();

const mongoose = require('mongoose');

function connectDB() {
    // Database Connection

    // url will contain username,password, secret key, etc
    mongoose.connect(process.env.MONGO_CONNECTION_URL,
        { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true, useFindAndModify: true });

    const connection = mongoose.connection;

    connection.once('open', () => {
        console.log('Database connected 🥳🥳🥳🥳');
    }).catch(err => {
        console.log('Connection failed ☹️☹️☹️☹️');
    })

}

module.exports = connectDB;