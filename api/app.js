'use strict'

var express = require('express');
var bodyParser = require('body-parser');

var app = express();

// Cargar Rutas

// middlewares
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

// Cors

// Rutas
app.get('/',(req, res) => {
    res.status(200).send({
        message: 'Hola mundo desde el servidor de nodejs'
    })
});

app.get('/pruebas',(req, res) => {
    res.status(200).send({
        message: 'Accion de prueba en el servidor de nodejs'
    })
});


// Export
module.exports = app; 