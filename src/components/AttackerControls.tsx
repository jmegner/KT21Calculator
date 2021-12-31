import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import IncDecSelect, {Props as IncProps} from './IncDecSelect';
import * as Util from '../Util';
import { boolToCheckX as toCheckX } from '../Util';
import Attacker from '../Attacker';
import Ability from '../Ability';


export interface Props {
  attacker: Attacker;
  changeHandler: Util.Accepter<Attacker>;
}

const AttackerControls: React.FC<Props> = (props: Props) => {
  const rerollTypes = [Ability.Ceaseless, Ability.Balanced, Ability.Relentless];

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
  const starfireId = 'Starfire Core';

  const atk = props.attacker;
  const [textHandler, numHandler, boolHandler]
    = Util.makePropChangeHandlers(atk, props.changeHandler);

  const params: IncProps[] = [
    //           id/label,         selectedValue,            values,                 valueChangeHandler
    new IncProps(attacksId,        atk.attacks,            Util.span(1, 8),        numHandler('attacks')),
    new IncProps(bsId,             atk.bs + '+',           Util.rollSpan,          numHandler('bs')),
    new IncProps(normalDamageId,   atk.normalDamage,       Util.span(1, 9),        numHandler('normalDamage')),
    new IncProps(criticalDamageId, atk.criticalDamage,     Util.span(1, 9),        numHandler('criticalDamage')),
    new IncProps(mwxId,            atk.mwx,                Util.xspan(1, 4),       numHandler('mwx')),
    new IncProps(apxId,            atk.apx,                Util.xspan(1, 3),       numHandler('apx')),
    new IncProps(pxId,             atk.px,                 Util.xspan(1, 3),       numHandler('px')),
    new IncProps(rerollId,         atk.reroll,             Util.preX(rerollTypes), textHandler('reroll')),
    new IncProps(lethalxId,        atk.lethalx + '+',      Util.xspan(5, 5, '+'),  textHandler('lethalx')),
    new IncProps(rendingId,        toCheckX(atk.rending),  Util.xAndCheck,         boolHandler('rending')),
    new IncProps(starfireId,       toCheckX(atk.starfire), Util.xAndCheck,         boolHandler('starfire')),
  ];

  const paramElems = params.map(p =>
    <Row key={p.id}><Col className='pr-0'><IncDecSelect {...p}/></Col></Row>);

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