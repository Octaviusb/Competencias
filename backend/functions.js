const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');

// Import your existing Express app
const app = require('./src/index.js');

exports.api = functions.https.onRequest(app);