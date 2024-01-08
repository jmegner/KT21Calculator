import React from "react";
import { Form } from "react-bootstrap";

export function useCheckboxAndVariable(
  label: string,
  initialCheckedState: boolean = false,
) : [JSX.Element, boolean]
{
  const [checked, setChecked] = React.useState(initialCheckedState);
  return [
    <Form.Check
      label={label}
      checked={checked}
      onChange={() => setChecked(!checked)}
    />,
    checked,
  ];
}