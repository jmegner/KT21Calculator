import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import _ from 'lodash';

import IncDecSelect from './IncDecSelect';

interface Props {
}

function makeNumberOptions(
  inclusiveStart: number,
  inclusiveEnd: number,
  suffix?: string)
{
  return _.range(1, 9).map(x => {
    return <option value={x}>{x}{suffix ?? ''}</option>
  });
}


const AttackControls: React.FC<Props> = (props: Props) => {
  const [attacks, setAttacks] = React.useState(4);
  const [bs, setBs] = React.useState(3);
  const [normalDamage, setNormalDamage] = React.useState(3);
  const [criticalDamage, setCriticalDamage] = React.useState(4);
  const [mwx, setMwx] = React.useState(0);

  const centerClasses = 'd-flex justify-content-center align-items-center';
  const attacksId = 'Attacks';
  const bsId = 'BS';
  const normalDamageId = 'Normal Damage';
  const criticalDamageId = 'Critical Damage';
  const mwxId = 'MWx';

  function makeStringAccepter(setter: (val: number) => void) : (text: string) => void {
    return (text: string) => setter(parseInt(text));
  }

  // TODO: array/whtaever of {id, min, max, setter} so we can put the <Row><Col><IncDecSelect/></Col></Row> in a loop
  //const stuff: any[][];

  return (
    <Container style={{width: '300px'}}>
      <Row>
        <Col>
          <IncDecSelect id={attacksId} min={1} max={8} valueChangeHandler={makeStringAccepter(setAttacks)} />
        </Col>
      </Row>
      <Row>
        <Col>
          <IncDecSelect id={bsId} min={2} max={6} suffix='+' valueChangeHandler={makeStringAccepter(setBs)} />
        </Col>
      </Row>
      <Row>
        <Col>
          <IncDecSelect id={normalDamageId} min={1} max={9} valueChangeHandler={makeStringAccepter(setNormalDamage)} />
        </Col>
      </Row>
      <Row>
        <Col>
          <IncDecSelect id={criticalDamageId} min={1} max={9} valueChangeHandler={makeStringAccepter(setCriticalDamage)} />
        </Col>
      </Row>
    </Container>
  );
}

export default AttackControls;