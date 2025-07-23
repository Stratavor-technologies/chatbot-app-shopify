import { Toast, Frame } from '@shopify/polaris';

function ToastMessage(props) {
return (
    <Frame>
      <Toast content={props.message} onDismiss={props.toggle} />
    </Frame>
  );
}

export default ToastMessage;