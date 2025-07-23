const mongoose = require('mongoose');

const Chats = new mongoose.Schema({
    store_id: {
        type: String
    },
    sender: {
        type: String
    },
    message: {
        type: String
    },
    ticket_id: {
        type: String
    },
    chat_index: {
        type: Number
    },
    gorgias_msg_id: {
        type: String,
        default: null
    }
}, {timestamps: true});

module.exports = new mongoose.model("chats", Chats);