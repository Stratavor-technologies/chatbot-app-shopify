const mongoose = require("mongoose");

const Orders = new mongoose.Schema({
    order_id: {
        type: String,
        unique: true,
        required: true
    },
    name: {
        type: String,
        default: null
    },
    tracking_no: {
        type: Array,
        default: null
    },
}, {timestamps: true});

module.exports = new mongoose.model("orders", Orders);