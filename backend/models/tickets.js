const mongoose = require("mongoose");
const TicketModel = new mongoose.Schema({
    store_id: {
        type: String
    },
    subject: {
        type: String
    },
    customer_email: {
        type: String
    },
    gorgias_ticket_id:{
        type: String,
        default: null
    },
    status: {
        type: String
    }
}, { timestamps: true });

module.exports = new mongoose.model("tickets", TicketModel);