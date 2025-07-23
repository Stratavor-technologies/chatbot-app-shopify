const express = require("express");
const Router = express.Router();
const Stores = require('../models/stores');
const gorgias = require("../functions");

Router.put("/stores/update", async (req, res) => {
    if(!req.body.integration || !req.body.integration_type){
        return res.status(200).send({
            success: false,
            message: `Store not updated!`
        });
    }

    if(req.body.integration_type == "gorgias"){
        var integration = req.body.integration.value;
        var getAccount = await gorgias.checkGorgiasAccount(integration.apiUrl, integration.email, integration.apiKey);
    
        if(!getAccount){
            return res.status(200).send({
                success: false,
                message: `Invalid details!`
            });
        }
    }

    var updatedStore = await Stores.findOneAndUpdate({store_id: req.query.store_id}, {
        "integration": req.body.integration,
        "integration_type": req.body.integration_type
    });

    if(updatedStore){
        return res.status(200).send({
            success: true,
            message: `Store updated!`
        });
    }else{
        return res.status(200).send({
            success: false,
            message: `Store not updated!`
        });
    }
});

Router.get("/stores/get", async (req, res) => {
    var storeData = await Stores.findOne({"store_id": req.query.store_id});
    
    if(storeData){
        return res.status(200).send({
            success: true,
            message: `Store found!`,
            data: storeData
        });
    }else{
        return res.status(200).send({
            success: false,
            message: `Store not found!`,
            data: {}
        });
    }
});

Router.put("/stores/update/mailer", async (req, res) => {
    var updatedStore = await Stores.findOneAndUpdate({store_id: req.query.store_id}, {
        "mailer_name": req.body.mailer_name,
        "mailer_auth": req.body.mailer_auth
    });

    if(updatedStore){
        return res.send({
            success: true,
            message: `Mailer Updated!`
        });
    }else{
        return res.send({
            success: false,
            message: `Mailer not Updated!`
        });
    }
});

module.exports = Router;