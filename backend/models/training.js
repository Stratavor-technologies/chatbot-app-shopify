const mongoose = require("mongoose");
const Training = new mongoose.Schema({
    "storeId": {
        type: String
    },
    "csvfilepath": {
        type: String
    },
    "csvfilename": {
        type: String
    },
    "jsonlfilepath": {
        type: String
    },
    "jsonlfilename": {
        type: String
    },
    // "file_id": {
    //     type: String
    // },
    // "fine_tune_id": {
    //     type: String
    // }
}, { timestamps: true });

module.exports = new mongoose.model("trainings", Training);