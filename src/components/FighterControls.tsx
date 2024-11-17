
import React from 'react';
import {
  Col,
  Container,
  Row,
} from 'react-bootstrap';

import Ability, {
  eliteAbilities,
  mutuallyExclusiveFightAbilities as nicheAbilities,
  rendingAndSevereAbilities,
  rerollAbilities as rerolls
} from 'src/Ability';
import { MaxWounds } from 'src/KtMisc';
import Model from 'src/Model';
import * as N from 'src/Notes';
import {
  Accepter,
  boolToCheckX,
  extractFromSet,
  incDecPropsHasNondefaultSelectedValue,
  makeNumChangeHandler,
  makeSetChangeHandler,
  makeSetChangeHandlerForSingle,
  makeTextChangeHandler,
  preX,
  requiredAndOptionalItemsToTwoCols,
  rollSpan,
  span,
  xAndCheck,
  xspan,
} from 'src/Util';
import { Props as IncProps, propsToRows } from 'src/components/IncDecSelect';
import { useCheckboxAndVariable } from 'src/hooks/useCheckboxAndVariable';


export interface Props {
  title: string;
  attacker: Model;
  changeHandler: Accepter<Model>;
}

const FighterControls: React.FC<Props> = (props: Props) => {
  const atk = props.attacker;
  const textHandler = makeTextChangeHandler(atk, props.changeHandler);
  const numHandler = makeNumChangeHandler(atk, props.changeHandler);
  const [advancedCheckbox, wantShowAdvanced] = useCheckboxAndVariable('Advanced');

  function subsetHandler(subset: Iterable<Ability>) {
    return makeSetChangeHandler<Model,Ability>(
      atk,
      props.changeHandler,
      'abilities',
      subset,
    );
  }
  function singleHandler(ability: Ability) {
    return makeSetChangeHandlerForSingle<Model,Ability>(
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
  const eliteAbility = extractFromSet(eliteAbilities, Ability.None, atk.abilities)!;
  const rendingSevereAbility = extractFromSet(rendingAndSevereAbilities, Ability.None, atk.abilities)!;

  const basicParams: IncProps[] = [
    //           id/label,           selectedValue,         values,           valueChangeHandler
    new IncProps('Wounds',           atk.wounds,            span(1, MaxWounds),      numHandler('wounds')),
    new IncProps('Attacks',          atk.numDice,           span(1, 8),       numHandler('numDice')),
    new IncProps('WS',               atk.diceStat + '+',    rollSpan,         numHandler('diceStat')),
    new IncProps('Normal Dmg',       atk.normDmg,           span(1, 9),       numHandler('normDmg')),
    new IncProps('Critical Dmg',     atk.critDmg,           span(1, 9),       numHandler('critDmg')),
    new IncProps(N.Reroll,           atk.reroll,            preX(rerolls),    textHandler('reroll')),
    new IncProps('Lethal',           atk.lethal + '+',      xspan(5, 2, '+'), numHandler('lethal')),
    new IncProps('Rending/Severe*', rendingSevereAbility, rendingAndSevereAbilities, subsetHandler(rendingAndSevereAbilities)),
    new IncProps(N.Brutal,           toYN(Ability.Brutal),  xAndCheck,        singleHandler(Ability.Brutal)),
    new IncProps(N.StunMelee2021,        toYN(Ability.Stun2021),    xAndCheck,        singleHandler(Ability.Stun2021)),
  ];
  const advancedParams: IncProps[] = [
    new IncProps(N.NicheAbility,     nicheAbility,               nicheAbilities, subsetHandler(nicheAbilities)),
    new IncProps(N.AutoNorms,        atk.autoNorms,              xspan(1, 9),    numHandler('autoNorms')),
    new IncProps(N.AutoCrits,        atk.autoCrits,              xspan(1, 9),    numHandler('autoCrits')),
    new IncProps(N.NormsToCrits,     atk.normsToCrits,           xspan(1, 9),    numHandler('normsToCrits')),
    new IncProps(N.FailsToNorms,     atk.failsToNorms,           xspan(1, 9),    numHandler('failsToNorms')),
    new IncProps(N.FailToNormIfCrit, toYN(Ability.FailToNormIfCrit), xAndCheck,  singleHandler(Ability.FailToNormIfCrit)),
    new IncProps('ElitePoints2021*',     eliteAbility,               eliteAbilities, subsetHandler(eliteAbilities)),
    new IncProps(N.Duelist,          toYN(Ability.Duelist),      xAndCheck,      singleHandler(Ability.Duelist)),
    new IncProps(N.JustAScratch2021,     toYN(Ability.JustAScratch), xAndCheck,      singleHandler(Ability.JustAScratch)),
    new IncProps(N.Durable2021,          toYN(Ability.Durable),      xAndCheck,      singleHandler(Ability.Durable)),
  ];

  const advancedParamsToShow
    = wantShowAdvanced
    ? advancedParams
    : advancedParams.filter(p => incDecPropsHasNondefaultSelectedValue(p));

  const [paramsCol0, paramsCol1] = requiredAndOptionalItemsToTwoCols(
    basicParams, advancedParamsToShow);
  const elemsCol0 = propsToRows(paramsCol0);
  const elemsCol1 = propsToRows(paramsCol1);

  return (
    <Container style={{width: '310px'}}>
      <Row>
        <Col>{props.title}</Col>
        <Col>{advancedCheckbox}</Col>
      </Row>
      <Row>
        <Col>
          <Container className='p-0'>
            {elemsCol0}
          </Container>
        </Col>
        <Col>
          <Container className='p-0'>
            {elemsCol1}
          </Container>
        </Col>
      </Row>
    </Container>
  );
}

export default FighterControls;