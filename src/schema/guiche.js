const mongoose = require('mongoose');

const guicheSchema = new mongoose.Schema({
    guiche: {type: String, required: true}
});

const getGuicheModel = (collectionName) => {
    return mongoose.model('Guiche', guicheSchema, collectionName);
};

module.exports = getGuicheModel;