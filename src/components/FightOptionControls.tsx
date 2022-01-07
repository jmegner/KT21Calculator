import React from 'react';
import {
  Col,
  Container,
  Row,
} from 'react-bootstrap';

import IncDecSelect, {Props as IncProps} from 'src/components/IncDecSelect';
import * as Util from 'src/Util';
import FightStrategy from 'src/FightStrategy';


export interface Props {
  strategyFighterA: FightStrategy;
  strategyFighterAChangeHandler: Util.Accepter<FightStrategy>;
  strategyFighterB: FightStrategy;
  strategyFighterBChangeHandler: Util.Accepter<FightStrategy>;
  firstFighter: string;
  firstFighterChangeHandler: Util.Accepter<string>;
}

const FightOptionControls: React.FC<Props> = (props: Props) => {
  const strategyFighterAId = 'Fighter A Strategy';
  const strategyFighterBId = 'Fighter B Strategy';
  const firstFighterId = 'Attacker/First';
  const strategies = Object.values(FightStrategy);

  const params: IncProps[] = [
    //           id/label,           selectedValue,          values,      valueChangeHandler
    new IncProps(strategyFighterAId, props.strategyFighterA, strategies,  props.strategyFighterAChangeHandler as (fighter: string) => void),
    new IncProps(strategyFighterBId, props.strategyFighterB, strategies,  props.strategyFighterBChangeHandler as (fighter: string) => void),
    new IncProps(firstFighterId,     props.firstFighter,     ['A', 'B'],  props.firstFighterChangeHandler),
  ];

  const paramCols = params.map(p =>
    <Col key={p.id} className='pr-0'><IncDecSelect {...p}/></Col>);

  return (
    <Container>
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