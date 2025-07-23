var _a;
import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { PassThrough } from "stream";
import { renderToPipeableStream } from "react-dom/server";
import { RemixServer, Meta, Links, Outlet, ScrollRestoration, Scripts, useParams, Link, useLoaderData, useActionData, Form, useRouteError } from "@remix-run/react";
import { createReadableStreamFromReadable, json, redirect } from "@remix-run/node";
import { isbot } from "isbot";
import "@shopify/shopify-app-remix/adapters/node";
import { shopifyApp, LATEST_API_VERSION, AppDistribution, DeliveryMethod, LoginErrorType, boundary } from "@shopify/shopify-app-remix/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import { restResources } from "@shopify/shopify-api/rest/admin/2024-01";
import { PrismaClient } from "@prisma/client";
import { Frame, Loading, Toast, Page, BlockStack, Card, Text, LegacyStack, RadioButton, TextField, Button, DropZone, Thumbnail, LegacyCard, DataTable, ButtonGroup, AppProvider, FormLayout } from "@shopify/polaris";
import { useState, useCallback, useEffect } from "react";
import axios from "axios";
import { useAppBridge } from "@shopify/app-bridge-react";
import { ArrowLeftIcon, NoteIcon } from "@shopify/polaris-icons";
import { AppProvider as AppProvider$1 } from "@shopify/shopify-app-remix/react";
const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
}
const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  apiVersion: LATEST_API_VERSION,
  scopes: (_a = process.env.SCOPES) == null ? void 0 : _a.split(","),
  appUrl: process.env.SHOPIFY_APP_URL || "",
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore,
  restResources,
  webhooks: {
    APP_UNINSTALLED: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks"
    }
  },
  hooks: {
    afterAuth: async ({ session }) => {
      shopify.registerWebhooks({ session });
    }
  },
  future: {
    v3_webhookAdminContext: true,
    v3_authenticatePublic: true,
    unstable_newEmbeddedAuthStrategy: true
  },
  ...process.env.SHOP_CUSTOM_DOMAIN ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] } : {}
});
const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
const authenticate = shopify.authenticate;
shopify.unauthenticated;
const login = shopify.login;
shopify.registerWebhooks;
shopify.sessionStorage;
const ABORT_DELAY = 5e3;
async function handleRequest(request, responseStatusCode, responseHeaders, remixContext) {
  addDocumentResponseHeaders(request, responseHeaders);
  const userAgent = request.headers.get("user-agent");
  const callbackName = isbot(userAgent ?? "") ? "onAllReady" : "onShellReady";
  return new Promise((resolve, reject) => {
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(
        RemixServer,
        {
          context: remixContext,
          url: request.url,
          abortDelay: ABORT_DELAY
        }
      ),
      {
        [callbackName]: () => {
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          console.error(error);
        }
      }
    );
    setTimeout(abort, ABORT_DELAY);
  });
}
const entryServer = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: handleRequest
}, Symbol.toStringTag, { value: "Module" }));
function App$2() {
  return /* @__PURE__ */ jsxs("html", { children: [
    /* @__PURE__ */ jsxs("head", { children: [
      /* @__PURE__ */ jsx("meta", { charSet: "utf-8" }),
      /* @__PURE__ */ jsx("meta", { name: "viewport", content: "width=device-width,initial-scale=1" }),
      /* @__PURE__ */ jsx("link", { rel: "preconnect", href: "https://cdn.shopify.com/" }),
      /* @__PURE__ */ jsx(
        "link",
        {
          rel: "stylesheet",
          href: "https://cdn.shopify.com/static/fonts/inter/v4/styles.css"
        }
      ),
      /* @__PURE__ */ jsx(Meta, {}),
      /* @__PURE__ */ jsx(Links, {})
    ] }),
    /* @__PURE__ */ jsxs("body", { children: [
      /* @__PURE__ */ jsx(Outlet, {}),
      /* @__PURE__ */ jsx(ScrollRestoration, {}),
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
const route0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: App$2
}, Symbol.toStringTag, { value: "Module" }));
const variables = {
  API_URL: "https://techbinges.com"
};
const route7 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: variables
}, Symbol.toStringTag, { value: "Module" }));
function ChatBotLoader() {
  return /* @__PURE__ */ jsx("div", { style: { height: "100px" }, children: /* @__PURE__ */ jsx(Frame, { children: /* @__PURE__ */ jsx(Loading, {}) }) });
}
function ToastMessage(props) {
  return /* @__PURE__ */ jsx(Frame, { children: /* @__PURE__ */ jsx(Toast, { content: props.message, onDismiss: props.toggle }) });
}
function view_ticket() {
  const [supportReply, setSupportReply] = useState("");
  const params = useParams();
  const ticketId = params.t_id;
  const appBridge = useAppBridge();
  const [chatsList, setChatsList] = useState([]);
  const [currentTicket, setCurrentTicket] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [messageSent, setMessageSent] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const toggleActiveMessage = useCallback(() => setMessageSent((messageSent2) => !messageSent2), []);
  const getTicketChats = async () => {
    setIsLoading(true);
    axios.get(
      `${variables.API_URL}/chats`,
      {
        params: {
          store_id: appBridge.config.shop,
          ticket_id: ticketId
        }
      }
    ).then((response) => {
      setChatsList(response.data.data);
      setIsLoading(false);
    }).catch((err) => {
      console.log("Error: ", err);
    });
  };
  const getTicket = async () => {
    setIsLoading(true);
    axios.get(
      `${variables.API_URL}/ticket/get`,
      {
        params: {
          store_id: appBridge.config.shop,
          ticket_id: ticketId
        }
      }
    ).then((response) => {
      if (response.data.status === true) {
        setCurrentTicket(response.data.data[0]);
      }
      setIsLoading(false);
    }).catch((err) => {
      console.log("Error: ", err);
    });
  };
  const sendTicketReply = (e) => {
    e.preventDefault();
    setIsLoading(true);
    var supportMsg = supportReply;
    var bodyData = {
      sender: "assistant",
      message: supportMsg,
      ticket_id: ticketId,
      chat_index: chatsList.length + 1,
      messageDateTime: (/* @__PURE__ */ new Date()).toISOString()
    };
    axios.post(`${variables.API_URL}/chats/new`, bodyData, {
      params: {
        store_id: appBridge.config.shop
      }
    }).then((response) => {
      if (response.data.success === true) {
        getTicketChats();
        setIsLoading(false);
        setMessageSent(true);
        setSuccessMessage(response.data.message);
      } else {
        getTicketChats();
        setMessageSent(true);
        setSuccessMessage(response.data.message);
      }
      setSupportReply("");
    }).catch((err) => {
      console.log(`this is error: ${err}`);
    });
  };
  useEffect(() => {
    getTicketChats();
    getTicket();
  }, []);
  return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsxs(Page, { children: [
    isLoading ? /* @__PURE__ */ jsx(ChatBotLoader, {}) : "",
    /* @__PURE__ */ jsxs(BlockStack, { gap: "200", children: [
      /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx("div", { className: "back_to_tickets", children: /* @__PURE__ */ jsxs(Link, { to: "/app", children: [
        /* @__PURE__ */ jsx(ArrowLeftIcon, {}),
        " Back to tickets"
      ] }) }) }),
      /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs("section", { className: "msger", children: [
        /* @__PURE__ */ jsxs("header", { className: "msger-header", children: [
          /* @__PURE__ */ jsx("div", { className: "msger-header-title", children: currentTicket.subject }),
          /* @__PURE__ */ jsx("div", { className: "msger-header-options", children: /* @__PURE__ */ jsx("span", { children: /* @__PURE__ */ jsx("i", { className: "fas fa-cog" }) }) })
        ] }),
        /* @__PURE__ */ jsx("main", { className: "msger-chat", children: chatsList.map((singleChat) => /* @__PURE__ */ jsx("div", { className: singleChat.sender == "user" ? "msg left-msg" : "msg right-msg", children: /* @__PURE__ */ jsxs("div", { className: "msg-bubble", children: [
          /* @__PURE__ */ jsx("div", { className: "msg-info", children: /* @__PURE__ */ jsx("div", { className: "msg-info-name", children: singleChat.sender }) }),
          /* @__PURE__ */ jsx("div", { className: "msg-text", children: singleChat.message })
        ] }) })) }),
        /* @__PURE__ */ jsxs("form", { className: "msger-inputarea", onSubmit: sendTicketReply, children: [
          /* @__PURE__ */ jsx("input", { type: "text", className: "msger-input", value: supportReply, placeholder: "Enter your message...", onChange: (event2) => setSupportReply(event2.target.value) }),
          /* @__PURE__ */ jsx("button", { type: "submit", className: "msger-send-btn", children: "Send" })
        ] })
      ] }) })
    ] }),
    messageSent ? /* @__PURE__ */ jsx(ToastMessage, { message: successMessage, toggle: toggleActiveMessage }) : ""
  ] }) });
}
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: view_ticket
}, Symbol.toStringTag, { value: "Module" }));
function Integration() {
  const [integrationType, setIntegrationType] = useState("");
  const [gorgiasEmail, setGorgiasEmail] = useState("");
  const [gorgiasKey, setGorgiasKey] = useState("");
  const [gorgiasBaseApiUrl, setGorgiasBaseApiUrl] = useState("");
  const [integration, setIntegration] = useState("");
  const [emailError, setEmailError] = useState("");
  const [apiKeyError, setApiKeyError] = useState("");
  const [gorgiasApiUrlError, setGorgiasApiUrlError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [dataSaved, setDataSaved] = useState(false);
  const appBridge = useAppBridge();
  const toggleActiveMessage = useCallback(() => setDataSaved((dataSaved2) => !dataSaved2), []);
  const updateIntegrationKeys = async () => {
    var intValue = {};
    setEmailError("");
    setApiKeyError("");
    if (integrationType == "gorgias") {
      if (!gorgiasEmail) {
        setEmailError("Username (your email address) is required");
      }
      if (!gorgiasKey) {
        setApiKeyError("Password (API Key) is required");
      }
      if (!gorgiasBaseApiUrl) {
        setGorgiasApiUrlError("Base API URL is required");
      }
      if (!gorgiasEmail || !gorgiasKey || !gorgiasBaseApiUrl) {
        return false;
      }
      intValue = {
        apiUrl: gorgiasBaseApiUrl,
        email: gorgiasEmail,
        apiKey: gorgiasKey
      };
    }
    if (integrationType == "admin") {
      setIntegration({ type: integrationType });
    }
    setIntegration({ type: integrationType, value: intValue });
  };
  const updateStore = async () => {
    if (integration) {
      setIsLoading(true);
      var bodyData = {
        integration,
        integration_type: integrationType
      };
      await axios.put(`${variables.API_URL}/stores/update`, bodyData, {
        params: {
          store_id: appBridge.config.shop
        }
      }).then((response) => {
        if (response.data.success === true) {
          setTimeout(() => {
            setSuccessMessage(`Data Updated!`);
            setDataSaved(true);
            setIsLoading(false);
          }, 500);
        } else {
          setTimeout(() => {
            setGorgiasApiUrlError(`Invalid Base Url!`);
            setEmailError(`Invalid Email!`);
            setApiKeyError(`Invalid Key!`);
            setIsLoading(false);
          }, 500);
        }
      }).catch((err) => {
        console.log(err);
      });
    }
  };
  const getStoreData = () => {
    setIsLoading(true);
    axios.get(`${variables.API_URL}/stores/get`, {
      params: {
        store_id: appBridge.config.shop
      }
    }).then((response) => {
      var _a2, _b, _c, _d, _e, _f;
      if (response.data.success === true) {
        setIntegrationType(response.data.data.integration_type);
        setGorgiasBaseApiUrl((_b = (_a2 = response.data.data.integration) == null ? void 0 : _a2.value) == null ? void 0 : _b.apiUrl);
        setGorgiasEmail((_d = (_c = response.data.data.integration) == null ? void 0 : _c.value) == null ? void 0 : _d.email);
        setGorgiasKey((_f = (_e = response.data.data.integration) == null ? void 0 : _e.value) == null ? void 0 : _f.apiKey);
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      }
    }).catch((err) => {
      console.log(err);
    });
  };
  useEffect(() => {
    updateStore();
  }, [integration]);
  useEffect(() => {
    getStoreData();
  }, []);
  return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsxs(Page, { children: [
    isLoading ? /* @__PURE__ */ jsx(ChatBotLoader, {}) : "",
    /* @__PURE__ */ jsxs(BlockStack, { gap: "200", children: [
      /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(Text, { variant: "headingMd", as: "h2", children: "Integration" }) }),
      /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(LegacyStack, { vertical: true, children: /* @__PURE__ */ jsxs("form", { children: [
        /* @__PURE__ */ jsx(
          RadioButton,
          {
            label: "Gorgias",
            helpText: "Get tickets and replies on Gorgias",
            checked: integrationType == "gorgias" ? true : false,
            name: "gorgias_integration",
            value: "gorgias",
            onChange: () => setIntegrationType(event.target.value)
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "gorgias_integration_api_keys", style: { display: integrationType == "gorgias" ? "block" : "none" }, children: [
          /* @__PURE__ */ jsx(
            TextField,
            {
              label: "Base API URL",
              value: gorgiasBaseApiUrl,
              onChange: () => setGorgiasBaseApiUrl(event.target.value),
              name: "gorgias_api_url",
              autoComplete: "off",
              error: gorgiasApiUrlError
            }
          ),
          /* @__PURE__ */ jsx(
            TextField,
            {
              label: "Username (your email address)",
              value: gorgiasEmail,
              onChange: () => setGorgiasEmail(event.target.value),
              name: "gorgias_email",
              autoComplete: "off",
              error: emailError
            }
          ),
          /* @__PURE__ */ jsx(
            TextField,
            {
              label: "Password (API Key)",
              value: gorgiasKey,
              onChange: () => setGorgiasKey(event.target.value),
              name: "gorgias_key",
              autoComplete: "off",
              error: apiKeyError
            }
          )
        ] }),
        /* @__PURE__ */ jsx(
          RadioButton,
          {
            label: "Instagram",
            helpText: "Get replies on Instagram",
            checked: integrationType == "instagram" ? true : false,
            name: "insta_integration",
            value: "instagram",
            onChange: (e) => setIntegrationType(event.target.value)
          }
        ),
        /* @__PURE__ */ jsx(
          RadioButton,
          {
            label: "Facebook",
            helpText: "Get replies on Facebook",
            checked: integrationType == "facebook" ? true : false,
            name: "facebook_integration",
            value: "facebook",
            onChange: (e) => setIntegrationType(event.target.value)
          }
        ),
        /* @__PURE__ */ jsx(
          RadioButton,
          {
            label: "Shopify Admin",
            helpText: "Get replies on Sopify admin",
            checked: integrationType == "admin" ? true : false,
            name: "admin",
            value: "admin",
            onChange: (e) => setIntegrationType(event.target.value)
          }
        ),
        /* @__PURE__ */ jsx(Button, { onClick: updateIntegrationKeys, children: "Save" })
      ] }) }) })
    ] }),
    dataSaved ? /* @__PURE__ */ jsx(ToastMessage, { message: successMessage, toggle: toggleActiveMessage }) : ""
  ] }) });
}
const route2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Integration
}, Symbol.toStringTag, { value: "Module" }));
function fine_tune(request) {
  const [file, setFile] = useState(null);
  const [fileUploads, setFileUploads] = useState([]);
  const [isFileUploaded, setIsFileUploaded] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const appBridge = useAppBridge();
  const toggleActiveMessage = useCallback(() => setIsFileUploaded((isFileUploaded2) => !isFileUploaded2), []);
  const handleDropZoneDrop = useCallback((acceptedFiles) => {
    console.log("isFileUploaded1: ", isFileUploaded);
    setFile(acceptedFiles[0]);
    var store_id = appBridge.config.shop;
    const formData = new FormData();
    formData.append("storeId", `${store_id}`);
    formData.append("training_csv", acceptedFiles[0]);
    axios.post(`${variables.API_URL}/training/upload-csv`, formData, { params: { store_id } }, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }).then((response) => {
      console.log(response.data);
      toggleActiveMessage();
      get_uploaded_csvs();
      setSuccessMessage("File uplaoded!");
      setTimeout(function() {
        setFile();
      }, 1500);
    }).catch((error) => {
      console.log(error);
    });
    console.log("isFileUploaded2: ", isFileUploaded);
  }, []);
  const fileUpload = !file && /* @__PURE__ */ jsx(DropZone.FileUpload, {});
  const uploadedFile = file && /* @__PURE__ */ jsxs(LegacyStack, { children: [
    /* @__PURE__ */ jsx(
      Thumbnail,
      {
        size: "small",
        alt: file.name,
        source: NoteIcon
      }
    ),
    /* @__PURE__ */ jsxs("div", { children: [
      file.name,
      " ",
      /* @__PURE__ */ jsxs(Text, { variant: "bodySm", as: "p", children: [
        file.size,
        " bytes"
      ] })
    ] })
  ] });
  const deleteFineTuning = (tune_id) => {
    setIsLoading(true);
    axios.delete(`${variables.API_URL}/trainings/delete/${tune_id}`, {
      params: { store_id: appBridge.config.shop }
    }).then((response) => {
      if (response.data.success === true) {
        toggleActiveMessage();
        setSuccessMessage(response.data.message);
        setIsLoading(false);
        get_uploaded_csvs();
      }
    }).catch((err) => {
      console.log(err);
    });
  };
  const get_uploaded_csvs = async () => {
    var appBridge2 = useAppBridge();
    var store_id = appBridge2.config.shop;
    await axios.get(`${variables.API_URL}/trainings`, {
      params: {
        store_id
      }
    }).then((response) => {
      var uploads = [];
      var count = 0;
      if (response.data.success === true) {
        response.data.data.map((item) => {
          count++;
          var trainingDateObj = new Date(item.createdAt);
          var trainingDate = `${trainingDateObj.getFullYear()}-${trainingDateObj.getMonth()}-${trainingDateObj.getDate()} ${trainingDateObj.getHours()}:${trainingDateObj.getMinutes()}`;
          let cancelJob = /* @__PURE__ */ jsx(Button, { onClick: () => deleteFineTuning(item._id), children: "Delete" });
          uploads.push([count, item.csvfilename, trainingDate, /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(Button, { url: item.csvfilepath, children: "Download" }),
            " ",
            cancelJob
          ] })]);
        });
      }
      setIsLoading(false);
      setFileUploads(uploads);
    }).catch((err) => {
      console.log(err);
    });
  };
  useEffect(() => {
    get_uploaded_csvs();
  }, []);
  console.log("isFileUploaded3: ", isFileUploaded);
  return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsxs(Page, { children: [
    isLoading ? /* @__PURE__ */ jsx(ChatBotLoader, {}) : "",
    /* @__PURE__ */ jsxs(BlockStack, { gap: "200", children: [
      /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(BlockStack, { gap: "200", children: [
        /* @__PURE__ */ jsx(Text, { variant: "headingMd", as: "h2", children: "Upload CSV" }),
        /* @__PURE__ */ jsxs(DropZone, { allowMultiple: false, onDrop: handleDropZoneDrop, children: [
          uploadedFile,
          fileUpload
        ] })
      ] }) }),
      /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(BlockStack, { gap: "200", children: [
        /* @__PURE__ */ jsx(Text, { variant: "headingMd", as: "h2", children: "Uploaded CSV" }),
        /* @__PURE__ */ jsx(LegacyCard, { children: /* @__PURE__ */ jsx(
          DataTable,
          {
            columnContentTypes: [
              "text",
              "text",
              "text",
              "text",
              "text"
            ],
            headings: [
              "Sr no.",
              "Filename",
              "Date",
              // 'Progress',
              "Actions"
            ],
            rows: fileUploads
          }
        ) })
      ] }) })
    ] }),
    isFileUploaded ? /* @__PURE__ */ jsx(ToastMessage, { message: successMessage, toggle: toggleActiveMessage }) : ""
  ] }) });
}
const route3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: fine_tune
}, Symbol.toStringTag, { value: "Module" }));
const settings = () => {
  const [mailerName, setMailerName] = useState("");
  const [mailerUser, setMailerUser] = useState("");
  const [mailerPass, setMailerPass] = useState("");
  const [mailerNameError, setMailerNameError] = useState("");
  const [mailerUserError, setMailerUserError] = useState("");
  const [mailerPassError, setMailerPassError] = useState("");
  const [dataSaved, setDataSaved] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const appBridge = useAppBridge();
  const toggleActiveMessage = useCallback(() => setDataSaved((dataSaved2) => !dataSaved2), []);
  const updateMailerSettings = () => {
    setIsLoading(true);
    var body = {
      mailer_name: mailerName,
      mailer_auth: {
        user: mailerUser,
        pass: mailerPass
      }
    };
    axios.put(`${variables.API_URL}/stores/update/mailer`, body, {
      params: {
        store_id: appBridge.config.shop
      }
    }).then((response) => {
      setDataSaved(true);
      if (response.data.success === false) {
        setMailerUserError(`Invalid User!`);
        setMailerPassError(`Invalid Password!`);
        setSuccessMessage(response.data.message);
        return false;
      }
      if (response.data.success === true) {
        setSuccessMessage(response.data.message);
      }
      setIsLoading(false);
      console.log(response);
    }).catch((err) => {
      console.log(err);
    });
  };
  const getStoreData = () => {
    setIsLoading(true);
    axios.get(`${variables.API_URL}/stores/get`, {
      params: {
        store_id: appBridge.config.shop
      }
    }).then((response) => {
      var _a2, _b, _c, _d, _e, _f, _g, _h;
      if (response.data.success === true) {
        setMailerName((_b = (_a2 = response == null ? void 0 : response.data) == null ? void 0 : _a2.data) == null ? void 0 : _b.mailer_name);
        setMailerUser((_e = (_d = (_c = response == null ? void 0 : response.data) == null ? void 0 : _c.data) == null ? void 0 : _d.mailer_auth) == null ? void 0 : _e.user);
        setMailerPass((_h = (_g = (_f = response == null ? void 0 : response.data) == null ? void 0 : _f.data) == null ? void 0 : _g.mailer_auth) == null ? void 0 : _h.pass);
      } else {
        setDataSaved(true);
        setSuccessMessage(response.data.message);
      }
      setIsLoading(false);
    }).catch((err) => {
      setDataSaved(true);
      setSuccessMessage(err);
    });
  };
  useEffect(() => {
    getStoreData();
  }, []);
  return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsxs(Page, { children: [
    isLoading ? /* @__PURE__ */ jsx(ChatBotLoader, {}) : "",
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(Text, { variant: "headingMd", as: "h2", children: "Settings" }),
      /* @__PURE__ */ jsx(LegacyStack, { vertical: true, children: /* @__PURE__ */ jsxs("form", { children: [
        /* @__PURE__ */ jsx(
          TextField,
          {
            label: "Mailer name",
            value: mailerName,
            onChange: () => setMailerName(event.target.value),
            name: "mailer_name",
            autoComplete: "off",
            error: mailerNameError
          }
        ),
        /* @__PURE__ */ jsx(
          TextField,
          {
            label: "User",
            value: mailerUser,
            onChange: () => setMailerUser(event.target.value),
            name: "mailer_user",
            autoComplete: "off",
            error: mailerUserError
          }
        ),
        /* @__PURE__ */ jsx(
          TextField,
          {
            label: "Password",
            value: mailerPass,
            onChange: () => setMailerPass(event.target.value),
            name: "mailer_pass",
            autoComplete: "off",
            error: mailerPassError
          }
        ),
        /* @__PURE__ */ jsx("br", {}),
        /* @__PURE__ */ jsx(Button, { onClick: updateMailerSettings, children: "Save" })
      ] }) })
    ] }),
    dataSaved ? /* @__PURE__ */ jsx(ToastMessage, { message: successMessage, toggle: toggleActiveMessage }) : ""
  ] }) });
};
const route4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: settings
}, Symbol.toStringTag, { value: "Module" }));
const loader$5 = async ({ request }) => {
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
    }`
  );
  const data = await response.json();
  const orderData = data.data.orders;
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
    }`
  );
  const storeId = await getStoreDetails.json();
  const store_id = storeId.data.shop.myshopifyDomain;
  addOrderdetails(orderData);
  async function addOrderdetails(orderData2) {
    await axios.post(`${variables.API_URL}/orders/add/details`, orderData2, { params: { store_id } }).then((response2) => {
      if (response2.data.success === true) {
        console.log("Add Orders Successfully ");
      }
    }).catch((err) => {
      console.error(err);
    });
  }
  return null;
};
const action$2 = async ({ request }) => {
  var _a2, _b;
  const { admin } = await authenticate.admin(request);
  const color = ["Red", "Orange", "Yellow", "Green"][Math.floor(Math.random() * 4)];
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
          title: `${color} Snowboard`
        }
      }
    }
  );
  const responseJson = await response.json();
  return json({
    product: (_b = (_a2 = responseJson.data) == null ? void 0 : _a2.productCreate) == null ? void 0 : _b.product
  });
};
function Index() {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFileUploaded, setIsFileUploaded] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [storeIntegrationType, setStoreIntegrationType] = useState("");
  const appBridge = useAppBridge();
  const toggleActiveMessage = useCallback(() => setIsFileUploaded((isFileUploaded2) => !isFileUploaded2), []);
  const deleteTicket = async (ticket_id) => {
    setIsLoading(true);
    axios.post(`${variables.API_URL}/ticket/delete`, { ticket_id }, { params: { store_id: appBridge.config.shop } }).then((response) => {
      getTickets();
      toggleActiveMessage();
      setIsLoading(false);
      setSuccessMessage(response.data.message);
    }).catch((err) => {
      console.log(err);
    });
  };
  const getStoreData = async () => {
    await axios.get(`${variables.API_URL}/stores/get`, {
      params: {
        store_id: appBridge.config.shop
      }
    }).then((response) => {
      if (response.data.success === true) {
        setStoreIntegrationType(response.data.data.integration_type);
      }
    }).catch((err) => {
      console.log(err);
    });
  };
  const getTickets = async () => {
    axios.get(`${variables.API_URL}/tickets`, {
      params: {
        store_id: appBridge.config.shop
      }
    }).then((response) => {
      var ticketsData = [];
      response.data.data.map((item) => {
        let ticketDate = new Date(item.createdAt);
        ticketDate = `${ticketDate.getDate()}-${ticketDate.getMonth()}-${ticketDate.getFullYear()} ${ticketDate.getHours()}:${ticketDate.getMinutes()}:${ticketDate.getSeconds()}`;
        ticketsData.push([
          item.subject,
          item.customer_email,
          item.status == 0 ? "Closed" : "Active",
          ticketDate,
          /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsxs(ButtonGroup, { children: [
            /* @__PURE__ */ jsx(Button, { variant: "primary", tone: "critical", onClick: () => deleteTicket(item._id), children: "Delete" }),
            /* @__PURE__ */ jsx("div", { className: "viewTicketBtn", children: /* @__PURE__ */ jsx(Button, { children: /* @__PURE__ */ jsx(Link, { to: `/app/view_ticket/${item._id}`, children: "view" }) }) })
          ] }) })
        ]);
      });
      setTickets(ticketsData);
      setIsLoading(false);
    }).catch((error) => {
      console.error("Error fetching data:", error);
    });
  };
  useEffect(() => {
    getStoreData();
  }, []);
  useEffect(() => {
    getTickets();
  }, [storeIntegrationType]);
  return /* @__PURE__ */ jsxs(Page, { children: [
    isLoading ? /* @__PURE__ */ jsx(ChatBotLoader, {}) : "",
    /* @__PURE__ */ jsxs(BlockStack, { gap: "200", children: [
      /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(Text, { variants: "headingMd", as: "h1", children: "Tickets" }) }),
      /* @__PURE__ */ jsx(LegacyCard, { children: /* @__PURE__ */ jsx(
        DataTable,
        {
          columnContentTypes: [
            "text",
            "text",
            "text",
            "text",
            "text"
          ],
          headings: [
            "Subject",
            "Customer Email",
            "Status",
            "Created at",
            "Actions"
          ],
          rows: tickets
        }
      ) })
    ] }),
    isFileUploaded ? /* @__PURE__ */ jsx(ToastMessage, { message: successMessage, toggle: toggleActiveMessage }) : ""
  ] });
}
const route5 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$2,
  default: Index,
  loader: loader$5
}, Symbol.toStringTag, { value: "Module" }));
const Polaris = {
  ActionMenu: {
    Actions: {
      moreActions: "More actions"
    },
    RollupActions: {
      rollupButton: "View actions"
    }
  },
  ActionList: {
    SearchField: {
      clearButtonLabel: "Clear",
      search: "Search",
      placeholder: "Search actions"
    }
  },
  Avatar: {
    label: "Avatar",
    labelWithInitials: "Avatar with initials {initials}"
  },
  Autocomplete: {
    spinnerAccessibilityLabel: "Loading",
    ellipsis: "{content}…"
  },
  Badge: {
    PROGRESS_LABELS: {
      incomplete: "Incomplete",
      partiallyComplete: "Partially complete",
      complete: "Complete"
    },
    TONE_LABELS: {
      info: "Info",
      success: "Success",
      warning: "Warning",
      critical: "Critical",
      attention: "Attention",
      "new": "New",
      readOnly: "Read-only",
      enabled: "Enabled"
    },
    progressAndTone: "{toneLabel} {progressLabel}"
  },
  Banner: {
    dismissButton: "Dismiss notification"
  },
  Button: {
    spinnerAccessibilityLabel: "Loading"
  },
  Common: {
    checkbox: "checkbox",
    undo: "Undo",
    cancel: "Cancel",
    clear: "Clear",
    close: "Close",
    submit: "Submit",
    more: "More"
  },
  ContextualSaveBar: {
    save: "Save",
    discard: "Discard"
  },
  DataTable: {
    sortAccessibilityLabel: "sort {direction} by",
    navAccessibilityLabel: "Scroll table {direction} one column",
    totalsRowHeading: "Totals",
    totalRowHeading: "Total"
  },
  DatePicker: {
    previousMonth: "Show previous month, {previousMonthName} {showPreviousYear}",
    nextMonth: "Show next month, {nextMonth} {nextYear}",
    today: "Today ",
    start: "Start of range",
    end: "End of range",
    months: {
      january: "January",
      february: "February",
      march: "March",
      april: "April",
      may: "May",
      june: "June",
      july: "July",
      august: "August",
      september: "September",
      october: "October",
      november: "November",
      december: "December"
    },
    days: {
      monday: "Monday",
      tuesday: "Tuesday",
      wednesday: "Wednesday",
      thursday: "Thursday",
      friday: "Friday",
      saturday: "Saturday",
      sunday: "Sunday"
    },
    daysAbbreviated: {
      monday: "Mo",
      tuesday: "Tu",
      wednesday: "We",
      thursday: "Th",
      friday: "Fr",
      saturday: "Sa",
      sunday: "Su"
    }
  },
  DiscardConfirmationModal: {
    title: "Discard all unsaved changes",
    message: "If you discard changes, you’ll delete any edits you made since you last saved.",
    primaryAction: "Discard changes",
    secondaryAction: "Continue editing"
  },
  DropZone: {
    single: {
      overlayTextFile: "Drop file to upload",
      overlayTextImage: "Drop image to upload",
      overlayTextVideo: "Drop video to upload",
      actionTitleFile: "Add file",
      actionTitleImage: "Add image",
      actionTitleVideo: "Add video",
      actionHintFile: "or drop file to upload",
      actionHintImage: "or drop image to upload",
      actionHintVideo: "or drop video to upload",
      labelFile: "Upload file",
      labelImage: "Upload image",
      labelVideo: "Upload video"
    },
    allowMultiple: {
      overlayTextFile: "Drop files to upload",
      overlayTextImage: "Drop images to upload",
      overlayTextVideo: "Drop videos to upload",
      actionTitleFile: "Add files",
      actionTitleImage: "Add images",
      actionTitleVideo: "Add videos",
      actionHintFile: "or drop files to upload",
      actionHintImage: "or drop images to upload",
      actionHintVideo: "or drop videos to upload",
      labelFile: "Upload files",
      labelImage: "Upload images",
      labelVideo: "Upload videos"
    },
    errorOverlayTextFile: "File type is not valid",
    errorOverlayTextImage: "Image type is not valid",
    errorOverlayTextVideo: "Video type is not valid"
  },
  EmptySearchResult: {
    altText: "Empty search results"
  },
  Frame: {
    skipToContent: "Skip to content",
    navigationLabel: "Navigation",
    Navigation: {
      closeMobileNavigationLabel: "Close navigation"
    }
  },
  FullscreenBar: {
    back: "Back",
    accessibilityLabel: "Exit fullscreen mode"
  },
  Filters: {
    moreFilters: "More filters",
    moreFiltersWithCount: "More filters ({count})",
    filter: "Filter {resourceName}",
    noFiltersApplied: "No filters applied",
    cancel: "Cancel",
    done: "Done",
    clearAllFilters: "Clear all filters",
    clear: "Clear",
    clearLabel: "Clear {filterName}",
    addFilter: "Add filter",
    clearFilters: "Clear all",
    searchInView: "in:{viewName}"
  },
  FilterPill: {
    clear: "Clear"
  },
  IndexFilters: {
    searchFilterTooltip: "Search and filter",
    searchFilterTooltipWithShortcut: "Search and filter (F)",
    searchFilterAccessibilityLabel: "Search and filter results",
    sort: "Sort your results",
    addView: "Add a new view",
    newView: "Custom search",
    SortButton: {
      ariaLabel: "Sort the results",
      tooltip: "Sort",
      title: "Sort by",
      sorting: {
        asc: "Ascending",
        desc: "Descending",
        az: "A-Z",
        za: "Z-A"
      }
    },
    EditColumnsButton: {
      tooltip: "Edit columns",
      accessibilityLabel: "Customize table column order and visibility"
    },
    UpdateButtons: {
      cancel: "Cancel",
      update: "Update",
      save: "Save",
      saveAs: "Save as",
      modal: {
        title: "Save view as",
        label: "Name",
        sameName: "A view with this name already exists. Please choose a different name.",
        save: "Save",
        cancel: "Cancel"
      }
    }
  },
  IndexProvider: {
    defaultItemSingular: "Item",
    defaultItemPlural: "Items",
    allItemsSelected: "All {itemsLength}+ {resourceNamePlural} are selected",
    selected: "{selectedItemsCount} selected",
    a11yCheckboxDeselectAllSingle: "Deselect {resourceNameSingular}",
    a11yCheckboxSelectAllSingle: "Select {resourceNameSingular}",
    a11yCheckboxDeselectAllMultiple: "Deselect all {itemsLength} {resourceNamePlural}",
    a11yCheckboxSelectAllMultiple: "Select all {itemsLength} {resourceNamePlural}"
  },
  IndexTable: {
    emptySearchTitle: "No {resourceNamePlural} found",
    emptySearchDescription: "Try changing the filters or search term",
    onboardingBadgeText: "New",
    resourceLoadingAccessibilityLabel: "Loading {resourceNamePlural}…",
    selectAllLabel: "Select all {resourceNamePlural}",
    selected: "{selectedItemsCount} selected",
    undo: "Undo",
    selectAllItems: "Select all {itemsLength}+ {resourceNamePlural}",
    selectItem: "Select {resourceName}",
    selectButtonText: "Select",
    sortAccessibilityLabel: "sort {direction} by"
  },
  Loading: {
    label: "Page loading bar"
  },
  Modal: {
    iFrameTitle: "body markup",
    modalWarning: "These required properties are missing from Modal: {missingProps}"
  },
  Page: {
    Header: {
      rollupActionsLabel: "View actions for {title}",
      pageReadyAccessibilityLabel: "{title}. This page is ready"
    }
  },
  Pagination: {
    previous: "Previous",
    next: "Next",
    pagination: "Pagination"
  },
  ProgressBar: {
    negativeWarningMessage: "Values passed to the progress prop shouldn’t be negative. Resetting {progress} to 0.",
    exceedWarningMessage: "Values passed to the progress prop shouldn’t exceed 100. Setting {progress} to 100."
  },
  ResourceList: {
    sortingLabel: "Sort by",
    defaultItemSingular: "item",
    defaultItemPlural: "items",
    showing: "Showing {itemsCount} {resource}",
    showingTotalCount: "Showing {itemsCount} of {totalItemsCount} {resource}",
    loading: "Loading {resource}",
    selected: "{selectedItemsCount} selected",
    allItemsSelected: "All {itemsLength}+ {resourceNamePlural} in your store are selected",
    allFilteredItemsSelected: "All {itemsLength}+ {resourceNamePlural} in this filter are selected",
    selectAllItems: "Select all {itemsLength}+ {resourceNamePlural} in your store",
    selectAllFilteredItems: "Select all {itemsLength}+ {resourceNamePlural} in this filter",
    emptySearchResultTitle: "No {resourceNamePlural} found",
    emptySearchResultDescription: "Try changing the filters or search term",
    selectButtonText: "Select",
    a11yCheckboxDeselectAllSingle: "Deselect {resourceNameSingular}",
    a11yCheckboxSelectAllSingle: "Select {resourceNameSingular}",
    a11yCheckboxDeselectAllMultiple: "Deselect all {itemsLength} {resourceNamePlural}",
    a11yCheckboxSelectAllMultiple: "Select all {itemsLength} {resourceNamePlural}",
    Item: {
      actionsDropdownLabel: "Actions for {accessibilityLabel}",
      actionsDropdown: "Actions dropdown",
      viewItem: "View details for {itemName}"
    },
    BulkActions: {
      actionsActivatorLabel: "Actions",
      moreActionsActivatorLabel: "More actions"
    }
  },
  SkeletonPage: {
    loadingLabel: "Page loading"
  },
  Tabs: {
    newViewAccessibilityLabel: "Create new view",
    newViewTooltip: "Create view",
    toggleTabsLabel: "More views",
    Tab: {
      rename: "Rename view",
      duplicate: "Duplicate view",
      edit: "Edit view",
      editColumns: "Edit columns",
      "delete": "Delete view",
      copy: "Copy of {name}",
      deleteModal: {
        title: "Delete view?",
        description: "This can’t be undone. {viewName} view will no longer be available in your admin.",
        cancel: "Cancel",
        "delete": "Delete view"
      }
    },
    RenameModal: {
      title: "Rename view",
      label: "Name",
      cancel: "Cancel",
      create: "Save",
      errors: {
        sameName: "A view with this name already exists. Please choose a different name."
      }
    },
    DuplicateModal: {
      title: "Duplicate view",
      label: "Name",
      cancel: "Cancel",
      create: "Create view",
      errors: {
        sameName: "A view with this name already exists. Please choose a different name."
      }
    },
    CreateViewModal: {
      title: "Create new view",
      label: "Name",
      cancel: "Cancel",
      create: "Create view",
      errors: {
        sameName: "A view with this name already exists. Please choose a different name."
      }
    }
  },
  Tag: {
    ariaLabel: "Remove {children}"
  },
  TextField: {
    characterCount: "{count} characters",
    characterCountWithMaxLength: "{count} of {limit} characters used"
  },
  TooltipOverlay: {
    accessibilityLabel: "Tooltip: {label}"
  },
  TopBar: {
    toggleMenuLabel: "Toggle menu",
    SearchField: {
      clearButtonLabel: "Clear",
      search: "Search"
    }
  },
  MediaCard: {
    dismissButton: "Dismiss",
    popoverButton: "Actions"
  },
  VideoThumbnail: {
    playButtonA11yLabel: {
      "default": "Play video",
      defaultWithDuration: "Play video of length {duration}",
      duration: {
        hours: {
          other: {
            only: "{hourCount} hours",
            andMinutes: "{hourCount} hours and {minuteCount} minutes",
            andMinute: "{hourCount} hours and {minuteCount} minute",
            minutesAndSeconds: "{hourCount} hours, {minuteCount} minutes, and {secondCount} seconds",
            minutesAndSecond: "{hourCount} hours, {minuteCount} minutes, and {secondCount} second",
            minuteAndSeconds: "{hourCount} hours, {minuteCount} minute, and {secondCount} seconds",
            minuteAndSecond: "{hourCount} hours, {minuteCount} minute, and {secondCount} second",
            andSeconds: "{hourCount} hours and {secondCount} seconds",
            andSecond: "{hourCount} hours and {secondCount} second"
          },
          one: {
            only: "{hourCount} hour",
            andMinutes: "{hourCount} hour and {minuteCount} minutes",
            andMinute: "{hourCount} hour and {minuteCount} minute",
            minutesAndSeconds: "{hourCount} hour, {minuteCount} minutes, and {secondCount} seconds",
            minutesAndSecond: "{hourCount} hour, {minuteCount} minutes, and {secondCount} second",
            minuteAndSeconds: "{hourCount} hour, {minuteCount} minute, and {secondCount} seconds",
            minuteAndSecond: "{hourCount} hour, {minuteCount} minute, and {secondCount} second",
            andSeconds: "{hourCount} hour and {secondCount} seconds",
            andSecond: "{hourCount} hour and {secondCount} second"
          }
        },
        minutes: {
          other: {
            only: "{minuteCount} minutes",
            andSeconds: "{minuteCount} minutes and {secondCount} seconds",
            andSecond: "{minuteCount} minutes and {secondCount} second"
          },
          one: {
            only: "{minuteCount} minute",
            andSeconds: "{minuteCount} minute and {secondCount} seconds",
            andSecond: "{minuteCount} minute and {secondCount} second"
          }
        },
        seconds: {
          other: "{secondCount} seconds",
          one: "{secondCount} second"
        }
      }
    }
  }
};
const polarisTranslations = {
  Polaris
};
function loginErrorMessage(loginErrors) {
  if ((loginErrors == null ? void 0 : loginErrors.shop) === LoginErrorType.MissingShop) {
    return { shop: "Please enter your shop domain to log in" };
  } else if ((loginErrors == null ? void 0 : loginErrors.shop) === LoginErrorType.InvalidShop) {
    return { shop: "Please enter a valid shop domain to log in" };
  }
  return {};
}
const loader$4 = async ({ request }) => {
  const errors = loginErrorMessage(await login(request));
  return json({ errors, polarisTranslations });
};
const action$1 = async ({ request }) => {
  const errors = loginErrorMessage(await login(request));
  return json({
    errors
  });
};
function Auth() {
  const loaderData = useLoaderData();
  const actionData = useActionData();
  const [shop, setShop] = useState("");
  const { errors } = actionData || loaderData;
  return /* @__PURE__ */ jsx(AppProvider, { i18n: loaderData.polarisTranslations, children: /* @__PURE__ */ jsx(Page, { children: /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(Form, { method: "post", children: /* @__PURE__ */ jsxs(FormLayout, { children: [
    /* @__PURE__ */ jsx(Text, { variant: "headingMd", as: "h2", children: "Log in" }),
    /* @__PURE__ */ jsx(
      TextField,
      {
        type: "text",
        name: "shop",
        label: "Shop domain",
        helpText: "example.myshopify.com",
        value: shop,
        onChange: setShop,
        autoComplete: "on",
        error: errors.shop
      }
    ),
    /* @__PURE__ */ jsx(Button, { submit: true, children: "Log in" })
  ] }) }) }) }) });
}
const route6 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$1,
  default: Auth,
  loader: loader$4
}, Symbol.toStringTag, { value: "Module" }));
function Test() {
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("h1", { children: "Shopify Products" }),
    /* @__PURE__ */ jsx("ul", {})
  ] });
}
const route8 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Test
}, Symbol.toStringTag, { value: "Module" }));
const action = async ({ request }) => {
  const { topic, shop, session, admin } = await authenticate.webhook(request);
  if (!admin) {
    throw new Response();
  }
  switch (topic) {
    case "APP_UNINSTALLED":
      if (session) {
        await prisma.session.deleteMany({ where: { shop } });
      }
      break;
    case "CUSTOMERS_DATA_REQUEST":
    case "CUSTOMERS_REDACT":
    case "SHOP_REDACT":
    default:
      throw new Response("Unhandled webhook topic", { status: 404 });
  }
  throw new Response();
};
const route9 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action
}, Symbol.toStringTag, { value: "Module" }));
const loader$3 = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};
const route10 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  loader: loader$3
}, Symbol.toStringTag, { value: "Module" }));
const index = "_index_1m92e_1";
const heading = "_heading_1m92e_21";
const text = "_text_1m92e_23";
const content = "_content_1m92e_43";
const form = "_form_1m92e_53";
const label = "_label_1m92e_69";
const input = "_input_1m92e_85";
const button = "_button_1m92e_93";
const list = "_list_1m92e_101";
const loader$2 = "_loader_1m92e_129";
const spin = "_spin_1m92e_1";
const styles = {
  index,
  heading,
  text,
  content,
  form,
  label,
  input,
  button,
  list,
  loader: loader$2,
  spin
};
const loader$1 = async ({ request }) => {
  const url = new URL(request.url);
  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }
  return json({ showForm: Boolean(login) });
};
function App$1() {
  const { showForm } = useLoaderData();
  return /* @__PURE__ */ jsx("div", { className: styles.index, children: /* @__PURE__ */ jsxs("div", { className: styles.content, children: [
    /* @__PURE__ */ jsx("h1", { className: styles.heading, children: "A short heading about [your app]" }),
    /* @__PURE__ */ jsx("p", { className: styles.text, children: "A tagline about [your app] that describes your value proposition." }),
    showForm && /* @__PURE__ */ jsxs(Form, { className: styles.form, method: "post", action: "/auth/login", children: [
      /* @__PURE__ */ jsxs("label", { className: styles.label, children: [
        /* @__PURE__ */ jsx("span", { children: "Shop domain" }),
        /* @__PURE__ */ jsx("input", { className: styles.input, type: "text", name: "shop" }),
        /* @__PURE__ */ jsx("span", { children: "e.g: my-shop-domain.myshopify.com" })
      ] }),
      /* @__PURE__ */ jsx("button", { className: styles.button, type: "submit", children: "Log in" })
    ] }),
    /* @__PURE__ */ jsxs("ul", { className: styles.list, children: [
      /* @__PURE__ */ jsxs("li", { children: [
        /* @__PURE__ */ jsx("strong", { children: "Product feature" }),
        ". Some detail about your feature and its benefit to your customer."
      ] }),
      /* @__PURE__ */ jsxs("li", { children: [
        /* @__PURE__ */ jsx("strong", { children: "Product feature" }),
        ". Some detail about your feature and its benefit to your customer."
      ] }),
      /* @__PURE__ */ jsxs("li", { children: [
        /* @__PURE__ */ jsx("strong", { children: "Product feature" }),
        ". Some detail about your feature and its benefit to your customer."
      ] })
    ] })
  ] }) });
}
const route11 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: App$1,
  loader: loader$1
}, Symbol.toStringTag, { value: "Module" }));
const loader = async ({ request }) => {
  await authenticate.admin(request);
  return json({ apiKey: process.env.SHOPIFY_API_KEY || "" });
};
function App() {
  const { apiKey } = useLoaderData();
  return /* @__PURE__ */ jsxs(AppProvider$1, { isEmbeddedApp: true, apiKey, children: [
    /* @__PURE__ */ jsxs("ui-nav-menu", { children: [
      /* @__PURE__ */ jsx(Link, { to: "/app", rel: "home", children: "Home" }),
      /* @__PURE__ */ jsx(Link, { to: "/app/fine_tune", children: "Train Assistant" }),
      /* @__PURE__ */ jsx(Link, { to: "/app/integration", children: "Integration" }),
      /* @__PURE__ */ jsx(Link, { to: "/app/settings", children: "Settings" })
    ] }),
    /* @__PURE__ */ jsx(Outlet, {})
  ] });
}
function ErrorBoundary() {
  return boundary.error(useRouteError());
}
const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
const route12 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ErrorBoundary,
  default: App,
  headers,
  loader
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-DP5H1iLZ.js?client-route=1", "imports": ["/assets/jsx-runtime-DexIYAB0.js", "/assets/index-BmgK8DIy.js", "/assets/components-BnUS28CX.js", "/assets/browser-D0HVO5KW.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/root-BgR7NesM.js?client-route=1", "imports": ["/assets/jsx-runtime-DexIYAB0.js", "/assets/index-BmgK8DIy.js", "/assets/components-BnUS28CX.js", "/assets/browser-D0HVO5KW.js", "/assets/scroll-restoration-CnQ_QcNm.js"], "css": [] }, "routes/app.view_ticket.$t_id": { "id": "routes/app.view_ticket.$t_id", "parentId": "routes/app", "path": "view_ticket/:t_id", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/app.view_ticket._t_id-jbwvvLBd.js?client-route=1", "imports": ["/assets/jsx-runtime-DexIYAB0.js", "/assets/index-BmgK8DIy.js", "/assets/Page-g_6naJ0r.js", "/assets/Toast-Ckam4cjg.js", "/assets/toastMessage-BoDQuLRo.js", "/assets/variables-EC5tLZZH.js", "/assets/components-BnUS28CX.js"], "css": ["/assets/style-COFOSLFM.css"] }, "routes/app.integration": { "id": "routes/app.integration", "parentId": "routes/app", "path": "integration", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/app.integration-vxUlxpIz.js?client-route=1", "imports": ["/assets/jsx-runtime-DexIYAB0.js", "/assets/index-BmgK8DIy.js", "/assets/Page-g_6naJ0r.js", "/assets/Toast-Ckam4cjg.js", "/assets/toastMessage-BoDQuLRo.js", "/assets/variables-EC5tLZZH.js", "/assets/RadioButton-POZI-aKh.js"], "css": ["/assets/style-COFOSLFM.css"] }, "routes/app.fine_tune": { "id": "routes/app.fine_tune", "parentId": "routes/app", "path": "fine_tune", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/app.fine_tune-BGqAFIBT.js?client-route=1", "imports": ["/assets/jsx-runtime-DexIYAB0.js", "/assets/index-BmgK8DIy.js", "/assets/Page-g_6naJ0r.js", "/assets/Toast-Ckam4cjg.js", "/assets/toastMessage-BoDQuLRo.js", "/assets/variables-EC5tLZZH.js", "/assets/Thumbnail-8zv5IRGT.js", "/assets/DataTable-Cc8KQHKZ.js"], "css": [] }, "routes/app.settings": { "id": "routes/app.settings", "parentId": "routes/app", "path": "settings", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/app.settings-C0VIPgCf.js?client-route=1", "imports": ["/assets/jsx-runtime-DexIYAB0.js", "/assets/index-BmgK8DIy.js", "/assets/Page-g_6naJ0r.js", "/assets/Toast-Ckam4cjg.js", "/assets/toastMessage-BoDQuLRo.js", "/assets/variables-EC5tLZZH.js"], "css": [] }, "routes/app._index": { "id": "routes/app._index", "parentId": "routes/app", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/app._index-C6D1T-GV.js?client-route=1", "imports": ["/assets/jsx-runtime-DexIYAB0.js", "/assets/index-BmgK8DIy.js", "/assets/Page-g_6naJ0r.js", "/assets/Toast-Ckam4cjg.js", "/assets/toastMessage-BoDQuLRo.js", "/assets/variables-EC5tLZZH.js", "/assets/DataTable-Cc8KQHKZ.js", "/assets/components-BnUS28CX.js"], "css": ["/assets/style-COFOSLFM.css"] }, "routes/auth.login": { "id": "routes/auth.login", "parentId": "root", "path": "auth/login", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/route-7uIB9WMr.js?client-route=1", "imports": ["/assets/jsx-runtime-DexIYAB0.js", "/assets/index-BmgK8DIy.js", "/assets/Page-g_6naJ0r.js", "/assets/styles-FO6d1KNi.js", "/assets/components-BnUS28CX.js"], "css": ["/assets/styles-Csig7RBB.css"] }, "routes/variables": { "id": "routes/variables", "parentId": "root", "path": "variables", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/variables-EC5tLZZH.js?client-route=1", "imports": [], "css": [] }, "routes/app.test": { "id": "routes/app.test", "parentId": "routes/app", "path": "test", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/app.test-Dhb3zSj2.js?client-route=1", "imports": ["/assets/jsx-runtime-DexIYAB0.js"], "css": [] }, "routes/webhooks": { "id": "routes/webhooks", "parentId": "root", "path": "webhooks", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/webhooks-l0sNRNKZ.js?client-route=1", "imports": [], "css": [] }, "routes/auth.$": { "id": "routes/auth.$", "parentId": "root", "path": "auth/*", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/auth._-l0sNRNKZ.js?client-route=1", "imports": [], "css": [] }, "routes/_index": { "id": "routes/_index", "parentId": "root", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/route-cFHO_RLu.js?client-route=1", "imports": ["/assets/jsx-runtime-DexIYAB0.js", "/assets/index-BmgK8DIy.js", "/assets/components-BnUS28CX.js"], "css": ["/assets/route-CAvEWrwO.css"] }, "routes/app": { "id": "routes/app", "parentId": "root", "path": "app", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": true, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": true, "module": "/assets/app-BMPeNZa5.js?client-route=1", "imports": ["/assets/jsx-runtime-DexIYAB0.js", "/assets/index-BmgK8DIy.js", "/assets/Page-g_6naJ0r.js", "/assets/Toast-Ckam4cjg.js", "/assets/components-BnUS28CX.js", "/assets/styles-FO6d1KNi.js", "/assets/RadioButton-POZI-aKh.js", "/assets/DataTable-Cc8KQHKZ.js", "/assets/Thumbnail-8zv5IRGT.js", "/assets/browser-D0HVO5KW.js", "/assets/scroll-restoration-CnQ_QcNm.js"], "css": ["/assets/styles-Csig7RBB.css"] } }, "url": "/assets/manifest-4454171a.js", "version": "4454171a" };
const mode = "production";
const assetsBuildDirectory = "build\\client";
const basename = "/";
const future = { "v3_fetcherPersist": false, "v3_relativeSplatPath": false, "v3_throwAbortReason": false };
const isSpaMode = false;
const publicPath = "/";
const entry = { module: entryServer };
const routes = {
  "root": {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: route0
  },
  "routes/app.view_ticket.$t_id": {
    id: "routes/app.view_ticket.$t_id",
    parentId: "routes/app",
    path: "view_ticket/:t_id",
    index: void 0,
    caseSensitive: void 0,
    module: route1
  },
  "routes/app.integration": {
    id: "routes/app.integration",
    parentId: "routes/app",
    path: "integration",
    index: void 0,
    caseSensitive: void 0,
    module: route2
  },
  "routes/app.fine_tune": {
    id: "routes/app.fine_tune",
    parentId: "routes/app",
    path: "fine_tune",
    index: void 0,
    caseSensitive: void 0,
    module: route3
  },
  "routes/app.settings": {
    id: "routes/app.settings",
    parentId: "routes/app",
    path: "settings",
    index: void 0,
    caseSensitive: void 0,
    module: route4
  },
  "routes/app._index": {
    id: "routes/app._index",
    parentId: "routes/app",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route5
  },
  "routes/auth.login": {
    id: "routes/auth.login",
    parentId: "root",
    path: "auth/login",
    index: void 0,
    caseSensitive: void 0,
    module: route6
  },
  "routes/variables": {
    id: "routes/variables",
    parentId: "root",
    path: "variables",
    index: void 0,
    caseSensitive: void 0,
    module: route7
  },
  "routes/app.test": {
    id: "routes/app.test",
    parentId: "routes/app",
    path: "test",
    index: void 0,
    caseSensitive: void 0,
    module: route8
  },
  "routes/webhooks": {
    id: "routes/webhooks",
    parentId: "root",
    path: "webhooks",
    index: void 0,
    caseSensitive: void 0,
    module: route9
  },
  "routes/auth.$": {
    id: "routes/auth.$",
    parentId: "root",
    path: "auth/*",
    index: void 0,
    caseSensitive: void 0,
    module: route10
  },
  "routes/_index": {
    id: "routes/_index",
    parentId: "root",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route11
  },
  "routes/app": {
    id: "routes/app",
    parentId: "root",
    path: "app",
    index: void 0,
    caseSensitive: void 0,
    module: route12
  }
};
export {
  serverManifest as assets,
  assetsBuildDirectory,
  basename,
  entry,
  future,
  isSpaMode,
  mode,
  publicPath,
  routes
};
