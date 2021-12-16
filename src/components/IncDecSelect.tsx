import React from 'react';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import _ from 'lodash';

interface Props {
  id: string,
  label?: string,
  min?: number,
  max?: number,
  suffix?: string,
  values?: string[],
  selectedValue: number | string,
  valueChangeHandler: (newValue: string) => void,
}

const IncDecSelect: React.FC<Props> = (props: Props) => {
  if((props.min === undefined) !== (props.max === undefined)) {
    throw new Error('either use both {min, max} or use neither {min, max}');
  }
  else if((props.values === undefined) === (props.min === undefined)) {
    throw new Error('either use {min, max} or {values}, not both/neither');
  }

  let selectedText = props.selectedValue.toString();
  const values = props.values ?? _.range(props.min!, props.max! + 1).map(x => x.toString());
  const options = values.map(x => <option key={x} value={x}>{x}{props.suffix ?? ''}</option>);

  function getSelectedIdx() {
    // look for prefix, not exact match so that '5' matches '5+' or whatever display-suffix was used
    for(let i = 0; i < values.length; i++) {
      if(values[i].indexOf(selectedText) === 0) {
        return i;
      }
    }

    return 0;
  }

  function handleIncDec(delta: number) {
    const newIdx = Math.max(0, values.indexOf(selectedText)) + delta;
    if(newIdx >= 0 && newIdx < options.length) {
      props.valueChangeHandler(values[newIdx]);
    }
  }

  // TODO: why does Lethal increment not work

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