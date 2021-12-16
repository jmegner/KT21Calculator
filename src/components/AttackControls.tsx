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
  const thickX = '✖';
  const thickCheck = '✔';

  const [attacks, setAttacks] = React.useState(4);
  const [bs, setBs] = React.useState(3);
  const [normalDamage, setNormalDamage] = React.useState(3);
  const [criticalDamage, setCriticalDamage] = React.useState(4);
  const [mwx, setMwx] = React.useState(0);
  const [apx, setApx] = React.useState(0);
  const [px, setPx] = React.useState(0);
  const [reroll, setReroll] = React.useState(thickX);
  const [lethalx, setLethalx] = React.useState(0);
  const [rending, setRending] = React.useState(false);
  const rerollTypes = ['Ceaseless', 'Balanced', 'Relentless'];

  const centerClasses = 'd-flex justify-content-center align-items-center';
  const attacksId = 'Attacks';
  const bsId = 'BS';
  const normalDamageId = 'Normal Damage';
  const criticalDamageId = 'Critical Damage';
  const mwxId = 'MWx';
  const apxId = 'APx';
  const pxId = 'Px';
  const rerollId = 'Reroll';
  const lethalxId = 'Lethal';
  const rendingId = 'Rending';

  function fromNumAccepter(setter: (val: number) => void) : (text: string) => void {
    return function stringAccepter(text: string): void {
      const intAttempt = parseInt(text);
      setter(isNaN(intAttempt) ? 0 : intAttempt);
    }
  }

  function fromBoolAccepter(setter: (val: boolean) => void) : (text: string) => void {
    return function stringAccepter(text: string): void {
      setter(text === thickCheck);
    }
  }

  const boolToCheckX = (val: boolean) => val ? thickCheck : thickX;

  function span(min: number, max: number, suffix?: string) {
    return _.range(min, max + 1).map(x => x.toString() + (suffix ? suffix : ''));
  }

  function xspan(min: number, max: number, suffix?: string) {
    return _.concat([thickX], span(min, max, suffix));
  }

  const rollSpan = span(2, 6, '+');
  const xAndCheck = [thickX, thickCheck];

  const params: [string, number | string, string[], (x: string) => void][] = [
    // id, selectedValue, values, suffix, valueChangeHandler
    [attacksId, attacks, span(1, 8), fromNumAccepter(setAttacks)],
    [bsId, bs + '+', rollSpan, fromNumAccepter(setBs)],
    [normalDamageId, normalDamage, span(1, 9), fromNumAccepter(setNormalDamage)],
    [criticalDamageId, criticalDamage, span(1, 9), fromNumAccepter(setCriticalDamage)],
    [mwxId, mwx, xspan(1, 4), fromNumAccepter(setMwx)],
    [apxId, apx, xspan(1, 3), fromNumAccepter(setApx)],
    [pxId, px, xspan(1, 3), fromNumAccepter(setPx)],
    [rerollId, reroll, _.concat([thickX], rerollTypes), setReroll],
    [lethalxId, lethalx + '+', xspan(5, 5, '+'), fromNumAccepter(setLethalx)],
    [rendingId, boolToCheckX(rending), xAndCheck, fromBoolAccepter(setRending)],
  ];

  const paramElems = params.map(p => <Row key={p[0]}><Col className='pr-0'><IncDecSelect
     id={p[0]}
     selectedValue={p[1]}
     values={p[2]}
     valueChangeHandler={p[3]}
     /></Col></Row>);

  return (
    <Container style={{width: '320px'}}>
      <Row>Attacker</Row>
      <Row>
        <Col>
          <Container className='p-0'>
            {paramElems.slice(0, paramElems.length / 2)}
          </Container>
        </Col>
        <Col>
          <Container className='p-0'>
            {paramElems.slice(paramElems.length / 2)}
          </Container>
        </Col>
      </Row>
    </Container>
  );
}

export default AttackControls;