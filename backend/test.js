const mongoose = require('mongoose');
require('dotenv').config();

const mongoURI = process.env.DB_URI || 'mongodb://localhost:27017/mydatabase';

mongoose.connect(mongoURI, {
    // Remove deprecated options
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

module.exports = db;
