import {DropZone, LegacyStack, Thumbnail, Text, Card, LegacyCard, BlockStack, Page, DataTable, Button} from '@shopify/polaris';
import {NoteIcon} from '@shopify/polaris-icons';
import {useState, useCallback, useEffect} from 'react';
import axios from 'axios';
import variables from './variables';
import { useAppBridge } from '@shopify/app-bridge-react';
import ChatBotLoader from '../components/loader';
import ToastMessage from '../components/toastMessage';

export default function fine_tune( request ) {
  const [file, setFile] = useState(null);
  const [fileUploads, setFileUploads] = useState([]);
  const [isFileUploaded, setIsFileUploaded] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const appBridge = useAppBridge();
  
  const toggleActiveMessage = useCallback(() => setIsFileUploaded((isFileUploaded) => !isFileUploaded), []);
  
  const handleDropZoneDrop = useCallback((acceptedFiles) => {
    console.log("isFileUploaded1: ", isFileUploaded);
    setFile(acceptedFiles[0]);
    
      var store_id = appBridge.config.shop;
      const formData = new FormData();
      formData.append('storeId', `${store_id}`);
      formData.append('training_csv', acceptedFiles[0]);

      axios.post(`${variables.API_URL}/training/upload-csv` , formData, { params: {store_id}},  {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }).
      then(response => {
        console.log(response.data);

        // setIsFileUploaded(true);

        toggleActiveMessage();
        // console.log("isFileUploaded on sucess: ", isFileUploaded);

        get_uploaded_csvs();

        setSuccessMessage("File uplaoded!");

        setTimeout(function() {
          setFile();
        }, 1500); 
       

      }).catch(error => {
        console.log(error);
      });

      console.log("isFileUploaded2: ", isFileUploaded);
  }, []);

  // const validFileTypes = ['file/csv'];

  const fileUpload = !file && <DropZone.FileUpload />;
  const uploadedFile = file && (
    <LegacyStack>
      <Thumbnail
        size="small"
        alt={file.name}
        source={
          NoteIcon
        }
      />
      <div>
        {file.name}{' '}
        <Text variant="bodySm" as="p">
          {file.size} bytes
        </Text>
      </div>
    </LegacyStack>
  );

  // const cancelFineTiningJob = (tune_id, store_id) => {
  //     setIsLoading(true);
  //     axios.post(`${variables.API_URL}/training/delete`, {
  //       "tune_id": tune_id
  //     },
  //     { params: {store_id}}
  //     ).
  //     then(response => {
  //       console.log(response.data);
        
  //       toggleActiveMessage();
  //       setSuccessMessage(response.data.message);
  //       setIsLoading(false);
  //     }).catch(error => {

  //       toggleActiveMessage();
  //       setSuccessMessage(error.message);
  //       setIsLoading(false);
  //       console.log(error);
  //     });
  // }

  const deleteFineTuning = (tune_id) => {
    setIsLoading(true);
    axios.delete(`${variables.API_URL}/trainings/delete/${tune_id}`, { params: { store_id: appBridge.config.shop }

      }).then(response => {
        
        if(response.data.success === true){
            toggleActiveMessage();
            setSuccessMessage(response.data.message);

            setIsLoading(false);
            get_uploaded_csvs();
        }

      }).catch(err => {
        console.log(err);
      })
  }

  const get_uploaded_csvs = async () => {
      var appBridge = useAppBridge();
      var store_id = appBridge.config.shop;

      await axios.get(`${variables.API_URL}/trainings`, {
        params: {
          store_id: store_id
        }
      })
      .then(response => {
        var uploads = [];
        var count = 0;

        if(response.data.success === true){
          response.data.data.map(item => {
            count++;
            var trainingDateObj = new Date(item.createdAt);
            var trainingDate = `${trainingDateObj.getFullYear()}-${trainingDateObj.getMonth()}-${trainingDateObj.getDate()} ${trainingDateObj.getHours()}:${trainingDateObj.getMinutes()}`;
            // let cancelJob = (item.fine_tune_status != "succeeded" && item.fine_tune_status != "cancelled") ? <Button onClick={ () => cancelFineTiningJob(item.tune_id, store_id)}>Cancel Job</Button> : "";
            let cancelJob = <Button onClick={ () => deleteFineTuning(item._id)}>Delete</Button>;

            uploads.push([count, item.csvfilename, trainingDate, <><Button url={item.csvfilepath}>Download</Button> {cancelJob}</>]);
          });

        }
        
        setIsLoading(false);
        setFileUploads(uploads);
        
      }).catch(err => {
        console.log(err);
      });
  }

  // useEffect(() => {
  //   // console.log("isLoading: ", isLoading);
  //   // console.log("FileUploads: ", fileUploads);
  //   get_uploaded_csvs();
  //   // setIsLoading(false);
  //   console.log("isLoading: ", isLoading);
  //   // console.log("fileUploads:" ,fileUploads);
  // }, []);

  useEffect(() => {
      get_uploaded_csvs();
  }, []);

  console.log("isFileUploaded3: ", isFileUploaded);

  return (
    <>
    <Page>
      {
        isLoading ? <ChatBotLoader /> : ""
      }
      <BlockStack gap="200">
        <Card>
          <BlockStack gap="200">
            <Text variant="headingMd" as="h2">Upload CSV</Text>
            <DropZone allowMultiple={false} onDrop={handleDropZoneDrop}>
              {uploadedFile}
              {fileUpload}
            </DropZone>
          </BlockStack>
        </Card>

        <Card>
          <BlockStack gap="200">
            <Text variant="headingMd" as="h2">Uploaded CSV</Text>
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
                  'Sr no.',
                  'Filename',
                  'Date',
                  // 'Progress',
                  'Actions'
                ]}
                rows={fileUploads}
                // totals={['', '', '', 255, '$155,830.00']}
              />
        </LegacyCard>
          </BlockStack>
        </Card>
      </BlockStack>
      {
        isFileUploaded ? <ToastMessage message={successMessage} toggle={toggleActiveMessage}/> : ""
      }
    </Page>
    </>
  );
}