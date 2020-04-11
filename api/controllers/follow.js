'use strict'

var path = require('path');
var fs = require('fs');
var mongoosePaginate = require('mongoose-pagination');

var User = require('../models/user');
var Follow = require('../models/follow');


function saveFollow(req, res) {
    var params = req.body;
    var follow = new Follow();
    follow.user = req.user.sub;
    follow.followed = params.followed;

    follow.save((err, followStored) =>{
        if (err) { return res.status(500).send({message: "Error al guardar el seguimiento"})}
        
        if (!followStored) {
            return res.status(404).send({message: "El seguimiento no se ha guardado"});
        }

        res.status(200).send({followStored});
    }); 
}

function deleteFollow(req, res) {
    var userId = req.user.sub;
    var followId = req.params.id;

    Follow.find({'user' : userId, 'followed': followId}).remove(err => {
        if (err) { return res.status(500).send({message: "Error al guardar el seguimiento"})}

        return res.status(200).send({message: "El follow se ha eliminado"});
    });
}


function getFollowingUsers(req, res) {

    var userId =  req.params.id && req.params.page ? req.params.id : req.user.sub;
    var page = req.params.page ? req.params.page : req.params.id;

    var itemsPerPAge = 4;

    Follow.find({user: userId}).populate({path: 'followed'})
    .paginate(page, itemsPerPAge, (err, follows, total) => {
        if (err) { return res.status(500).send({message: "Error en el servidor"})}

        if (!follows) { return res.status(404).send({message: "No sigues a ningún usuario"})}
 
        return res.status(200).send({
            total,
            pages: Math.ceil(total/itemsPerPAge),
            follows,
        });
    });
}

function getFollowedUsers(req, res) {

    var userId =  req.params.id ? req.params.id : req.user.sub;
    var page = 1;
    page = req.params.page ? req.params.page : page;

    var itemsPerPAge = 4;

    Follow.find({followed: userId}).populate('user followed')
    .paginate(page, itemsPerPAge, (err, follows, total) => {
        if (err) { return res.status(500).send({message: "Error en el servidor"})}

        if (!follows) { return res.status(404).send({message: "No te sigue ningún usuario"})}
       
        return res.status(200).send({
            total,
            pages: Math.ceil(total/itemsPerPAge),
            follows,
        });
    });

}


// Devolver listado de usuarios sin paginar
function getMyFollows(req, res) {
    var userId = req.user.sub;

    var find = Follow.find({user: userId});

    if(req.params.followed) {
        find = Follow.find({followed: userId});
    }

    find.populate('user followed').exec((err, follows) => {
        if (err) { return res.status(500).send({message: "Error en el servidor"})}

        if (!follows) { return res.status(404).send({message: "No sigues a ningún usuario"})}
       
        return res.status(200).send({follows});
    });
}


module.exports = {
    saveFollow,
    deleteFollow,
    getFollowingUsers,
    getFollowedUsers,
    getMyFollows,
}