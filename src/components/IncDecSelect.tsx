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
  valueChangeHandler: (newValue: string) => void,
}

const IncDecSelect: React.FC<Props> = (props: Props) => {
  const [selectedIdx, setSelectedIdx] = React.useState(0);

  if((props.min === undefined) !== (props.max === undefined)) {
    throw new Error('either use both {min, max} or use neither {min, max}');
  }
  else if((props.values === undefined) === (props.min === undefined)) {
    throw new Error('either use {min, max} or {values}, not both/neither');
  }

  const values = props.values ?? _.range(props.min!, props.max! + 1).map(x => x.toString());
  const options = values.map(x => <option value={x}>{x}{props.suffix ?? ''}</option>);
  const centerClasses = 'd-flex justify-content-center align-items-center';

  function handleIncDec(delta: number) {
    const newIdx = selectedIdx + delta;
    if(newIdx >= 0 && newIdx < options.length) {
      setSelectedIdx(newIdx);
      props.valueChangeHandler(values[selectedIdx]);
    }
  }

  function handleUserSelect(event: React.ChangeEvent<HTMLSelectElement>) {
    const newVal = event.target.value;
    setSelectedIdx(values.indexOf(newVal));
    props.valueChangeHandler(newVal);
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
        <select name={props.id} id={props.id} value={values[selectedIdx]} onChange={handleUserSelect}>
          {options}
        </select>
        <Button variant='danger' onClick={() => handleIncDec(1)}>+</Button>
      </InputGroup>
    </div>
  );
}

export default IncDecSelect;