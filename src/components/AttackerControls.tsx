import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import IncDecSelect, {Props as IncProps} from 'src/components/IncDecSelect';
import * as Util from 'src/Util';
import { boolToCheckX as boolToCheckX } from 'src/Util';
import Attacker from 'src/Attacker';
import Ability, {rerollAbilities as rerolls} from 'src/Ability';
import * as N from 'src/Notes';
import NoCoverType from 'src/NoCoverType';


export interface Props {
  attacker: Attacker;
  changeHandler: Util.Accepter<Attacker>;
}

const AttackerControls: React.FC<Props> = (props: Props) => {
  const atk = props.attacker;
  const [textHandler, numHandler, boolHandler]
    = Util.makePropChangeHandlers(atk, props.changeHandler);
  const noCoverChoices = Object.values(NoCoverType);

  function singleHandler(ability: Ability) {
    return Util.makeSetChangeHandlerForSingle<Attacker,Ability>(
      atk,
      props.changeHandler,
      'abilities',
      ability,
    );
  }

  function toYN(ability: Ability) {
    return boolToCheckX(atk.has(ability));
  }

  const params: IncProps[] = [
    //           id/label,       selectedValue,          values,                valueChangeHandler
    new IncProps('Attacks',      atk.attacks,            Util.span(1, 9),      numHandler('attacks')),
    new IncProps('BS',           atk.bs + '+',           Util.rollSpan,         numHandler('bs')),
    new IncProps('Normal Dmg',   atk.normDmg,            Util.span(0, 9),       numHandler('normDmg')),
    new IncProps('Crit Dmg',     atk.critDmg,            Util.span(0, 10),      numHandler('critDmg')),
    new IncProps('MWx',          atk.mwx,                Util.xspan(1, 9),      numHandler('mwx')),
    new IncProps('Lethal',       atk.lethal + '+',       Util.xspan(5, 2, '+'), numHandler('lethal')),
    new IncProps(N.Reroll,       atk.reroll,             Util.preX(rerolls),    textHandler('reroll')),
    // 2nd column
    new IncProps('APx',          atk.apx,                Util.xspan(1, 4),      numHandler('apx')),
    new IncProps('Px',           atk.px,                 Util.xspan(1, 4),      numHandler('px')),
    new IncProps(N.Rending,      toYN(Ability.Rending),  Util.xAndCheck,        singleHandler(Ability.Rending)),
    new IncProps(N.Starfire,     toYN(Ability.FailToNormIfCrit),  Util.xAndCheck, singleHandler(Ability.FailToNormIfCrit)),
    new IncProps(N.AutoNormHits, atk.autoNormHits,       Util.xspan(1, 9),      numHandler('autoNormHits')),
    //new IncProps(N.NoCover,      atk.noCover,            noCoverChoices,        textHandler('noCover')),
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