require('dotenv').config({path: "./config.env"});
const config = require("./chatgptConfig");
const openai = config.openai;
const fs = require("fs");
const Stores = require("./models/stores");
const axios = require("axios");
const nodemailer = require('nodemailer');

const getGorgiasConfig = async (store_id) => {
    var storeData = await Stores.findOne({store_id: store_id});
    if(storeData){
        return {
                apiUrl: storeData.integration.value.apiUrl, 
                email: storeData.integration.value.email, 
                apikey: storeData.integration.value.apiKey
            }
    }else{
        return false;
    }
}

const getGorgiasHeaders = async (store_id) => {
    var config = await getGorgiasConfig(store_id);
    if(config){
        var email = config.email;
        var apikey = config.apikey;
        
        var auth = Buffer.from(`${email}:${apikey}`, 'utf8').toString('base64');
        
        var headers = {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/json'
        }
    }else{
        return false;
    }

    return headers;
}

const gorgiasGetApiUrl = async (store_id) => {
    var config = await getGorgiasConfig(store_id);
    if(config){
        var apiUrl = config.apiUrl;

        return apiUrl;
    }else{
        return false;
    }
}

const gorgiasCreateTicket = async (store_id, bodyParams) => {
    if(Object.keys(bodyParams).length == 0){
        return res.status(200).send({
            status: false,
            message: `Body is empty`
        });
    }

    var headers = await getGorgiasHeaders(store_id);
    var apiUrl = await gorgiasGetApiUrl(store_id);

    try{
        var g_ticket = await axios.post(`${apiUrl}/tickets`, bodyParams, {
            headers: headers,
        });

        return g_ticket.data;
    } catch (error) {
        return error;
    }
}

const gorgiasGetTickets = async (store_id) => {
    var result = {}
    var headers = await getGorgiasHeaders(store_id);
    var apiUrl = await gorgiasGetApiUrl(store_id);
    try {
        var g_ticket = await axios.get(`${apiUrl}/tickets`, {
            headers: headers
        });

        result.status = true;
        result.message = `Ticket found`;
        result = g_ticket.data;

    } catch (error) {
        console.log(error);

        result.status = false;
        result.message = `Ticket not ound`;
        result.data = error;
    }

    return result;
}

const isGorgiasIntegration = async (store_id) => {
    var storeData = await Stores.findOne({store_id: store_id});
    if(storeData){
        if(storeData.integration_type == "gorgias"){
            return storeData.integration.value.email;
        }else{
            return false;
        }
    }else{
        return false;
    }
}

const checkGorgiasAccount = async (apiUrl, email, password) => {
    var authToken = Buffer.from(`${email}:${password}`, 'utf8').toString('base64');
    var headers = {
        'Authorization': `Basic ${authToken}`
    }

    var result;
    await axios.get(`${apiUrl}/account`, {headers: headers})
    .then((response) => {
        result = true;
    }).catch((error) => {
        result = false;
    })

    return result;
}

const deleteGorgiasTicket = async (store_id, ticket_id) => {
    var headers = await getGorgiasHeaders(store_id);
    var apiUrl = await gorgiasGetApiUrl(store_id);
    var result;

    await axios.delete(`${apiUrl}/tickets/${ticket_id}`, {headers: headers})
    .then(response => {
        result = response.data;
    }).catch(err => {
        result = err;
    });

    return result;
}

// const runfn = async () => {
//     console.log(await deleteGorgiasTicket("quickstart-80f0f545.myshopify.com", "111111585"));
// }

// runfn();

const addTicketMessage = async (store_id, ticket_id, bodyParams) => {
    var headers = await getGorgiasHeaders(store_id);
    var apiUrl = await gorgiasGetApiUrl(store_id);
    var result = {}

    try {
        var addedMessage = await axios.post(`${apiUrl}/tickets/${ticket_id}/messages`, bodyParams, {
            headers: headers
        });

        if(addedMessage){
            result.success = true;
            result.message = `Message added to the ticket!`;
            result.data = response.data;
        }

        return result;
    } catch (error) {
        console.error("Error:", error.response.data);

        result.success = false;
        result.message = error.response.data.error.msg;

        return result;
    }
}

const get_store_model = async (store_id) => {
    var storeData = await Stores.find({"store_id": store_id});

    if(storeData[0].training_model !== null){
        return storeData[0].training_model;
    }else{
        return "gpt-3.5-turbo";
    }
}

