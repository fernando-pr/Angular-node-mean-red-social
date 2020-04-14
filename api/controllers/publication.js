'use strict'

var path = require('path');
var fs = require('fs');
var moment = require('moment')
var mongoosePaginate = require('mongoose-pagination');

var Publication = require('../models/publication');
var User = require('../models/user');
var Follow = require('../models/follow');

function probando(req, res) {
    res.status(200).send({message: 'hola desde publication'});
}


function savePublication(req, res) {
    var params = req.body;

    if(!params.text) {return res.status(200).send({message: 'Debes enviar un texto'})}

    var publication = Publication();
    publication.text = params.text;
    publication.file = 'null';
    publication.user = req.user.sub;
    publication.created_at = moment().unix();

    publication.save((err, publicationStored) =>{
        if(err) {return res.status(500).send({message: 'Error al guardar la publicación'})}

        if (!publicationStored){return res.status(404).send({message: 'La publicación no ha sido guardada'})}

        return res.status(200).send({publication: publicationStored});
    });
}

function getPublications(req, res) {
    
    var page = req.params.page ? req.params.page : 1;
    var itemsPerPage = 4;

    Follow.find({user: req.user.sub}).populate('followed').exec((err, follows) =>{
        if(err) {return res.status(500).send({message: 'Error al recuperar las publicaciones'})}
        
        var follows_clean = [];

        follows.forEach((follow) => {
            follows_clean.push(follow.followed);
        });

        Publication.find({user : {"$in": follows_clean}}).sort('created_at').populate('user')
        .paginate(page, itemsPerPage, (err, publications, total) => {
            if(err) {return res.status(500).send({message: 'Error al devolver las publicaciones'})}
        
            if (!publications){return res.status(404).send({message: 'No hay publicaciones'})}

            return res.status(200).send({
                total_items: total,
                pages : Math.ceil(total/itemsPerPage),
                page,
                publications:publications,
            })

        });
    });
}

function getPublication(req, res) {
    var publicationId = req.params.id;

    Publication.findById(publicationId, (err, publication) => {
        if(err) {return res.status(500).send({message: 'Error al devolver las publicaciones'})}
        
        if (!publication){return res.status(404).send({message: 'No hay publicaciones'})}

       return res.status(200).send({publication});
    });
}

function deletePublication(req, res) {
    var publicationId = req.params.id;

    Publication.find({user: req.user.sub, '_id' : publicationId}).remove((err, publicationRemoved) => {
        if(err) {return res.status(500).send({message: 'Error al borrar la publicación'})}
        
        if (!publicationRemoved){return res.status(404).send({message: 'No se ha borrado la publicación'})}

       return res.status(200).send({publication: publicationRemoved});
    });
}

module.exports = {
    probando,
    savePublication,
    getPublications,
    getPublication,
    deletePublication,   
}