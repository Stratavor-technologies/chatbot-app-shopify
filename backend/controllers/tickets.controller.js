require('dotenv').config({path: "../config.env"});
const Tickets = require("../models/tickets");
const express = require("express");
const Router = express.Router();
const Chats = require("../models/chats");
const gorgias = require("../functions");
const functions = require("../functions");


Router.post("/ticket/create", async (req, res) => {
    var checkTickets = await Tickets.find({subject: req.body.subject, customer_email: req.body.customer_email});

    if(checkTickets[0]){
       return res.status(200).send({
            status: false,
            message: `Your ticket already created!`,
            data: ''
       });
    }

    let ticketData = {
        store_id: req.query.store_id,
        subject: req.body.subject,
        customer_email: req.body.customer_email,
        status: req.body.status
    }

    var result = {}
    var conversation = req.body.conversation;

    if(!conversation){
        result.status = false;
        result.message = 'Conversation is empty!';
        result.data = {};

        return res.status(200).send(result);
    }

    var ticket = await new Tickets(ticketData).save();
    var admin_ticket_id = ticket._id;

    if(ticket){
        let chats = [];
        var index = 0;
        var check_gorgias = await gorgias.isGorgiasIntegration(req.query.store_id);
        
        if(check_gorgias){
            var gorgias_ticketData = 
            {
                "customer": {
                    "email": req.body.customer_email
                },
                "messages": [],
                "channel": "api",
                "from_agent": false,
                "status": "open",
                "via": "api"
            }
        }

        var chatMessages = [];
        await Promise.all(conversation.map(async (item) => {
            index += 1;
            var chatData = {
                store_id: req.query.store_id, 
                sender: item.sender, 
                message: item.message, 
                ticket_id: ticket._id,
                chat_index: index
            }
            var messageDateTime = item.messageDateTime;

            // create message in ticket
            if(check_gorgias){
                if(item.sender == "assistant"){
                    var messageFrom = {
                        "name": "Assistant",
                        "address": check_gorgias
                    }

                    var messageTo = {
                        "name": "User",
                        "address": req.body.customer_email
                    }

                    var senderMail = check_gorgias;
                    var receiverMail = req.body.customer_email;
                }else{
                    var messageFrom = {
                        "name": "User",
                        "address": req.body.customer_email
                    }

                    var messageTo = {
                        "name": "Assistant",
                        "address": check_gorgias
                    }

                    var senderMail = req.body.customer_email;
                    var receiverMail = check_gorgias;
                }

                var ticketMessage = {
                    "channel": "email",
                    "from_agent": item.sender == "assistant" ? true : false,
                    "source": {
                        "type": "email",
                        "from": messageFrom,
                        "to": [ messageTo ]
                    },
                    "via": "api",
                    "body_html": item.message,
                    "body_text": item.message,
                    "created_datetime": messageDateTime,
                    "failed_datetime": null,
                    "receiver": {
                        "email": receiverMail
                    },
                    "sender": {
                        "email": senderMail
                    },
                    "sent_datetime": messageDateTime,
                    "subject": req.body.subject
                }

                gorgias_ticketData.messages.push(ticketMessage);

            }
            
            chats.push(chatData);
        }));

        if(check_gorgias){
            var generatedTicketData = await gorgias.gorgiasCreateTicket(req.query.store_id, gorgias_ticketData);
            if(generatedTicketData){
                var gorgias_ticket_id = generatedTicketData.id;

                await Tickets.updateOne({"_id": admin_ticket_id}, {
                    gorgias_ticket_id: gorgias_ticket_id
                });
            }
        }

        var chatsResult = await Chats.insertMany(chats);

        if(chatsResult){
            var userSubject = `Ticket Created Successfully`;
            var userMessage = `
                <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Ticket Created Successfully</title>
                    </head>
                    <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
                        <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; padding: 20px; border-radius: 5px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
                            <h1 style="color: #333333;">Your Ticket #${admin_ticket_id} has been Opened</h1>
                            <p style="color: #555555; line-height: 1.6;">Your support ticket has been successfully created. Our team will review it shortly and get back to you as soon as possible.</p>
                            <p style="color: #555555; line-height: 1.6;">For further assistance or updates on your ticket, please feel free to contact us.</p>
                        </div>
                    </body>
                </html>`;

            var adminSubject = `New Ticket Created on Store`;
            var adminMessage = `
                <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>New Ticket Opened</title>
                    </head>
                    <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
                        <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; padding: 20px; border-radius: 5px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
                            <h1 style="color: #333333;">New Ticket #${admin_ticket_id} has been Opened on your Store</h1>
                            <p style="color: #555555; line-height: 1.6;">A new support ticket has been successfully created on your store from user "${req.body.customer_email}". Please reply to him as soon as possible. </p>
                            <p style="color: #555555; line-height: 1.6;">Check your shopify admin dashboard for full conversation with chatbot.</p>
                        </div>
                    </body>
                </html>`;
            // var message = `We have received your ticket regarding your concern "${req.body.subject}". We will reply you shortly`;
            functions.sendMail(req.query.store_id, req.body.customer_email, userSubject, userMessage);
            var sendMail = functions.sendMail(req.query.store_id, "admin", adminSubject, adminMessage);

            if(sendMail){
                result.status = true;
                result.message = `Thank you, your ticket has been created successfully.`;
                result.data = ticket;
            }else{
                result.status = false;
                result.message = `Sorry We currently unable to send the mail!`;
                result.data = ticket;
            }

        }else{
            result.status = false;
            result.message = `Something went wrong.`;
            result.data = ticket;
        }

        res.status(200).send(result)
    }else{
        result.status = false;
        result.message = `Something went wrong, Ticket not created`;
        result.data = ticket;

        res.status(200).send(result)
    }
});


Router.get("/tickets", async (req, res) => {

    var ticket = await Tickets.find({"store_id": req.query.store_id});
    var result = {}

    if(ticket){
        result.status = true;
        result.message = `Tickets found!`;
        result.data = ticket;

        res.status(200).send(result)
    }else{
        result.status = false;
        result.message = `Tickets not found`;
        result.data = ticket;

        res.status(200).send(result)
    }
});

Router.post("/ticket/delete", async (req, res) => {
    var ticketId = req.body.ticket_id;
    var getTicket = await Tickets.findOne({"_id": ticketId});
    if(!getTicket){
        return res.status.send({
            success: false,
            message: `Ticket already deleted`
        });
    }

    var deleted = await Tickets.deleteOne({"_id": ticketId});
    var result = {}

    if(deleted){
        await Chats.deleteMany({ticket_id: ticketId});
        
        var gorgias_ticket_id = getTicket.gorgias_ticket_id;
        await gorgias.deleteGorgiasTicket(req.query.store_id, gorgias_ticket_id);

        result.status = true;
        result.message = `Ticket Deleted Successfully.`;
        result.data = deleted;

        res.status(200).send(result)
    }else{
        result.status = false;
        result.message = `Error Deleting the ticket`;
        result.data = deleted;

        res.status(200).send(result)
    }
});


Router.get("/ticket/get", async (req, res) => {
    var ticketId = req.query.ticket_id;
    var singleTicket = await Tickets.find({"_id": ticketId});
    var result = {}

    if(singleTicket[0]){
        result.status = true;
        result.message = `Ticket found`;
        result.data = singleTicket;

        res.status(200).send(result)
    }else{
        result.status = false;
        result.message = `Ticket not found`;
        result.data = singleTicket;

        res.status(200).send(result)
    }
});

module.exports = Router;