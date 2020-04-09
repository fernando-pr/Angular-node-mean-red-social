'use strict'

var User = require('../models/user');

function home(req, res) {
    res.status(200).send({
        message: 'Hola mundo desde el servidor de nodejs'
    })
};

function pruebas(req, res)  {
    res.status(200).send({
        message: 'Accion de prueba en el servidor de nodejs'
    })
};

module.exports = {
    home,
    pruebas,
}