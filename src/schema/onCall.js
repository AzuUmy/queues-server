const { required } = require('joi');
const mongoose = require('mongoose');

const callingSchema =  new mongoose.Schema({
    guiche: { type: String, required: true },
    senha: { type: Number, required: true },
    info: { type: String, required: true },
    atendente: { type: String, required: true}
});

const getCallingModel = (collectionName) => {
    return mongoose.model('Calling', callingSchema, collectionName);

}


module.exports = getCallingModel;
