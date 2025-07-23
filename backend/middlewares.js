const Stores = require("./models/stores");
const Training = require("./models/training");
const openai = require("./functions");

const update_store_data = async (req, res, next) => {
    try {
        var storeId = req.query.store_id;
        if(storeId){
            var storeData = await Stores.find({"store_id": storeId});

            // console.log("storeData: ", storeData)

            if(storeData != ""){
                let trainingData = await Training.find({"storeId": storeId});

                // console.log(trainingData);

                // if(trainingData != ""){
                //     let tune_id = trainingData[0].fine_tune_id;
                //     let modelData = await openai.listSingle_fineTune(tune_id);
                //     // console.log(modelData);

                //     if(modelData.status == "succeeded"){
                //         var model_id = modelData.fine_tuned_model;
                //         await Stores.findOneAndUpdate({"store_id": storeId}, {
                //             "training_model": model_id
                //         });
                //     }
                // }
            }else{
                var response = await new Stores({
                    store_id: storeId
                }).save();  
                
                // console.log("response: ", response);
            }
            next();
        }else{
            res.status(401).send({
                success: false,
                message: "Store id is required!"
            });
        }
    } catch (err){
        res.status(500).send({
            success: false,
            message: err
        });
    }

}

module.exports = update_store_data;
