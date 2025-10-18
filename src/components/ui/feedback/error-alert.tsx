import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

import { Alert, type AlertProps } from "./alert";

type ErrorAlertProps = Omit<AlertProps, "variant" | "icon">;

const ErrorAlert = (props: ErrorAlertProps) => {
  return (
    <Alert {...props} variant="error" icon={<ExclamationTriangleIcon />} />
  );
};

export default ErrorAlert;
