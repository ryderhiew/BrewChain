'use strict';

const path = require('path');
const config = require('dotenv').config({
  path: path.join(__dirname, './.env')
});

module.exports = config;
