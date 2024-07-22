const mongoose = require('mongoose');

const onlineUser = new mongoose.Schema({
    guiche: { type: String, required: true },
    atendente: { type: String, required: true },
    status: {type: String, required: true }
});

const getOnlineUser = (collectionName) => {
    return mongoose.model('activeUsers', onlineUser, collectionName);
};

module.exports = getOnlineUser;