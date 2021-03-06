'use strict'
var bcrypt = require('bcrypt-nodejs');
var mongoosePaginate = require('mongoose-pagination');
var fs = require('fs');
var path = require('path');

var User = require('../models/user');
var Follow = require('../models/follow');
var Publication = require('../models/publication');
var jwt = require('../services/jwt');

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

function saveUser(req, res) {
    var params = req.body;
    var user = new User();

    if(params.name && params.surname && params.nick && params.email && params.password) {
        
        user.name = params.name;
        user.surname = params.surname; 
        user.nick = params.nick;
        user.email = params.email;
        user.role = 'ROLE_USER';
        user.image = null;

        // Controlar usuarios duplicados
        User.find({ $or: [ 
            { email: user.email.toLowerCase() },
            { nick: user.nick.toLowerCase() } 
        ]}).exec((err, users) => {

            if(err){return res.status(500).send({ message: "Error en la peticion de usuarios"}) }
            
            if(users && users.length >= 1) {
                return res.status(200).send({ message: "El usuario que intenta registrar ya existe"});
            } else {

                // Cifra y guarda los datos
                bcrypt.hash(params.password, null, null, (err, hash) =>{
                    user.password = hash;
                });

                user.save((err, userStored) => {
                    if(err) {
                        return res.status(500).send({ message: "Error al guardar el usuario"});
                    }

                    if(userStored){
                        res.status(200).send({user: userStored});

                    } else{
                        res.status(404).send({ message: "No se ha registrado el usuario"});
                    }
                })
            }

        });

      

    } else {
        res.status(200).send({
            message: "Envia todos los campos necesarios!"
        });
    }
}

function loginUser(req, res) {
    var params = req.body;

    var email = params.email;
    var password = params.password;

    User.findOne({email: email}, (err, user) => {
        if(err) {return res.status(500).send({message: "Error en la petición"})}
   
        if(user) {
            bcrypt.compare(password, user.password, (err, check) => {
                if(check) {

                    if(params.gettoken){
                        // generar y Devolver token
                        return res.status(200).send({
                            token: jwt.createToken(user)
                        });
                    } else {
                        //devolver datos del usuario
                        user.password= undefined;
                        return res.status(200).send({user});
                    }
        
                } else {
                    return res.status(404).send({message: "El usuario no se ha podido identificar"});
                }

            });
        } else {
            return res.status(404).send({message: "El usuario no se ha podido identificar o no existe"});
        }
    })
}

function getUser(req, res) {
    var userId = req.params.id;

    User.findById(userId, (err, user) => {
        if(err) {return res.status(500).send({message: "Error en la petición"})}
        
        if(!user){ return res.status(404).send({message: "El usuario no existe"})}
        
        followThisUser(req.user.sub, userId).then((value)=>{
            user.password = undefined;
            return res.status(200).send({
                user, 
                following: value.following,
                followed: value.followed,
            });
        });
    });
}

async function followThisUser(identity_user_id, user_id) {
    var following = await Follow.findOne({ "user": identity_user_id, "followed": user_id }).exec().then((follow) => {
        return follow;
    }).catch((err) => {
        return handleError(err);
    });
 
    var followed = await Follow.findOne({ "user": user_id, "followed": identity_user_id }).exec().then((follow) => {
        return follow;
    }).catch((err) => {
        return handleError(err);
    });
 
 
    return {
        following: following,
        followed: followed
    }
}

function getUsers(req, res) {
    var identity_user_id = req.user.sub;

    var page = req.params.page ?  req.params.page : 1;
    var itemsPerPage = 5;

    User.find().sort('_id').paginate(page, itemsPerPage, (err, users, total) => {
        if(err) {return res.status(500).send({message: "Error en la petición"})}
        
        if(!users){ return res.status(404).send({message: "No hay usuarios disponibles"})}

        followUserIds(identity_user_id).then((value) => {

            return res.status(200).send({
                users,
                users_following : value.following,
                users_follow_me : value.followed,
                total,
                pages : Math.ceil(total/itemsPerPage),
    
            });

        });
       
    });

}

