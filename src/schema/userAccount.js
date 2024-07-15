const { required } = require('joi');
const mongoose = require('mongoose');

const userData = new mongoose.Schema({
    nome: {type: String, required: true},
    email: {type: String, required: true },
    matricula: {type: Number, required: true},
    senha: {type: String, required:true},
    guiche: {type: String, required: true}
});

const getUserDataModel = (collectionName) => {
    return mongoose.model('userAccount', userData, collectionName);
};

module.exports = getUserDataModel;
