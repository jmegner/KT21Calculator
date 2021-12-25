import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import IncDecSelect, {Props as IncProps} from './IncDecSelect';
import * as Util from '../Util';
import Attacker from '../Attacker';


export interface Props {
  attacker: Attacker;
  changeHandler: Util.Accepter<Attacker>;
}

const AttackerControls: React.FC<Props> = (props: Props) => {
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

  const atker = props.attacker;
  const [textHandler, numHandler, boolHandler]
    = Util.makePropChangeHandlers(atker, props.changeHandler);

  const params: IncProps[] = [
    //           id/label,         selectedValue,                    values,                 valueChangeHandler
    new IncProps(attacksId,        atker.attacks,                    Util.span(1, 8),        numHandler('attacks')),
    new IncProps(bsId,             atker.bs + '+',                   Util.rollSpan,          numHandler('bs')),
    new IncProps(normalDamageId,   atker.normalDamage,               Util.span(1, 9),        numHandler('normalDamage')),
    new IncProps(criticalDamageId, atker.criticalDamage,             Util.span(1, 9),        numHandler('criticalDamage')),
    new IncProps(mwxId,            atker.mwx,                        Util.xspan(1, 4),       numHandler('mwx')),
    new IncProps(apxId,            atker.apx,                        Util.xspan(1, 3),       numHandler('apx')),
    new IncProps(pxId,             atker.px,                         Util.xspan(1, 3),       numHandler('px')),
    new IncProps(rerollId,         atker.reroll,                     Util.preX(rerollTypes), textHandler('reroll')),
    new IncProps(lethalxId,        atker.lethalx + '+',              Util.xspan(5, 5, '+'),  textHandler('lethalx')),
    new IncProps(rendingId,        Util.boolToCheckX(atker.rending), Util.xAndCheck,         boolHandler('rending')),
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