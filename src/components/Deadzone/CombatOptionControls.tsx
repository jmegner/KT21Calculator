import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import IncDecSelect, {Props as IncProps} from 'src/components/IncDecSelect';
import { CombatOptions } from 'src/Deadzone/CombatOptions';
import {
  Accepter,
  makePropChangeHandlers,
  span,
  xAndCheck,
  boolToCheckX,
  makeIncDecPropsFromLookup,
} from 'src/Util';

export interface Props {
  combatOptions: CombatOptions;
  changeHandler: Accepter<CombatOptions>;
}

const CombatOptionControls: React.FC<Props> = (props: Props) => {
  const opts = props.combatOptions;
  // eslint-disable-next-line
  const [textHandler, numHandler, boolHandler]
    = makePropChangeHandlers(opts, props.changeHandler);

  const simCountToDisplayTexts = new Map<number,string>([
    [1, '1'],
    [1e2, '100'],
    [1e3, '1K'],
    [1e4, '10K recommended'],
    [1e5, '100K pretty accurate'],
    [1e6, '1M excessive'],
  ]);
  const simCountIncProps = makeIncDecPropsFromLookup('Num Simulations', opts, props.changeHandler, 'numSimulations', simCountToDisplayTexts);

  const fightBackVal = boolToCheckX(opts.attackerCanBeDamaged);

  const params: IncProps[] = [
    //           id,              selectedValue,          values,      valueChangeHandler
    new IncProps('FightBack?',    fightBackVal,           xAndCheck,   boolHandler('attackerCanBeDamaged')),
    //new IncProps('Simulations',   opts.numSimulations,    simsChoices, numHandler('numSimulations')),
    simCountIncProps,
    new IncProps('Rounds',        opts.numRounds,         span(1, 9),  numHandler('numRounds')),
  ];

  const paramElems = params.map(p =>
    <Row key={p.id}><Col className='pr-0'><IncDecSelect {...p}/></Col></Row>);

  return (
    <Container style={{width: '320px'}}>
      <Row>General</Row>
      <Row>
        <Col>
          <Container className='p-0'>
            {paramElems}
          </Container>
        </Col>
      </Row>
    </Container>
  );
}

export default CombatOptionControls;