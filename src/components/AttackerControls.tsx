import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import {Props as IncProps, propsToRows} from 'src/components/IncDecSelect';
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
import Model from 'src/Model';
import Ability, {
  eliteAbilities,
  rerollAbilities as rerolls
} from 'src/Ability';
import * as N from 'src/Notes';
import { useCheckboxAndVariable } from 'src/hooks/useCheckboxAndVariable';


export interface Props {
  attacker: Model;
  changeHandler: Accepter<Model>;
}

const AttackerControls: React.FC<Props> = (props: Props) => {
  const atk = props.attacker;
  const textHandler = makeTextChangeHandler(atk, props.changeHandler);
  const numHandler = makeNumChangeHandler(atk, props.changeHandler);
  const [advancedCheckbox, wantShowAdvanced] = useCheckboxAndVariable('Advanced');
  //const noCoverChoices = Object.values(NoCoverType);

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

  const eliteAbility = extractFromSet(eliteAbilities, Ability.None, atk.abilities)!;

  const basicParams: IncProps[] = [
    //           id/label,       selectedValue,         values,                valueChangeHandler
    new IncProps('Attacks',      atk.numDice,           span(1, 9),       numHandler('numDice')),
    new IncProps('BS',           atk.diceStat + '+',    rollSpan,         numHandler('diceStat')),
    new IncProps('Normal Dmg',   atk.normDmg,           span(0, 9),       numHandler('normDmg')),
    new IncProps('Crit Dmg',     atk.critDmg,           span(0, 10),      numHandler('critDmg')),
    new IncProps('MWx',          atk.mwx,               xspan(1, 9),      numHandler('mwx')),
    new IncProps('APx',          atk.apx,               xspan(1, 4),      numHandler('apx')),
    new IncProps('Px',           atk.px,                xspan(1, 4),      numHandler('px')),
    new IncProps(N.Reroll,       atk.reroll,            preX(rerolls),    textHandler('reroll')),
    new IncProps(N.Rending,      toYN(Ability.Rending), xAndCheck,        singleHandler(Ability.Rending)),
    new IncProps('Lethal',       atk.lethal + '+',      xspan(5, 2, '+'), numHandler('lethal')),
  ];
  const advancedParams: IncProps[] = [
    new IncProps(N.AutoNorms,    atk.autoNorms,         xspan(1, 9),      numHandler('autoNorms')),
    new IncProps(N.AutoCrits,    atk.autoCrits,         xspan(1, 9),      numHandler('autoCrits')),
    new IncProps(N.FailsToNorms, atk.failsToNorms,      xspan(1, 9),      numHandler('failsToNorms')),
    new IncProps(N.NormsToCrits, atk.normsToCrits,      xspan(1, 9),      numHandler('normsToCrits')),
    new IncProps(N.FailToNormIfCrit, toYN(Ability.FailToNormIfCrit),            xAndCheck, singleHandler(Ability.FailToNormIfCrit)),
    new IncProps('ElitePoints*', eliteAbility,          eliteAbilities,   subsetHandler(eliteAbilities)),
    new IncProps(N.CloseAssault, toYN(Ability.FailToNormIfAtLeastTwoSuccesses), xAndCheck, singleHandler(Ability.FailToNormIfAtLeastTwoSuccesses)),
    //new IncProps(N.NoCover,      atk.noCover,            noCoverChoices,        textHandler('noCover')),
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
        <Col>Attacker</Col>
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

export default AttackerControls;