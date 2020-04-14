'use strict'

var moment = require('moment');
var mongoosePaginate = require('mongoose-pagination');

var User = require('../models/user');
var Follow = require('../models/follow');
var Message = require('../models/message');


function probando(req, res) {
    res.status(200).send({message: 'hola desde message'});
}

function saveMessage(req, res) {
    var params = req.body;

    if (!params.text || !params.receiver) { 
        return res.status(200).send({message: 'Envía los datos necesarios'});
    }

    var message = new Message();

    message.emitter = req.user.sub;
    message.receiver = params.receiver;
    message.text = params.text;
    message.created_at = moment().unix();
    message.viewed = 'false';

    message.save((err, messageStored) => {
        if (err) {  return res.status(500).send({message: 'Error en la petición'}) }
   
        if (!messageStored) {  return res.status(500).send({message: 'Error al enviar el mensaje'}) }
        
        return res.status(200).send({message:messageStored});
    });
}


function getReceivedMessages(req, res) {

    var user_id = req.user.sub;
    var page = req.params.page ? req.params.page : 1;
    var itemsPerPage = 4;

    Message.find({ receiver : user_id})
    .populate('emitter', 'name surname _id nick image').paginate(page, itemsPerPage, (err, messages, total) => {
        if (err) {  return res.status(500).send({message: 'Error en la petición'}) }
        if (!messages) {  return res.status(404).send({message: 'No hay mensajes'}) }

        return res.status(200).send({
            total,
            pages : Math.ceil(total/itemsPerPage),
            messages,
        }); 
    });
}

function getEmittedMessages(req, res) {

    var user_id = req.user.sub;
    var page = req.params.page ? req.params.page : 1;
    var itemsPerPage = 4;

    Message.find({ emitter : user_id})
    .populate('emitter receiver', 'name surname _id nick image').paginate(page, itemsPerPage, (err, messages, total) => {
        if (err) {  return res.status(500).send({message: 'Error en la petición'}) }
        if (!messages) {  return res.status(404).send({message: 'No hay mensajes'}) }

        return res.status(200).send({
            total,
            pages : Math.ceil(total/itemsPerPage),
            messages,
        }); 
    });
}

function getUnviewedMessages(req, res) {
    var user_id = req.user.sub;

    Message.count({ receiver : user_id, viewed: 'false'}).exec((err, count) => {
        if (err) {  return res.status(500).send({message: 'Error en la petición'}) }
        
        return res.status(200).send({
            unviewed :count,
        }); 
    });
}


module.exports = {
    probando,
    saveMessage,
    getReceivedMessages,
    getEmittedMessages,
    getUnviewedMessages,
}