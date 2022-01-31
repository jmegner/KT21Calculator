import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import IncDecSelect, {Props as IncProps} from 'src/components/IncDecSelect';
import * as Util from 'src/Util';
import { boolToCheckX as toCheckX } from 'src/Util';
import Attacker from 'src/Attacker';
import {rerollAbilities as rerolls} from 'src/Ability';


export interface Props {
  attacker: Attacker;
  changeHandler: Util.Accepter<Attacker>;
}

const AttackerControls: React.FC<Props> = (props: Props) => {
  const atk = props.attacker;
  const [textHandler, numHandler, boolHandler]
    = Util.makePropChangeHandlers(atk, props.changeHandler);

  const params: IncProps[] = [
    //           id/label,     selectedValue,            values,              valueChangeHandler
    new IncProps('Attacks',    atk.attacks,            Util.span(1, 8),       numHandler('attacks')),
    new IncProps('BS',         atk.bs + '+',           Util.rollSpan,         numHandler('bs')),
    new IncProps('Normal Dmg', atk.normDmg,            Util.span(1, 9),       numHandler('normDmg')),
    new IncProps('Crit Dmg',   atk.critDmg,            Util.span(1, 9),       numHandler('critDmg')),
    new IncProps('MWx',        atk.mwx,                Util.xspan(1, 4),      numHandler('mwx')),
    new IncProps('APx',        atk.apx,                Util.xspan(1, 3),      numHandler('apx')),
    new IncProps('Px',         atk.px,                 Util.xspan(1, 3),      numHandler('px')),
    new IncProps('Reroll',     atk.reroll,             Util.preX(rerolls),    textHandler('reroll')),
    new IncProps('LethalX',    atk.lethalx + '+',      Util.xspan(4, 5, '+'), numHandler('lethalx')),
    new IncProps('Rending',    toCheckX(atk.rending),  Util.xAndCheck,        boolHandler('rending')),
    new IncProps('Starfire',   toCheckX(atk.starfire), Util.xAndCheck,        boolHandler('starfire')),
  ];

  const paramElems = params.map(p =>
    <Row key={p.id}><Col className='pr-0'><IncDecSelect {...p}/></Col></Row>);

  return (
    <Container style={{width: '310px'}}>
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