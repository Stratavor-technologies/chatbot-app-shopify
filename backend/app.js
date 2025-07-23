require("./db.connection");
require('dotenv').config({ path: './config.env' });

const express = require('express');
const app = express();
const appPort = process.env.PORT;
const https = require("https");
const fs = require("fs");
const path = require("path");
const fileURLToPath = require("url");

const update_store_data = require("./middlewares");

// console.log(appPort);

const cors = require("cors");
const bodyParser = require("body-parser");

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

app.use('/training_uploads', express.static('training_uploads'));
app.use(update_store_data);

// routes
const ticketController = require('./controllers/tickets.controller');
app.use(ticketController);

const chatController = require("./controllers/chats.controller");
app.use(chatController);

const trainingController = require("./controllers/training.controller");
app.use(trainingController);

const storeContoller = require('./controllers/stores.controller');
app.use(storeContoller);

const orderContoller = require('./controllers/orders.controller');
app.use(orderContoller);

// app.listen(appPort, () => {
//     console.log(`Server is running on port ${appPort}`);
// })

const keyPath = '/etc/letsencrypt/live/techbingetv.com/privkey.pem';
const certPath = '/etc/letsencrypt/live/techbingetv.com/fullchain.pem';

// Read the certificate files
const options = {
  // key: fs.readFileSync(keyPath),
  // cert: fs.readFileSync(certPath)
};


const server = https.createServer(options, app);

// Start the HTTPS server on port 443
server.listen(appPort, () => {
  console.log(`App listening on ${appPort}`);
});

// Redirect HTTP traffic to HTTPS
// import http from 'http';
// http.createServer((req, res) => {
//   res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
//   res.end();
// }).listen(80);