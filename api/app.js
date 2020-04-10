'use strict'

var express = require('express');
var bodyParser = require('body-parser');

var app = express();

// Cargar Rutas
var user_routes = require('./routes/user');
var follow_routes = require('./routes/follow');

// middlewares
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

// Cors

// Rutas
app.use('/api', user_routes);
app.use('/api', follow_routes);


// Export
module.exports = app; 