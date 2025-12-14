import { CheckCircledIcon } from "@radix-ui/react-icons";

import { Alert, type AlertProps } from "./alert";

type SuccessAlertProps = Omit<AlertProps, "variant" | "icon">;

const SuccessAlert = (props: SuccessAlertProps) => {
  return <Alert {...props} variant="success" icon={<CheckCircledIcon />} />;
};

export default SuccessAlert;
