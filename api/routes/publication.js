'use strict'

var express = require('express');
var PublicationController = require('../controllers/publication');
var api = express.Router();
var md_auth = require('../middlewares/authenticated');

var multipart = require('connect-multiparty')
var md_upload = multipart({uploadDir: './upload/publication'});

api.get('/probando-pub', md_auth.ensureAuth, PublicationController.probando);


module.exports = api;