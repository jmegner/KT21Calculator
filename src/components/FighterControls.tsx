
import React from 'react';
import {
  Col,
  Container,
  Row,
} from 'react-bootstrap';

import IncDecSelect, {Props as IncProps} from 'src/components/IncDecSelect';
import {
  Accepter,
  boolToCheckX,
  extractFromSet,
  makePropChangeHandlers,
  makeSetChangeHandler,
  makeSetChangeHandlerForSingle,
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

  function subsetHandler(subset: Iterable<Ability>) {
    return makeSetChangeHandler<Attacker,Ability>(
      atk,
      props.changeHandler,
      'abilities',
      subset,
    );
  }
  function singleHandler(ability: Ability) {
    return makeSetChangeHandlerForSingle<Attacker,Ability>(
      atk,
      props.changeHandler,
      'abilities',
      ability,
    );
  }

  function toYN(ability: Ability) {
    return boolToCheckX(atk.has(ability));
  }

  const nicheAbility = extractFromSet(nicheAbilities, Ability.None, atk.abilities)!;

  const params: IncProps[] = [
    //           id/label,           selectedValue,         values,           valueChangeHandler
    new IncProps('Attacks',          atk.attacks,           span(1, 8),       numHandler('attacks')),
    new IncProps('WS',               atk.bs + '+',          rollSpan,         numHandler('bs')),
    new IncProps('Normal Dmg',       atk.normDmg,           span(1, 9),       numHandler('normDmg')),
    new IncProps('Critical Dmg',     atk.critDmg,           span(1, 9),       numHandler('critDmg')),
    new IncProps('Lethal',           atk.lethal + '+',      xspan(5, 2, '+'), numHandler('lethal')),
    new IncProps(N.Reroll,           atk.reroll,            preX(rerolls),    textHandler('reroll')),
    // 2nd     col
    new IncProps('Wounds',           atk.wounds,            span(1, 19),      numHandler('wounds')),
    new IncProps(N.Rending,          toYN(Ability.Rending), xAndCheck,        singleHandler(Ability.Rending)),
    new IncProps(N.Brutal,           toYN(Ability.Brutal),  xAndCheck,        singleHandler(Ability.Brutal)),
    new IncProps(N.StunMelee,        toYN(Ability.Stun),    xAndCheck,        singleHandler(Ability.Stun)),
    new IncProps(N.NicheAbility,     nicheAbility,          nicheAbilities,   subsetHandler(nicheAbilities)),
    new IncProps(N.FailToNormIfCrit, toYN(Ability.FailToNormIfCrit),  xAndCheck, singleHandler(Ability.FailToNormIfCrit)),
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