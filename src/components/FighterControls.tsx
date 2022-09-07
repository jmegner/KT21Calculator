
import React from 'react';
import {
  Col,
  Container,
  Row,
} from 'react-bootstrap';

import IncDecSelect, {Props as IncProps} from 'src/components/IncDecSelect';
import * as Util from 'src/Util';
import {
  Accepter,
  boolToCheckX as toCheckX,
  makePropChangeHandlers,
  makeSetChangeHandler,
  makeSetExtractor,
  preX,
  rollSpan,
  span,
  xAndCheck,
  xspan,
} from 'src/Util';
import Attacker from 'src/Attacker';
import Ability, {
  mutuallyExclusiveFightAbilities as nicheAbilities,
  rerollAbilities as rerolls
} from 'src/Ability';
import * as N from 'src/Notes';


export interface Props {
  title: string;
  attacker: Attacker;
  changeHandler: Accepter<Attacker>;
}

const FighterControls: React.FC<Props> = (props: Props) => {
  const atk = props.attacker;
  const [textHandler, numHandler, boolHandler]
    = makePropChangeHandlers(atk, props.changeHandler);
  const abilitySetHandler = makeSetChangeHandler<Attacker,Ability>(
    atk,
    props.changeHandler,
    'abilities',
    nicheAbilities,
  );
  const abilityExtractor = makeSetExtractor(nicheAbilities, Ability.None);
  const ability = abilityExtractor(atk.abilities)!;

  const params: IncProps[] = [
    //           id/label,          selectedValue,      values,           valueChangeHandler
    new IncProps('Attacks',      atk.attacks,           span(1, 8),       numHandler('attacks')),
    new IncProps('WS',           atk.bs + '+',          rollSpan,         numHandler('bs')),
    new IncProps('Normal Dmg',   atk.normDmg,           span(1, 9),       numHandler('normDmg')),
    new IncProps('Critical Dmg', atk.critDmg,           span(1, 9),       numHandler('critDmg')),
    new IncProps('LethalX',      atk.lethalx + '+',     xspan(4, 5, '+'), numHandler('lethalx')),
    new IncProps(N.Reroll,       atk.reroll,            preX(rerolls),    textHandler('reroll')),
    // 2nd col
    new IncProps('Wounds',       atk.wounds,            span(1, 19),      numHandler('wounds')),
    new IncProps(N.Rending,      toCheckX(atk.rending), xAndCheck,        boolHandler('rending')),
    new IncProps(N.Brutal,       toCheckX(atk.brutal),  xAndCheck,        boolHandler('brutal')),
    new IncProps(N.StunMelee,    toCheckX(atk.stun),    xAndCheck,        boolHandler('stun')),
    new IncProps(N.NicheAbility, ability,               nicheAbilities,   abilitySetHandler('abilities')),
  ];

  const paramElems = params.map(p =>
    <Row key={p.id}><Col className='pr-0'><IncDecSelect {...p}/></Col></Row>);
  const splitPoint = (paramElems.length + 1) / 2;
  const paramElemsHalf1 = paramElems.slice(0, splitPoint);
  const paramElemsHalf2 = paramElems.slice(splitPoint);

  return (
    <Container style={{width: '310px'}}>
      <Row>{props.title}</Row>
      <Row>
        <Col>
          <Container className='p-0'>
            {paramElemsHalf1}
          </Container>
        </Col>
        <Col>
          <Container className='p-0'>
            {paramElemsHalf2}
          </Container>
        </Col>
      </Row>
    </Container>
  );
}

export default FighterControls;