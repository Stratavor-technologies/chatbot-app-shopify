const API_URL = `https://techbinges.com`;
console.log("---test----");
function open_chatbox(){
    var chatboxicon = document.querySelector('.chatboxicon');
    var chatpopupbox = document.querySelector('.chatpopupbox');

    chatboxicon.classList.toggle("active");
    chatpopupbox.classList.toggle("active");
}

function close_chatbox(){
    var chatpopupbox = document.querySelector('.chatpopupbox');
    var chatboxicon = document.querySelector('.chatboxicon');

    chatpopupbox.classList.remove("active");
    chatboxicon.classList.toggle("active");
}

function generateTicket(button){



    if(document.querySelector(".validation_err_msg")){
        document.querySelector(".validation_err_msg").remove();
    }
    var userEmail = button.previousElementSibling.value;
    if(userEmail != ""){
        const response_data = document.querySelector('.response_data');
        var fullChat = document.querySelectorAll(".chatbox .response_data .client_msg, .chatbox .response_data .assistant_msg");
        var chatArray = [];
        fullChat.forEach(function(singleChat, key) {
            chatArray.push({
                "sender": singleChat.getAttribute("sender"), 
                "message": singleChat.querySelector('.chatbot_msg').innerHTML,
                "messageDateTime": singleChat.getAttribute("messageDateTime")
            });
        });


        var lastUserMsg = button.parentElement.previousElementSibling.previousElementSibling.querySelector(".chatbot_msg").innerHTML;

        var xhr = new XMLHttpRequest;

        let url = `${API_URL}/ticket/create?store_id=${Shopify.shop}`;
        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                // console.log("this.responseText: ", this.responseText);
                var apiResponse = JSON.parse(this.responseText);
                if(apiResponse.status === true){

                    if(apiResponse.status === true){
                        response_data.innerHTML += `
                            <div class="assistant_msg" sender="assistant"><div class='chatbot_msg'>${apiResponse.message}</div></div>
                        `;
                    }
                }else{
                    button.parentElement.innerHTML += `<p class='validation_err_msg' style='color: red;'>${apiResponse.message}</p>`;
                }
            }
        }


        xhr.send(JSON.stringify({ 
            "subject": lastUserMsg.trim(),
            "customer_email": userEmail.trim(),
            "conversation": chatArray,
            "status": "active" 
        }));
    }else{
        button.parentElement.innerHTML += `<p class='validation_err_msg' style='color: red;'>Please enter email!</p>`;
    }

}

function getTrackingNumber(button) {
    var userOrderId = button.previousElementSibling.value;

    var xhr = new XMLHttpRequest(); // Added parentheses after XMLHttpRequest

    let url = `${API_URL}/orders/get/trackingNo?store_id=${Shopify.shop}`;
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    const response_data = document.querySelector('.response_data');

    xhr.onreadystatechange = function () {

        if (this.readyState == 4) {
            if (this.status == 200) {
                var apiResponse = JSON.parse(this.responseText);
                if (apiResponse.success == true) {

                    response_data.innerHTML += `
                    <div class="client_msg" sender="user""><div class='chatbot_msg'>${userOrderId}</div></div>
                    `;
                    response_data.innerHTML += `
                        <div class="assistant_msg" sender="assistant"><div class='chatbot_msg'>${apiResponse.message}</div></div>`;

                        var elements = document.querySelectorAll('.disabletracking');
                        elements.forEach(function(element) {
                            element.style.display = 'none';
                        });

                } else  {
                    button.parentElement.innerHTML += `<p class='validation_err_msg' style='color: red;'>hello ${apiResponse.message}</p>`;
                }
            } else {
                
                console.error("Error occurred during XMLHttpRequest. Status:", this.status);
                // Handle error, maybe display a message to the user
            }
        }
    };

    xhr.send(JSON.stringify({
        "customer_orderid": userOrderId.trim(),
    }));
}


