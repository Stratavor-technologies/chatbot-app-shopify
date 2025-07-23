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

import{
    useCallback,
    useState,
    useEffect
} from 'react';

import axios from 'axios';
import variables from './variables';
import { useAppBridge } from '@shopify/app-bridge-react';
import ChatBotLoader from '../components/loader';
import ToastMessage from '../components/toastMessage';
import '../css/style.css';

export default function Integration(){
    const [ integrationType, setIntegrationType ] = useState("");
    const [ gorgiasEmail, setGorgiasEmail] = useState("");
    const [ gorgiasKey, setGorgiasKey] = useState("");
    const [ gorgiasBaseApiUrl, setGorgiasBaseApiUrl] = useState("");
    const [ integration, setIntegration ] = useState("");
    const [ emailError, setEmailError ] = useState("");
    const [ apiKeyError, setApiKeyError ] = useState("");
    const [ gorgiasApiUrlError, setGorgiasApiUrlError ] = useState("");
    const [ isLoading, setIsLoading ] = useState(false);
    const [ successMessage, setSuccessMessage ] = useState("");
    const [ dataSaved, setDataSaved ] = useState(false);

    const appBridge = useAppBridge();

    const toggleActiveMessage = useCallback(() => setDataSaved((dataSaved) => !dataSaved), []);
    
    const updateIntegrationKeys = async () => {
        var intValue = {}
        setEmailError("");
        setApiKeyError("");

        if(integrationType == "gorgias"){
            if(!gorgiasEmail){
                setEmailError("Username (your email address) is required");
            }

            if(!gorgiasKey){
                setApiKeyError("Password (API Key) is required");
            }

            if(!gorgiasBaseApiUrl){
                setGorgiasApiUrlError('Base API URL is required');
            }

            if(!gorgiasEmail || !gorgiasKey || !gorgiasBaseApiUrl){
                return false;
            }

            intValue = {
                apiUrl: gorgiasBaseApiUrl,
                email: gorgiasEmail,
                apiKey: gorgiasKey
            }
        }

        if(integrationType == 'admin'){
            setIntegration({type: integrationType});
        }

        
        setIntegration({type: integrationType, value: intValue});
    }

    const updateStore = async () => {
        if(integration){
            setIsLoading(true);

            var bodyData = {
                integration: integration,
                integration_type: integrationType
            }

            await axios.put(`${variables.API_URL}/stores/update`, bodyData, {
                params: {
                    store_id: appBridge.config.shop
                }
            }).then(response => {
                // console.log(response.data);
                if(response.data.success === true){
                    setTimeout(() => {
                        setSuccessMessage(`Data Updated!`);
                        setDataSaved(true);
                        setIsLoading(false);
                    }, 500);

                }else{
                    setTimeout(() => {
                        setGorgiasApiUrlError(`Invalid Base Url!`);
                        setEmailError(`Invalid Email!`);
                        setApiKeyError(`Invalid Key!`);
                        // setDataSaved(true);
                        setIsLoading(false);
                    }, 500);
                }
            }).catch(err => {
                console.log(err);
            });
        }
    }

    const getStoreData = () => {
        setIsLoading(true);
        axios.get(`${variables.API_URL}/stores/get`, {
            params: {
                store_id: appBridge.config.shop
            }
        }).then(response => {
            if(response.data.success === true){
                setIntegrationType(response.data.data.integration_type);
                setGorgiasBaseApiUrl(response.data.data.integration?.value?.apiUrl);
                setGorgiasEmail(response.data.data.integration?.value?.email);
                setGorgiasKey(response.data.data.integration?.value?.apiKey);

                setTimeout(() => {
                    setIsLoading(false);
                }, 500);
            }
        }).catch(err => {
            console.log(err);
        })
    }

    useEffect(() => {
        updateStore();
    }, [integration]);

    useEffect(() => {
        getStoreData();
    }, []);

    return (
        <>
            <Page>
                {
                    isLoading ? <ChatBotLoader /> : ""
                }
                <BlockStack gap="200">
                    <Card>
                        <Text variant="headingMd" as="h2">Integration</Text>
                    </Card>

                    <Card>
                    <LegacyStack vertical>
                        <form>
                            <RadioButton
                                label="Gorgias"
                                helpText="Get tickets and replies on Gorgias"
                                checked={integrationType == "gorgias" ? true : false}
                                name="gorgias_integration"
                                value="gorgias"
                                onChange={() => setIntegrationType(event.target.value)}
                            />

                            <div className='gorgias_integration_api_keys' style={{display: integrationType == "gorgias" ? "block" : "none"}}>
                                    <TextField
                                        label="Base API URL"
                                        value={gorgiasBaseApiUrl}
                                        onChange={ () => setGorgiasBaseApiUrl(event.target.value)}
                                        name='gorgias_api_url'
                                        autoComplete="off"
                                        error={gorgiasApiUrlError}
                                    />
                                    
                                    <TextField
                                        label="Username (your email address)"
                                        value={gorgiasEmail}
                                        onChange={ () => setGorgiasEmail(event.target.value)}
                                        name='gorgias_email'
                                        autoComplete="off"
                                        error={emailError}
                                    />

                                    <TextField
                                        label="Password (API Key)"
                                        value={gorgiasKey}
                                        onChange={ () => setGorgiasKey(event.target.value)}
                                        name='gorgias_key'
                                        autoComplete="off"
                                        error={apiKeyError}
                                    />
                            </div>

                            <RadioButton
                                label="Instagram"
                                helpText="Get replies on Instagram"
                                checked={integrationType == "instagram" ? true : false}
                                name="insta_integration"
                                value='instagram'
                                onChange={(e) => setIntegrationType(event.target.value)}
                            />
                            <RadioButton
                                label="Facebook"
                                helpText="Get replies on Facebook"
                                checked={integrationType == "facebook" ? true : false}
                                name="facebook_integration"
                                value='facebook'
                                onChange={ (e) => setIntegrationType(event.target.value)}
                            />

                            <RadioButton
                                label="Shopify Admin"
                                helpText="Get replies on Sopify admin"
                                checked={integrationType == "admin" ? true : false}
                                name="admin"
                                value='admin'
                                onChange={ (e) => setIntegrationType(event.target.value)}
                            />

                            <Button onClick={updateIntegrationKeys}>Save</Button>
                        </form>
                    </LegacyStack>
                    </Card>
                </BlockStack>

                {
                    dataSaved ? <ToastMessage message={successMessage} toggle={toggleActiveMessage}/> : ""
                }

            </Page>
        </>
    )
}