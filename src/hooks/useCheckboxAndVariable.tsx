import React from "react";
import { Form } from "react-bootstrap";

export function useCheckboxAndVariable(
  label: string,
  initialCheckedState: boolean = false,
  controlled?: [boolean, (checked: boolean) => void],
) : [JSX.Element, boolean]
{
  const internal = React.useState(initialCheckedState);
  const [checked, setChecked] = controlled ?? internal;
  return [
    <Form.Check
      label={label}
      checked={checked}
      onChange={() => setChecked(!checked)}
    />,
    checked,
  ];
}
