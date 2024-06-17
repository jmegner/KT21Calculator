import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import {Props as IncProps, propsToRows} from 'src/components/IncDecSelect';
import Model from 'src/Model';
import Ability, {rerollAbilities as rerolls} from 'src/Ability';
import * as N from 'src/Notes';
import { MaxWounds, SaveRange } from 'src/KtMisc';
import {
  Accepter,
  boolToCheckX,
  incDecPropsHasNondefaultSelectedValue,
  makeNumChangeHandler,
  makeSetChangeHandlerForSingle,
  makeTextChangeHandler,
  preX,
  span,
  withPlus,
  xAndCheck,
  xrollSpan,
  xspan,
} from 'src/Util';
import { useCheckboxAndVariable } from 'src/hooks/useCheckboxAndVariable';

export interface Props {
  defender: Model;
  changeHandler: Accepter<Model>;
}


const DefenderControls: React.FC<Props> = (props: Props) => {
  const def = props.defender;
  const textHandler = makeTextChangeHandler(props.defender, props.changeHandler);
  const numHandler = makeNumChangeHandler(props.defender, props.changeHandler);
  const [advancedCheckbox, wantShowAdvanced] = useCheckboxAndVariable('Advanced');

  function singleHandler(ability: Ability) {
    return makeSetChangeHandlerForSingle<Model,Ability>(
      def,
      props.changeHandler,
      'abilities',
      ability,
    );
  }

  function toYN(ability: Ability) {
    return boolToCheckX(def.has(ability));
  }

  const basicParams: IncProps[] = [
    //           id,               selectedValue,            values,           valueChangeHandler
    new IncProps('Defense',        def.numDice,              span(0, 4),       numHandler('numDice')),
    new IncProps('Save',           def.diceStat + '+',       withPlus(SaveRange), numHandler('diceStat')),
    new IncProps('Wounds',         def.wounds,               span(1, MaxWounds),      numHandler('wounds')),
    new IncProps(N.InvulnSave,     def.invulnSave + '+',     xrollSpan,        numHandler('invulnSave')),
    new IncProps(N.CoverNormSaves, def.autoNorms,            xspan(1, 9),      numHandler('autoNorms')),
  ];
  const advancedParams: IncProps[] = [
    new IncProps(N.CoverCritSaves, def.autoCrits,            xspan(1, 9),      numHandler('autoCrits')),
    new IncProps(N.NormsToCrits,   def.normsToCrits,         xspan(1, 9),      numHandler('normsToCrits')),
    new IncProps(N.FailsToNorms,   def.failsToNorms,         xspan(1, 9),      numHandler('failsToNorms')),
    new IncProps(N.FailToNormIfCrit, toYN(Ability.FailToNormIfCrit), xAndCheck, singleHandler(Ability.FailToNormIfCrit)),
    new IncProps(N.HardyX,         def.hardyx + '+',         xspan(5, 2, '+'), numHandler('hardyx')),
    new IncProps(N.FeelNoPain,     def.fnp + '+',            xspan(6, 2, '+'), numHandler('fnp')),
    new IncProps(N.Reroll,         def.reroll,               preX(rerolls),    textHandler('reroll')),
    new IncProps(N.JustAScratch,   toYN(Ability.JustAScratch), xAndCheck,      singleHandler(Ability.JustAScratch)),
  ];

  // we actually have 1 column when rendered, and order gets weird if we pretend we have 2
  const usedAdvancedParams = advancedParams.filter(p => incDecPropsHasNondefaultSelectedValue(p));
  const advancedParamsToShow = wantShowAdvanced ? advancedParams : usedAdvancedParams;
  const paramsToShow = basicParams.concat(advancedParamsToShow);
  const elemsCol0 = propsToRows(paramsToShow);
  return (
    // it would be nice to make this something other than a fixed width
    <Container style={{width: '130px'}}>
      <Row>
        <Col>Defender</Col>
        <Col>{advancedCheckbox}</Col>
      </Row>
      <Row>
        <Col>
          <Container className='p-0' style={{width: 'fit-content'}}>
            {elemsCol0}
          </Container>
        </Col>
      </Row>
    </Container>
  );
};

export default DefenderControls;