console.log('file working');
document.getElementById("send_client_message").addEventListener("submit", function(event){
    event.preventDefault();

    get_client_msg();
})
function get_client_msg(){

  
    var chatboxform = document.querySelector(".chatboxform");
    if(document.querySelector(".validation_err_msg")){
        document.querySelector(".validation_err_msg").remove();
    }

    if(document.querySelector("#assistant_incoming_loader")){
        document.querySelector("#assistant_incoming_loader").remove();
    }
    const inputElement = document.querySelector('.chat_msg_input');
    const response_data = document.querySelector('.response_data');
    const chat_msg_input = inputElement.value;
   
    var messageDateTime = new Date().toISOString();

    // console.log("chat_msg_input: ",chat_msg_input );
    if(chat_msg_input != ""){
        response_data.innerHTML += `
            <div class="client_msg" sender="user" messageDateTime="${messageDateTime}"><div class='chatbot_msg'>${chat_msg_input}</div></div>
        `;
    }else{
        return false;
    }

    
    response_data.innerHTML += `
        <div class="assistant_msg" id="assistant_incoming_loader" sender="assistant" messageDateTime="${messageDateTime}"><div class='chatbot_msg'>
            <div class="col-3">
                <div class="snippet" data-title="dot-typing">
                    <div class="stage">
                        <div class="dot-typing">loading</div>
                    </div>
                </div>
            </div>
        </div></div>
    `;

    chatboxform.scrollTop = chatboxform.scrollHeight;

    var chatbotColor = document.querySelector('.chatbox .chatpopupbox').getAttribute("chatbot-color");

   
   
        // Function to calculate percentage of words that match between two strings
    function wordMatchPercentage(s1, s2) {
        const words1 = s1.split(" ");
        const words2 = s2.split(" ");
        
        let matchCount = 0;
        words1.forEach(function(word1) {
            if (words2.includes(word1)) {
                matchCount++;
            }
        });
        
        return matchCount / words1.length;
    }
    let stopExecution = false;

    // Function to find similar sentences
    function findSimilarSentences(sentencesToCheck, chat_msg_input, similarityThreshold) {
        for (let i = 0; i < sentencesToCheck.length; i++) {
            if (wordMatchPercentage(sentencesToCheck[i].toLowerCase(), chat_msg_input.toLowerCase()) >= similarityThreshold) {
                setTimeout(() => {
                    if (document.querySelector("#assistant_incoming_loader")) {
                        document.querySelector("#assistant_incoming_loader").remove();
                    }
                    response_data.innerHTML += `
                        <div class="assistant_msg" sender="assistant">
                            <div class='chatbot_msg'>Please enter your Order ID to retrieve tracking details - </div>
                        </div>
                        <div class="disabletracking">
                            <div class='generate_ticket_form'>
                                <input type='text' class='ticket_email_field' placeholder='Enter your order Id...'>
                                <button style='background: ${chatbotColor}' class='generate_ticket_btn' onClick="getTrackingNumber(this)">Submit</button></button>
                            </div>
                        </div>`;
                }, 1000);
                stopExecution = true;
                break; // Exit the loop after finding a match
            }
        }
    }

    // Example usage
    var sentencesToCheck = [
        "I need Track No ",
        "I need tarck code of my order",
        "Tracking No",
        "Tracking",
        "Tracking Details",
        "Track",
        "Tracking Number",
        "Tarcking Code",
        "My Tracking No",
        "My Track No",
        "What is the tracking number for my recent order?",
        "Could you please provide the tracking code for the shipment?",
        "Where can I find the tracking number for my package?",
        "Can you assist me in locating the tracking information for my order?",
        "How can I track the delivery status of my order?",
        "What is the tracking ID for my shipment?",
        "Could you help me locate the tracking information for my recent purchase?",
        "Is there a way to check the progress of my order using a tracking number?",
        "Can you provide me with the tracking details for my parcel?",
        "When can I expect to receive my tracking number?",
        "Are tracking numbers provided automatically for all orders?",
    ];
    // var chat_msg_input = "This is a sentence to check similarity";
    var similarityThreshold = 0.75; // 75% match threshold

    findSimilarSentences(sentencesToCheck, chat_msg_input, similarityThreshold);
    if(!stopExecution){
    let xhr = new XMLHttpRequest();
 
    // Making our connection  
    let url = `${API_URL}/send-message?store_id=${Shopify.shop}`;
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
 
   
        // function execute after request is successful 
        xhr.onreadystatechange = function () {
            console.log(`Full Response: ${this}`)
            if (this.readyState == 4 && this.status == 200) {
                // console.log(`Getting response: ${this.responseText}`);
                var apiResponse = JSON.parse(this.responseText).message.content;

                if(document.querySelector("#assistant_incoming_loader")){
                    document.querySelector("#assistant_incoming_loader").remove();
                }

                if(apiResponse !== undefined){
                    if(apiResponse == "**I Don't Know**" || apiResponse == "I Don't Know" || apiResponse == "I Don't Know." || apiResponse == "I don't know" || apiResponse == "I don't know." || apiResponse == "I don't Know." || apiResponse == "I don't Know" || apiResponse == "**I don't know**"){
                        messageDateTime = new Date().toISOString();
                        response_data.innerHTML += `
                            <div class="assistant_msg" sender="assistant" messageDateTime="${messageDateTime}">
                                <div class='chatbot_msg'>As an AI assistant. I can only provide information related to this store only. If you are not getting your answer then please generate a ticket to contact support.
                                </div>
                            </div>
                            <div class='generate_ticket_form'>
                                <input type='text' class='ticket_email_field' placeholder='Enter your email...'>
                                <button style='background: ${chatbotColor}' class='generate_ticket_btn' onClick="generateTicket(this)">Generate Ticket</button>
                            </button>
                        `;
                    }else if (apiResponse == "enter number" || apiResponse == "**enter number**" || apiResponse == "enter number."){
                        response_data.innerHTML += `
                        <div class="assistant_msg" sender="assistant">
                            <div class='chatbot_msg'>Please enter your Order ID to retrieve tracking details - </div>
                        </div>
                        <div class="disabletracking">
                            <div class='generate_ticket_form'>
                                <input type='text' class='ticket_email_field' placeholder='Enter your order Id...'>
                                <button style='background: ${chatbotColor}' class='generate_ticket_btn' onClick="getTrackingNumber(this)">Submit</button></button>
                            </div>
                        </div>`;
                    
                    }else{
                        messageDateTime = new Date().toISOString();
                        response_data.innerHTML += `
                            <div class="assistant_msg" sender="assistant" messageDateTime="${messageDateTime}"><div class='chatbot_msg'>${apiResponse.replace(/\n/g, "<br />")}</div></div>
                        `;
                    }
                }

                chatboxform.scrollTop = chatboxform.scrollHeight;
            }
        }
        // Sending our request 
        xhr.send(JSON.stringify({ "message": chat_msg_input }));
    }

    inputElement.value = "";
}