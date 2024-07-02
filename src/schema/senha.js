const mongoose = require('mongoose');

const senhaSchema = new mongoose.Schema({
    senha: { type: Number, required: true },
    time: { type: String, required: true },
    info: {type: String, required: true}
});

const getSenhaModel = (collectionName) => {
    return mongoose.model('Senha', senhaSchema, collectionName);
};

module.exports = getSenhaModel;