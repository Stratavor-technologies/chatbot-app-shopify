import { useEffect, useState, useCallback } from "react";
import axios from 'axios';
import { json } from "@remix-run/node";
import { useActionData, useNavigation, useSubmit, Link , useLoaderData} from "@remix-run/react";
import {Page, LegacyCard, DataTable, Button, Card, Text, BlockStack, ButtonGroup} from '@shopify/polaris';
import variables from "./variables";
import { authenticate } from "../shopify.server";
import { useAppBridge } from '@shopify/app-bridge-react';
import ChatBotLoader from '../components/loader';
import ToastMessage from '../components/toastMessage';
import '../css/style.css';

export const loader = async ({ request }) => {

  var { admin } = await authenticate.admin(request);
  const response = await admin.graphql(
    `#graphql
    query {
      orders(first: 10) {
        edges {
          node {
            id
            name
            fulfillments {
              trackingInfo {
                number
              }
            }
          }
        }
      }
    }`,
  );


  const data = await response.json();
  const orderData =data.data.orders;


  const getStoreDetails = await admin.graphql(
    `#graphql
    query shopInfo {
      shop {
        name
        url
        myshopifyDomain
        plan {
          displayName
          partnerDevelopment
          shopifyPlus
        }
      }
    }`,
  );
  const storeId = await getStoreDetails.json();
  const store_id = storeId.data.shop.myshopifyDomain
  addOrderdetails(orderData);

  async function addOrderdetails(orderData) {
    await axios.post(`${variables.API_URL}/orders/add/details`, orderData, { params: { store_id: store_id}})
    .then(response => {
      if(response.data.success === true){
        console.log("Add Orders Successfully ")
      }
    })
    .catch(err => {
        console.error(err);
    });
   }
  return null;
  

};

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const color = ["Red", "Orange", "Yellow", "Green"][
    Math.floor(Math.random() * 4)
  ];
  const response = await admin.graphql(
    `#graphql
      mutation populateProduct($input: ProductInput!) {
        productCreate(input: $input) {
          product {
            id
            title
            handle
            status
            variants(first: 10) {
              edges {
                node {
                  id
                  price
                  barcode
                  createdAt
                }
              }
            }
          }
        }
      }`,
    {
      variables: {
        input: {
          title: `${color} Snowboard`,
        },
      },
    },
  );
  const responseJson = await response.json();

  return json({
    product: responseJson.data?.productCreate?.product,
  });
};

export default function Index() {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFileUploaded, setIsFileUploaded] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [ storeIntegrationType, setStoreIntegrationType ] = useState("");
  const appBridge = useAppBridge();

  const toggleActiveMessage = useCallback(() => setIsFileUploaded((isFileUploaded) => !isFileUploaded), []);

  const deleteTicket = async (ticket_id) => {
    setIsLoading(true);

    axios.post(`${variables.API_URL}/ticket/delete`, {ticket_id: ticket_id}, {params: {store_id: appBridge.config.shop}})
    .then(response => {
      getTickets();
      toggleActiveMessage();
      setIsLoading(false);
      setSuccessMessage(response.data.message);

    }).catch(err => {
      console.log(err);
    })
  }

  const getStoreData = async () => {
    await axios.get(`${variables.API_URL}/stores/get`, {
        params: {
            store_id: appBridge.config.shop
        }
    }).then(response => {
        if(response.data.success === true){
          setStoreIntegrationType(response.data.data.integration_type);
        }
    }).catch(err => {
        console.log(err);
    })
  }

  const getTickets = async () => {

    axios.get(`${variables.API_URL}/tickets`, {
      params: {
        store_id: appBridge.config.shop
      }
    })
    .then(response => {
      var ticketsData = [];
      response.data.data.map(item =>{
        let ticketDate = new Date(item.createdAt);
        ticketDate = `${ticketDate.getDate()}-${ticketDate.getMonth()}-${ticketDate.getFullYear()} ${ticketDate.getHours()}:${ticketDate.getMinutes()}:${ticketDate.getSeconds()}`;
        
        ticketsData.push([item.subject, item.customer_email, (item.status == 0 ? "Closed" : "Active"), ticketDate , 
              <>
                <ButtonGroup>
                  <Button variant="primary" tone="critical" onClick={ () => deleteTicket(item._id)}>Delete</Button>
                  {
                    // storeIntegrationType == "admin" ? <div className="viewTicketBtn"><Button><Link to={`/app/view_ticket/${item._id}`}>view</Link></Button></div> : "" 
                  }

                  <div className="viewTicketBtn"><Button><Link to={`/app/view_ticket/${item._id}`}>view</Link></Button></div>
                  
                </ButtonGroup>
              </>
            ]);
      });

      setTickets(ticketsData);
      setIsLoading(false);
    })
    .catch(error => {
      console.error('Error fetching data:', error);
    });
  }

  useEffect(() => {
    getStoreData();
  }, []);

  useEffect(() => {
    getTickets();
  }, [storeIntegrationType]);

  return (
    <Page>
        {
          isLoading ? <ChatBotLoader /> : ""
        }
        <BlockStack gap="200">
          <Card>
            <Text variants="headingMd" as="h1">Tickets</Text>
          </Card>
          <LegacyCard>
            <DataTable
              columnContentTypes={[
                'text',
                'text',
                'text',
                'text',
                'text',
              ]}
              headings={[
                'Subject',
                'Customer Email',
                'Status',
                'Created at',
                'Actions',
              ]}
              rows={tickets}
            />
          </LegacyCard>
        </BlockStack>

      {
        isFileUploaded ? <ToastMessage message={successMessage} toggle={toggleActiveMessage}/> : ""
      }
    </Page>
  );
}
