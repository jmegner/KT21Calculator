import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import _ from 'lodash';

import IncDecSelect from './IncDecSelect';
import Util from '../Util';

interface Props {
}

const AttackerControls: React.FC<Props> = (props: Props) => {
  const [attacks, setAttacks] = React.useState(4);
  const [bs, setBs] = React.useState(3);
  const [normalDamage, setNormalDamage] = React.useState(3);
  const [criticalDamage, setCriticalDamage] = React.useState(4);
  const [mwx, setMwx] = React.useState(0);
  const [apx, setApx] = React.useState(0);
  const [px, setPx] = React.useState(0);
  const [reroll, setReroll] = React.useState(Util.thickX);
  const [lethalx, setLethalx] = React.useState(0);
  const [rending, setRending] = React.useState(false);
  const rerollTypes = ['Ceaseless', 'Balanced', 'Relentless'];

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

  const fromNum = Util.acceptNumToAcceptString;
  const fromBool = Util.acceptBoolToAcceptString;

  const params: [string, number | string, string[], (x: string) => void][] = [
    // id, selectedValue, values, suffix, valueChangeHandler
    [attacksId, attacks, Util.span(1, 8), fromNum(setAttacks)],
    [bsId, bs + '+', Util.rollSpan, fromNum(setBs)],
    [normalDamageId, normalDamage, Util.span(1, 9), fromNum(setNormalDamage)],
    [criticalDamageId, criticalDamage, Util.span(1, 9), fromNum(setCriticalDamage)],
    [mwxId, mwx, Util.xspan(1, 4), fromNum(setMwx)],
    [apxId, apx, Util.xspan(1, 3), fromNum(setApx)],
    [pxId, px, Util.xspan(1, 3), fromNum(setPx)],
    [rerollId, reroll, _.concat([Util.thickX], rerollTypes), setReroll],
    [lethalxId, lethalx + '+', Util.xspan(5, 5, '+'), fromNum(setLethalx)],
    [rendingId, Util.boolToCheckX(rending), Util.xAndCheck, fromBool(setRending)],
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

export default AttackerControls;