import { createRequestHandler } from "@remix-run/express";
import express from "express";
import https from "https";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Import the build from Remix
import * as build from "./build/server/index.js";

// Create an instance of express
const app = express();
app.use(express.static("build/client"));

// Define your test route
app.get("/test-route", (req, res) => {
  res.send("Hello, it's working");
});

// Handle all requests using Remix's request handler
app.all("*", createRequestHandler({ build }));

// Define the paths to your certificate files
const keyPath = '/etc/letsencrypt/live/techbingetv.com/privkey.pem';
const certPath = '/etc/letsencrypt/live/techbingetv.com/fullchain.pem';

// Read the certificate files
const options = {
  key: fs.readFileSync(keyPath),
  cert: fs.readFileSync(certPath)
};

// Create an HTTPS server
const server = https.createServer(options, app);

// Start the HTTPS server on port 443
server.listen(443, () => {
  console.log("App listening on https://localhost:443");
});

// Redirect HTTP traffic to HTTPS
import http from 'http';
http.createServer((req, res) => {
  res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
  res.end();
}).listen(80);