const createFaqFile = async (file_name) => {
    var preparedFile = await openai.files.create({ file: fs.createReadStream(`./training_uploads/jsonl/${file_name}`), purpose: 'fine-tune' });
    console.log("preparedFile: ", preparedFile);
    return preparedFile;
}

const createFineTuneJob = async (file_id, store_id) => {
    var modelData = await get_store_model(store_id);
    var tune_response = await openai.fineTuning.jobs.create({
        model: modelData,
        training_file: file_id
    });

    console.log("tune_response: ", tune_response);

    return tune_response;
}

const listFineTunes = async () => {
    let fineTunes = await openai.fineTuning.jobs.list({ limit: 10 });

    console.log("fineTunes: ", fineTunes);

    return fineTunes;
}

// listFineTunes();

const listFiles = async () => {
    const files = await openai.files.list();

    console.log("files: ", files);

    return files;
}

// listFiles();

const listSingle_fineTune = async (tune_id) => {
    let fineTune = await openai.fineTuning.jobs.retrieve(tune_id);
    // console.log("fineTune: ", fineTune);

    return fineTune;
}

const createCompletion = async (model_id, customerMsg, questions) => {
    var trained_questions = "";
    if(questions != ""){
        trained_questions = `Here is the set of questions and answers below. You only have to answer to the questions that are included only in this dataset only you can modify the answer according to all the other questions and answers. Exact answers are not compulsory. If the questions that I am going to put will be out from this dataset then just say "I don't Know" and if I ask for provide tracking number of order then just say "enter number" Now the questions are: ${questions}`;
    }
    // customerMsg = "You are a custom tuned chatbot who gives answer related to only tuned questions and if this question will be not in the tuned questions then reply with Sorry i do not know. Now the question is: " + customerMsg;
    const completion = await openai.chat.completions.create({
        messages: [{ role: "user", content: trained_questions }, { role: "user", content: customerMsg }],
        model: model_id,
        temperature: 1,
        max_tokens: 256
    });

    return completion;
}

const cancelFineTuningJob = async (tune_id) => {
    let status = await openai.fineTuning.jobs.cancel(tune_id);
    return status;
}

const sendMail = async (store_id, to, subject, message) => {
    var storeData = await Stores.findOne({"store_id": store_id});

    if(!storeData){
        return false;
    }

    if(!storeData.mailer_name || !storeData.mailer_auth.user || !storeData.mailer_auth.pass){
        return false;
    }

    var mailer = nodemailer.createTransport({
        service: storeData.mailer_name,
        auth: {
            user: storeData.mailer_auth.user,
            pass: storeData.mailer_auth.pass
        }
    });

    if(to == "admin"){
        to = storeData.mailer_auth.user;
    } 

    var mailOptions = {
        from: storeData.mailer_auth.user,
        to: to,
        subject: subject,
        html: message
    }

    mailer.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
            return false;
        } else {
            return true;
        }
    });
}

const sendTicketReply = async (store_id, to, subject, message, ticket_id) => {
    var storeData = await Stores.findOne({"store_id": store_id});

    if(!storeData){
        return false;
    }

    if(!storeData.mailer_name || !storeData.mailer_auth.user || !storeData.mailer_auth.pass){
        return false;
    }

    var mailer = nodemailer.createTransport({
        service: storeData.mailer_name,
        auth: {
            user: storeData.mailer_auth.user,
            pass: storeData.mailer_auth.pass
        }
    });

    var htmlMessage = `
        <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>You got Ticket response</title>
            </head>
            <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
                <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; padding: 20px; border-radius: 5px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
                    <h1 style="color: #333333;">You got your ticket #${ticket_id} response from support.</h1>
                    <p style="color: #555555; line-height: 1.6;">${message}</p>
                </div>
            </body>
        </html>`;

    var mailOptions = {
        from: storeData.mailer_auth.user,
        to: to,
        subject: subject,
        html: htmlMessage
    }

    mailer.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
            return false;
        } else {
            return true;
        }
    });
}

module.exports = {
    createFaqFile,
    createFineTuneJob,
    listFineTunes,
    listFiles,
    listSingle_fineTune,
    get_store_model,
    createCompletion,
    cancelFineTuningJob,
    gorgiasCreateTicket,
    gorgiasGetTickets,
    isGorgiasIntegration,
    addTicketMessage,
    checkGorgiasAccount,
    getGorgiasConfig,
    deleteGorgiasTicket,
    sendMail,
    sendTicketReply
}