import React from 'react';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import * as Util from 'src/Util';

export interface IProps {
  id: string;
  label?: string;
  values: string[];
  selectedValue: number | string;
  valueChangeHandler: Util.Accepter<string>;
}

export class Props implements IProps {
  public id: string;
  public selectedValue: number | string;
  public values: string[];
  public valueChangeHandler: Util.Accepter<string>;

  constructor(
    id: string,
    selectedValue: string | number,
    values: string[] | number[],
    valueChangeHandler: Util.Accepter<string>,
  ) {
    this.id = id;
    this.values = values.map((val: any) => val.toString()) as string[];
    this.selectedValue = selectedValue.toString();
    this.valueChangeHandler = valueChangeHandler;
  }
}

const IncDecSelect: React.FC<IProps> = (props: IProps) => {
  let selectedText = props.selectedValue.toString();
  const options = props.values.map(x => <option key={x} value={x}>{x}</option>);

  function handleIncDec(delta: number) {
    const newIdx = Math.max(0, props.values.indexOf(selectedText)) + delta;
    if(newIdx >= 0 && newIdx < options.length) {
      props.valueChangeHandler(props.values[newIdx]);
    }
  }

  function handleUserSelect(event: React.ChangeEvent<HTMLSelectElement>) {
    props.valueChangeHandler(event.target.value);
  }

  return (
    <div>
      <label
        htmlFor={props.id}
        style={{ fontSize: '11px', display: 'inline', verticalAlign: 'middle' }}
      >
        {props.label ?? props.id}
      </label>
      <InputGroup className='mb-1'>
        <Button variant='danger' onClick={() => handleIncDec(-1)}>-</Button>
        <select
          name={props.id}
          id={props.id}
          value={selectedText}
          onChange={handleUserSelect}
          style={{maxWidth: '70px'}}
        >
          {options}
        </select>
        <Button variant='danger' onClick={() => handleIncDec(1)}>+</Button>
      </InputGroup>
    </div>
  );
}

export default IncDecSelect;