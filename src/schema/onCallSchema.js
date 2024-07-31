const mongoose = require('mongoose');

const OnCallingSchema =  new mongoose.Schema({
    guiche: { type: String, required: true },
    senha: { type: Number, required: true },
    info: { type: String, required: true },
    atendente: { type: String, required: true},
    callStart: {type: String, required: true }
});

const getCallingModel = (collectionName) => {
    return mongoose.model('OnCall', OnCallingSchema, collectionName);

}

module.exports = getCallingModel;