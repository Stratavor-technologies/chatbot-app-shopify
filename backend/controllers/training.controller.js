require('dotenv').config({ path: '../config.env' });
const express = require('express');
const Router = express.Router();
const csv = require('csv-parser');
const fs = require('fs');
const multer = require("multer");
const openai = require("../functions");
const path = require('path');

// models
const Training = require("../models/training");
const Stores = require("../models/stores");

async function convertCSVtoJSONL(csvFilePath, jsonlFilePath) {
    const jsonlData = [];
    await new Promise((resolve, reject) => {
        fs.createReadStream(csvFilePath)
            .pipe(csv())
            .on('data', (row) => {
                // Convert each CSV row to JSON object
                const jsonEntry = {
                    messages: [
                            {
                                role: "user",
                                content: row.prompt
                            },
                            {
                                role: "assistant",
                                content: row.completion
                            }
                        ]
                };
                jsonlData.push(JSON.stringify(jsonEntry));
            })
            .on('end', () => {
                // Write JSONL data to file
                fs.writeFileSync(jsonlFilePath, jsonlData.join('\n'));
                resolve();
            })
            .on('error', (error) => {
                reject(error);
            });
    });
}

//csv file upload
const diskStorage = multer.diskStorage({
    "destination": `./training_uploads/csv`,
    "filename": (req, file, cb) => {
        let csvfileName = `${file.originalname.split('.')[0]}.csv`;
        cb(null, `${req.query.store_id}-${Date.now()}-${csvfileName}`)
    }
});
const uploadCsv = multer({storage: diskStorage});

Router.post("/training/upload-csv", uploadCsv.single("training_csv"), async (req, res) => {
    let csvfileName = `${req.file.originalname.split('.')[0]}.csv`;
    var jsonlfileName = `${req.file.originalname.split('.')[0]}.jsonl`;

    const csvFilePath = `${__dirname}/../training_uploads/csv/${req.file.filename}`;
    const jsonlFilePath = `${__dirname}/../training_uploads/jsonl/${req.file.filename.split(req.file.originalname)[0]}${jsonlfileName}`;
    await convertCSVtoJSONL(csvFilePath, jsonlFilePath);

    // var preparedFile = await openai.createFaqFile(jsonlfileName);
    // var fineTune = await openai.createFineTuneJob(preparedFile.id, req.body.storeId);
    
    const training_data = await new Training({
        "storeId": req.query.store_id,
        "csvfilepath": `${process.env.API_URL}:${process.env.PORT}/training_uploads/csv/${req.file.filename}`,
        "csvfilename": csvfileName,
        "jsonlfilepath": `${process.env.API_URL}:${process.env.PORT}/training_uploads/jsonl/${jsonlFilePath.split("/jsonl/")[1]}`,
        "jsonlfilename": jsonlfileName,
        // "file_id": preparedFile.id,
        // "fine_tune_id": fineTune.id
    }).save();

    var result = {};
    if(training_data){
        result.success = true;
        result.message = `Training added`;
        result.data = training_data;
    }else{
        result.success = false;
        result.message = `Error adding the training`;
        result.data = {};
    }

    res.status(200).send(result);
});


Router.get("/trainings", async (req, res) => {
    // await Training.sync();
    let t_data = await Training.find({"storeId": req.query.store_id}).sort({"createdAt": -1}).exec();
    // await Promise.all(t_data.map(async (t) => {
    //     // let tuneId = t.fine_tune_id;
    //     // let fineTune = await openai.listSingle_fineTune(tuneId);
    //     // t = t.toObject(); // Convert to plain JavaScript object
    //     // t.fine_tune_status = fineTune.status;
    //     t.fine_tune_status = "Success";
    //     console.log(JSON.stringify(t_data[0]._id));
    //     result.push({"csvfilename": t.csvfilename, "createdAt": t.createdAt, "fine_tune_status": t.fine_tune_status, "csvfilepath": t.csvfilepath, "tune_id": t_data._id});
    // }));

    if(t_data[0]){
        return res.status(200).send({
            success: true,
            message: `Tickets Found!`,
            data: t_data
        });
    }else{
        return res.status(200).send({
            success: false,
            message: `Tickets not Found!`,
            data: {}
        });
    }

});

// Router.post("/training/delete", async (req, res) => {
//     let tune_id = req.body.tune_id;

//     let funeTune = await openai.listSingle_fineTune(tune_id);
//     let result = {};
//     if(funeTune.status == "cancelled"){
//         result.success = false;
//         result.message = `Job is already cancelled`;
//         return res.status(200).send(result);
//     }

//     if(funeTune.status == "succeeded"){
//         result.success = false;
//         result.message = `Job is succeeded successfully and can't be cancelled!`;
//         return res.status(200).send(result);
//     }

//     let status = await openai.cancelFineTuningJob(tune_id);
//     console.log("Canceled tuning status: ", status);

//     result.success = true;
//     result.message = `Job cancelled!`;
//     return res.status(200).send(result);
// });

Router.delete("/trainings/delete/:id", async (req, res) => {
    // console.log("req.params.id: ", req.params.id);
    var fileData = await Training.findOne({"_id": req.params.id});
    var result = {}
    
    if(fileData){

        // console.log("orignla", fileData.csvfilepath);
        // console.log(fileData.csvfilepath.split("/csv/")[1]);
        // console.log("csvfilename: ", fileData.csvfilepath.split("/csv/")[1]);
        // console.log("jsonlfilename: ", fileData.jsonlfilepath.split("/jsonl/")[1]);
        // return false;
        var csvfilename = path.join(__dirname, '../training_uploads/csv/' , fileData.csvfilepath.split("/csv/")[1]);

        var jsonlfilename = path.join(__dirname, '../training_uploads/jsonl/' , fileData.jsonlfilepath.split("/jsonl/")[1]);


        fs.unlink(csvfilename, function(err){
            if (err) throw err;
        });

        fs.unlink(jsonlfilename, function(err){
            if (err) throw err;
        });

        await Training.deleteOne({"_id": req.params.id}) 
        .then(response => {
            result.success = true;
            result.message = `File Deleted!`;
        }).catch(err => {
            result.success = false;
            result.message = `File not Deleted!`;
        })
    }else{
        result.success = false;
        result.message = `File not Found!`;
    }

    res.status(200).send(result);
});


Router.get("/test", (req, res) => {
    res.send("Hello working");
});


module.exports = Router;