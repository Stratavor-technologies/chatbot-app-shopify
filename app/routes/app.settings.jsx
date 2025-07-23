import{   
    Page, 
    Card, 
    BlockStack, 
    Text,
    RadioButton,
    LegacyStack,
    TextField,
    Button
} from '@shopify/polaris';
import { useState, useEffect , useCallback} from 'react';
import axios from 'axios';
import { useAppBridge } from '@shopify/app-bridge-react';
import variables from './variables';
import ChatBotLoader from '../components/loader';
import ToastMessage from '../components/toastMessage';

const settings = () => {
    const [mailerName, setMailerName] = useState("");
    const [mailerUser, setMailerUser] = useState("");
    const [mailerPass, setMailerPass] = useState("");
    const [mailerNameError, setMailerNameError] = useState("");
    const [mailerUserError, setMailerUserError] = useState("");
    const [mailerPassError, setMailerPassError] = useState("");
    const [dataSaved, setDataSaved] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const appBridge = useAppBridge();
    const toggleActiveMessage = useCallback(() => setDataSaved((dataSaved) => !dataSaved), []);

    const updateMailerSettings = () => {
        setIsLoading(true);
        var body = {
            mailer_name: mailerName,
            mailer_auth: {
                user: mailerUser,
                pass: mailerPass
            }
        }

        axios.put(`${variables.API_URL}/stores/update/mailer`, body, {
            params:  {
                store_id: appBridge.config.shop
            }
        }).then(response => {
            setDataSaved(true);
            if(response.data.success === false){
                setMailerUserError(`Invalid User!`);
                setMailerPassError(`Invalid Password!`);
                setSuccessMessage(response.data.message);

                return false;
            }

            if(response.data.success === true){
                setSuccessMessage(response.data.message);
            }

            setIsLoading(false);

            console.log(response);
        }).catch(err => {
            console.log(err);
        });
    }

    const getStoreData = () => {
        setIsLoading(true);
        axios.get(`${variables.API_URL}/stores/get`, {
            params: {
                store_id: appBridge.config.shop
            }
        }).then(response => {
            // console.log("response.data.success: ", response.data.success)
            if(response.data.success === true){
                setMailerName(response?.data?.data?.mailer_name);
                setMailerUser(response?.data?.data?.mailer_auth?.user);
                setMailerPass(response?.data?.data?.mailer_auth?.pass);
            }else{
                setDataSaved(true);
                setSuccessMessage(response.data.message);
            }

            setIsLoading(false);
        }).catch(err => {
            setDataSaved(true);
            setSuccessMessage(err);
        });
    }

    useEffect(() => {
        getStoreData();
    }, []);

    return(
        <>
            <Page>
            {
                isLoading ? <ChatBotLoader /> : ""
            }
                <Card>
                    <Text variant="headingMd" as="h2">Settings</Text>
                    <LegacyStack vertical>
                        <form>
                            <TextField
                                label="Mailer name"
                                value={mailerName}
                                onChange={ () => setMailerName(event.target.value)}
                                name='mailer_name'
                                autoComplete="off"
                                error={mailerNameError}
                            />
                            
                            <TextField
                                label="User"
                                value={mailerUser}
                                onChange={ () => setMailerUser(event.target.value)}
                                name='mailer_user'
                                autoComplete="off"
                                error={mailerUserError}
                            />

                            <TextField
                                label="Password"
                                value={mailerPass}
                                onChange={ () => setMailerPass(event.target.value)}
                                name='mailer_pass'
                                autoComplete="off"
                                error={mailerPassError}
                            />

                            <br />

                            <Button onClick={updateMailerSettings}>Save</Button>
                        </form>
                    </LegacyStack>
                </Card>

                {
                    dataSaved ? <ToastMessage message={successMessage} toggle={toggleActiveMessage} /> : ""
                }
            </Page>
        </>
    );
}

export default settings;