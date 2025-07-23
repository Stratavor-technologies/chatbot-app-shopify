const mongoose = require("mongoose");

const Stores = new mongoose.Schema({
    store_id: {
        type: String,
        unique: true,
        required: true
    },
    training_model: {
        type: String,
        default: null
    },
    integration: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
    integration_type: {
        type: String,
        default: "admin"
    },
    mailer_name: {
        type: String,
        default: null
    },
    mailer_auth: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    }
}, {timestamps: true});

module.exports = new mongoose.model("stores", Stores);