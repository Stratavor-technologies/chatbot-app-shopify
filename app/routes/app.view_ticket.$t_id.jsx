import { useParams, Link } from '@remix-run/react';
import { Page, Card, BlockStack} from '@shopify/polaris';
import '../css/style.css';
import { useEffect, useState, useCallback} from 'react';
import axios from 'axios';
import variables from './variables';
import { useAppBridge } from '@shopify/app-bridge-react';
import { ArrowLeftIcon } from '@shopify/polaris-icons';
import ChatBotLoader from '../components/loader';
import ToastMessage from '../components/toastMessage';


export default function view_ticket(){
    const [supportReply, setSupportReply] = useState("");
    const params = useParams();
    const ticketId = params.t_id;
    const appBridge = useAppBridge();
    const [ chatsList, setChatsList ] = useState([]); 
    const [currentTicket, setCurrentTicket] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [messageSent, setMessageSent] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    const toggleActiveMessage = useCallback(() => setMessageSent((messageSent) => !messageSent), []);

    const getTicketChats = async () => {
        setIsLoading(true);
        axios.get(`${variables.API_URL}/chats`, {
            params: {
                store_id: appBridge.config.shop,
                ticket_id: ticketId
            }
        }
        ).then(response => {
            // console.log("Getting chats: ", response);
            setChatsList(response.data.data);
            setIsLoading(false);
        }).catch(err => {
            console.log("Error: ", err);
        })
    }

    const getTicket = async () => {
        setIsLoading(true);
        axios.get(`${variables.API_URL}/ticket/get`, {
            params: {
                store_id: appBridge.config.shop,
                ticket_id: ticketId
            }
        }
        ).then(response => {
            // console.log("Getting ticket: ", response.data.data);
            if(response.data.status === true){
                setCurrentTicket(response.data.data[0]);
            }

            setIsLoading(false);
            
        }).catch(err => {
            console.log("Error: ", err);
        })
    }

    const sendTicketReply = (e) => {
        e.preventDefault();
        setIsLoading(true);
        var supportMsg = supportReply;
        var bodyData = {
            sender: "assistant",
            message: supportMsg,
            ticket_id: ticketId,
            chat_index: (chatsList.length + 1),
            messageDateTime: new Date().toISOString()
        }

        axios.post(`${variables.API_URL}/chats/new`, bodyData , {
            params: {
                store_id: appBridge.config.shop
            }
        }).then(response => {
            if(response.data.success === true){
                getTicketChats();
                setIsLoading(false);
                setMessageSent(true);
                setSuccessMessage(response.data.message);
            }else{
                getTicketChats();
                setMessageSent(true);
                setSuccessMessage(response.data.message);
            }

            setSupportReply("");
        }).catch(err => {
            console.log(`this is error: ${err}`);
        });

    }

    useEffect(() => {
        getTicketChats();
        getTicket();

    }, []);

    return(
        <>
            <Page>
                {isLoading ? <ChatBotLoader /> : ""}
                <BlockStack gap="200">
                    <Card>
                        <div className='back_to_tickets'><Link to={"/app"}><ArrowLeftIcon /> Back to tickets</Link></div>
                    </Card>
                    <Card>
                        <section className="msger">
                            <header className="msger-header">
                                <div className="msger-header-title">
                                    {currentTicket.subject}
                                </div>
                                <div className="msger-header-options">
                                <span><i className="fas fa-cog"></i></span>
                                </div>
                            </header>

                            <main className="msger-chat">
                                {
                                    chatsList.map((singleChat) => (
                                        <div className={singleChat.sender == "user" ? ("msg left-msg") : ("msg right-msg")}>

                                            <div className="msg-bubble">
                                                <div className="msg-info">
                                                <div className="msg-info-name">{singleChat.sender}</div>
                                                </div>

                                                <div className="msg-text">
                                                {singleChat.message}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                }
                                
                            </main>

                            <form className="msger-inputarea" onSubmit={sendTicketReply}>
                                <input type="text" className="msger-input" value={supportReply} placeholder="Enter your message..." onChange={(event) => setSupportReply(event.target.value)}/>
                                <button type="submit" className="msger-send-btn">Send</button>
                            </form>
                        </section>
                    </Card>
                </BlockStack>

                {
                    messageSent ? <ToastMessage message={successMessage} toggle={toggleActiveMessage} /> : ""
                }
            </Page>
        </>
    )
}