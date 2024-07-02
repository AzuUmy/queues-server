const mongoose = require('mongoose');

const PreferencialSchema = new mongoose.Schema({
    senha: {type: Number, required: true},
    time: {type: String, reequired: true},
    info: {type: String, required: true}
});

const getPreferencialModel = (collectionName) => {
    return mongoose.model('Preferencial', PreferencialSchema, collectionName);
};

module.exports = getPreferencialModel;