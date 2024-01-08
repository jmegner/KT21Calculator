import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import IncDecSelect, {Props as IncProps, propsToRows} from 'src/components/IncDecSelect';
import Model from 'src/Model';
import Ability, {rerollAbilities as rerolls} from 'src/Ability';
import * as N from 'src/Notes';
import { SaveRange } from 'src/KtMisc';
import {
  Accepter,
  boolToCheckX,
  makePropChangeHandlers,
  makeSetChangeHandlerForSingle,
  preX,
  requiredAndOptionalItemsToTwoCols,
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
  const [textHandler, numHandler, /*boolHandler*/]
    = makePropChangeHandlers(def, props.changeHandler);
  //const [wantShowAdvanced, setWantShowAdvanced] = React.useState(false);
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
    new IncProps('Wounds',         def.wounds,               span(1, 20),      numHandler('wounds')),
    new IncProps(N.InvulnSave,     def.invulnSave + '+',     xrollSpan,        numHandler('invulnSave')),
    new IncProps(N.CoverNormSaves, def.autoNorms,            xspan(1, 4),      numHandler('autoNorms')),
  ];
  const advancedParams: IncProps[] = [
    new IncProps(N.CoverCritSaves, def.autoCrits,            xspan(1, 4),      numHandler('autoCrits')),
    new IncProps(N.NormsToCrits,   def.normsToCrits,         xspan(1, 4),      numHandler('normsToCrits')),
    new IncProps(N.FailToNormIfCrit, toYN(Ability.FailToNormIfCrit), xAndCheck, singleHandler(Ability.FailToNormIfCrit)),
    new IncProps(N.HardyX,         def.hardyx + '+',         xspan(5, 2, '+'), numHandler('hardyx')),
    new IncProps(N.FeelNoPain,     def.fnp + '+',            xspan(6, 2, '+'), numHandler('fnp')),
    new IncProps(N.Reroll,         def.reroll,               preX(rerolls),    textHandler('reroll')),
    new IncProps(N.JustAScratch,   toYN(Ability.JustAScratch), xAndCheck,      singleHandler(Ability.JustAScratch)),
  ];

  const [paramsCol0, paramsCol1] = requiredAndOptionalItemsToTwoCols(
    basicParams, advancedParams, wantShowAdvanced);

  const elemsCol0 = propsToRows(paramsCol0);
  const elemsCol1 = propsToRows(paramsCol1);

  return (
    // TODO: change width to ~310px so it is actually 2 cols but doesn't go below attacker section
    <Container style={{width: '180px'}}>
      <Row>
        <Col>Defender</Col>
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
};

export default DefenderControls;