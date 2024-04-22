import React from 'react';
import {
  Col,
  Container,
  Row,
} from 'react-bootstrap';

import FightOptions from 'src/FightOptions';
import FightStrategy from 'src/FightStrategy';
import {
  Accepter,
  makeNumChangeHandler,
  makeTextChangeHandler,
  span,
} from 'src/Util';
import IncDecSelect, { Props as IncProps } from 'src/components/IncDecSelect';


export interface Props {
  fightOptions: FightOptions;
  changeHandler: Accepter<FightOptions>;
}

const FightOptionControls: React.FC<Props> = (props: Props) => {
  const strategyFighterAId = 'Fighter A Strategy';
  const strategyFighterBId = 'Fighter B Strategy';
  const firstFighterId = 'Attacker/FirstActer';
  const numRoundsId = 'Rounds';
  const strategies = Object.values(FightStrategy);
  const opts = props.fightOptions;
  const textHandler = makeTextChangeHandler(opts, props.changeHandler);
  const numHandler = makeNumChangeHandler(opts, props.changeHandler);

  const params: IncProps[] = [
    //           id/label,           selectedValue,         values,          valueChangeHandler
    new IncProps(strategyFighterAId, opts.strategyFighterA, strategies,      textHandler('strategyFighterA')),
    new IncProps(strategyFighterBId, opts.strategyFighterB, strategies,      textHandler('strategyFighterB')),
    new IncProps(firstFighterId,     opts.firstFighter,     ['A', 'B'],      textHandler('firstFighter')),
    new IncProps(numRoundsId,        opts.numRounds,        span(1, 3),      numHandler('numRounds')),
  ];

  const paramCols = params.map(p =>
    <Col key={p.id} className='pr-0 col-auto'><IncDecSelect {...p}/></Col>);

  return (
    <Container style={{width: '600px'}}>
      <Row>
        General
      </Row>
      <Row>
        {paramCols}
      </Row>
    </Container>
  );
}

export default FightOptionControls;