async function followUserIds(user_id){
    try{
        var following= await Follow.find({"user":user_id}).select({'_id':0,'__v':0,'user':0}).exec()
        .then((follows)=>{return follows;}).catch((err)=>{return handleError(err)});
 
        var followed= await Follow.find({"followed":user_id}).select({'_id':0,'__v':0,'followed':0}).exec()
        .then((follows)=>{return follows;}).catch((err)=>{return handleError(err)});
    
       //Procesar following Ids
        var following_clean = [];
        following.forEach((follow)=>{
            following_clean.push(follow.followed);
        });
    
       //Procesar followed Ids
        var followed_clean = [];
        followed.forEach((follow)=>{
            followed_clean.push(follow.user);
        });
        return{
            following: following_clean,
            followed: followed_clean
        } 
    
        }catch(e){
            console.log(e);
        }
   }

function getCounters(req, res) {

    var userId = req.params.id ? req.params.id : req.user.sub;

    getCountFollow(userId).then((value) =>{
        return res.status(200).send(value);
    });


}
async function getCountFollow(user_id) {
    var following = await Follow.count({'user':user_id}).exec()
    .then((count) =>{
        return count;
    }).catch((err) => {
        return handleError(err);
    });

    var followed = await Follow.count({'followed':user_id}).exec()
    .then((count) =>{
        return count;
    }).catch((err) => {
        return handleError(err);
    });

    var publications = await Publication.count({'user' : user_id}).exec()
    .then((count) =>{
        return count;
    }).catch((err) => {
        return handleError(err);
    });

    return {
        following: following,
        followed: followed,
        publications: publications,
    }
}


function updateUser(req, res) {
 
    const userId = req.params.id;
    const update = JSON.parse(req.body.user);
   
   
    // borrar la contraseña
    delete update.password;
   
    // comprobamos que el usuario modifique sus datos
    if (userId !== req.user.sub) {
      return res.status(500).send({
        message: 'No tiene permisos suficiente para modificar los datos.'
      });
    }
   
    
    User.find({ $or: [{ email: update.email }, { nick: update.nick }] }).exec((err,users)=>{
     
      var userExiste = false;
      users.forEach((user)=>{
        if(user && user._id != userId) {
          userExiste = true;
        }
      });
   
    
      if(userExiste){
        return res.status(404).send({message:'Los datos ya están en uso.'});
      } 
      
      // mongoose me devuelve el objeto user original, por lo cual le tengo que pasar un tercer parametro.(new:true)
      // para que me vuelva el objeto userUpdated actualizado.
      User.findByIdAndUpdate(userId, update, { new: true }, (err, userUpdated) => {
        
        if (err) return res.status(500).send({ message: 'Error en la petición.' });
    
        if (!userUpdated)
          return res
            .status(404)
            .send({ message: 'No se ha podido actualizar el usuario.' });
    
        return res.status(200).send({ user: userUpdated });
      });
    });
   
   
  }


function uploadImage(req, res) {
    var userId = req.params.id;

    if (req.files) {
        var file_path = req.files.image.path;
        var file_split = file_path.split('\\');

        var file_name = file_split[2];
        var ext_split = file_name.split('\.');
        var file_ext = ext_split[1];

        if (userId != req.user.sub) {
            return removeFilesOfUpload(res, file_path, "No tienes permisos para actualizar los datos del usuario");
        }

        var ext_allow = ['png', 'jpg', 'jpeg', 'gif'];

        if (ext_allow.includes(file_ext)) {

            //Actualizar documento de usuario logado           
            User.findByIdAndUpdate(userId, {image : file_name}, {new: true}, (err, userUpdated)=>{
                if (err) {return res.status(500).send({message: "Error en la petición"})}
        
                if (!userUpdated) {
                    return res.status(404).send({message: "No se ha podido actulizar el usuario"});   
                }
        
                return res.status(200).send({user: userUpdated});
            });

        } else {
           return removeFilesOfUpload(res, file_path, "Extensión no válida");
        }

    } else {
        return res.status(200).send({message: "No se ha subido imágenes"});
    }
}

function removeFilesOfUpload(res, file_path, message) {
    fs.unlink(file_path, (err) =>{
        return res.status(200).send({message: message});
    });
}

function getImageFile(req, res) {
    var image_file = req.params.imageFile;
    var path_file = `./upload/users/${image_file}`;

    fs.exists(path_file, (exists)=>{
        if(exists) {
            res.sendFile(path.resolve(path_file));
        } else {
            res.status(200).send({message: "No existe la imagen"});
        }
    });
}

module.exports = {
    home,
    pruebas,
    saveUser,
    loginUser,
    getUser,
    getUsers,
    getCounters,
    updateUser,
    uploadImage,
    getImageFile,
}

