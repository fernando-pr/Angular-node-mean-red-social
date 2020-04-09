'use strict'

var mongoose = require('mongoose');
var app = require('./app');
var port = 3800;

//conexion database
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/curso_mean_social', { useNewUrlParser: true })
        .then(() =>  {
            console.log('Conectado correctamente a la base de datos curso_mean_social');
            // Crear servidor
            app.listen(port, () => {
                console.log("Servidor Corriendo en localhost:3800");
            });
        })
        .catch(err => console.log(err));
