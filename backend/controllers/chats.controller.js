require('dotenv').config({ path: '../config.env' });
const express = require('express');
const Router = express.Router();
const openai = require("../functions");
const Training = require("../models/training");
const Chats = require('../models/chats');
const fs = require("fs");
const gorgias = require("../functions");
const Tickets = require("../models/tickets");
const functions = require("../functions");
const path = require('path');

Router.post("/send-message", async (req, res) => {
    var customerMsg = req.body.message;
    try {
        var model_id = await openai.get_store_model(req.query.store_id);
        var trainingData = await Training.find({"storeId": req.query.store_id});
        var t_data = "";
        await Promise.all(trainingData.map(async (single_t) => {
            // var trainingFile = `./training_uploads/jsonl/${single_t.jsonlfilename}`;
            var trainingFile = path.join(__dirname, '../training_uploads/jsonl/' , single_t.jsonlfilepath.split("/jsonl/")[1]);
    
            var s_data = await fs.promises.readFile(trainingFile, 'utf8');
            t_data = `${t_data}\n${s_data}`;
        }));

        const completion = await openai.createCompletion(model_id, customerMsg, t_data);
        res.json(completion.choices[0]);
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'An error occurred' });
    }
});

Router.post("/chats/new", async (req, res) => {
    var ticketData = await Tickets.findOne({"_id": req.body.ticket_id});
    if(!ticketData){ 
        return res.send({
            success: false,
            message: `Ticket not found!`
        });
    }
    var data = {
        store_id: req.query.store_id,
        sender: req.body.sender,
        message: req.body.message, 
        ticket_id: req.body.ticket_id,
        chat_index: req.body.chat_index
    }

    var result = await new Chats(data).save();
    var messageDateTime = req.body.messageDateTime;

    
    if(result){
        var check_gorgias = await gorgias.isGorgiasIntegration(req.query.store_id);
        var userMail = ticketData.customer_email;
        var subject = `#${req.body.ticket_id} response from Support`;
        var message = `${req.body.message}`;
        functions.sendTicketReply(req.query.store_id, userMail, subject, message, req.body.ticket_id);
        
        if(check_gorgias){

            if(req.body.sender == "assistant"){
                var messageFrom = {
                    "name": "Assistant",
                    "address": check_gorgias
                }

                var messageTo = {
                    "name": "User",
                    "address": userMail
                }

                var senderMail = check_gorgias;
                var receiverMail = userMail;
            }else{
                var messageFrom = {
                    "name": "User",
                    "address": userMail
                }

                var messageTo = {
                    "name": "Assistant",
                    "address": check_gorgias
                }

                var senderMail = userMail;
                var receiverMail = check_gorgias;
            }

            var ticketMessage = {
                "channel": "email",
                "from_agent": req.body.sender == "assistant" ? true : false,
                "source": {
                    "type": "email",
                    "from": messageFrom,
                    "to": [ messageTo ]
                },
                "via": "api",
                "body_html": req.body.message,
                "body_text": req.body.message,
                "created_datetime": messageDateTime,
                "failed_datetime": null,
                "receiver": {
                    "email": receiverMail
                },
                "sender": {
                    "email": senderMail
                },
                "sent_datetime": messageDateTime,
                "subject": ticketData.subject
            }
            var addedMessage = await gorgias.addTicketMessage(req.query.store_id, ticketData.gorgias_ticket_id, ticketMessage);
            if(addedMessage.success === false){
                return res.send({
                    success: false,
                    message: addedMessage.message
                });
            }
        }

        return res.send({
            success: true,
            message: `Message Sent`
        });
    }else{
        return res.send({
            success: false,
            message: `Message not Sent`
        })
    }
});

Router.get('/chats', async (req, res) => {
    var chats_list = await Chats.find({ticket_id: req.query.ticket_id});

    var result = {}
    if(chats_list[0]){
        result.status = true;
        result.message = `Chats found!`;
        result.data = chats_list
    }else{
        result.status = false;
        result.message = `No Chats found!`;
        result.data = ""
    }

    res.status(200).send(result);
});


// const Shopify = require('shopify-api-node');

// const shopify = new Shopify({
//   shopName: 'ai-chatbot-anjali',
//   apiKey: 'a714ad6f5d0c0e11b2eadd6f230b8d30',
//   password: 'shpua_7d92934fa8b84f2d8303a5584cbf6a5f'
// });

// const getProducts = async (req, res) => {
//     try{
//         var products = await shopify.product.list({ limit: 10 });
//         console.log("products: ", products);

//     } catch (err){
//         console.log(err);
//     }
// }

// getProducts();

module.exports = Router;
