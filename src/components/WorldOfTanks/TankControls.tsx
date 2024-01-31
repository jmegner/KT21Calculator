import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import IncDecSelect, {Props as IncProps} from 'src/components/IncDecSelect';
import * as Util from 'src/Util';
import { boolToCheckX as toCheckX } from 'src/Util';
import Tank from 'src/WorldOfTanks/Tank';
import {rerolls} from 'src/WorldOfTanks/Reroll';
import * as N from 'src/Notes';


export interface Props {
  tank: Tank;
  isAttacker: boolean;
  changeHandler: Util.Accepter<Tank>;
}

const TankControls: React.FC<Props> = (props: Props) => {
  const tank = props.tank;
  const [textHandler, numHandler, boolHandler]
    = Util.makePropChangeHandlers(tank, props.changeHandler);
  const diceSpan = Util.span(props.isAttacker ? 1 : 0, 10);
  const hitsToCritsLabel = `HitsToCrits (ex: ${props.isAttacker ? 'BigGun' : 'Spall Liner'})`;

  let params: IncProps[] = [
    //           id/label,         selectedValue,                   values,           valueChangeHandler
    new IncProps('Dice',           tank.dice,                       diceSpan,         numHandler('dice')),
    new IncProps('Reroll',         tank.reroll,                     rerolls,          textHandler('reroll')),
    new IncProps(hitsToCritsLabel, tank.hitsToCrits,                Util.span(0, 3), numHandler('hitsToCrits')),
  ];

  if(props.isAttacker) {
    params.push(...[
      //           id/label,         selectedValue,                   values,           valueChangeHandler
      new IncProps('CritsToHits (ex: ArrowShot)', tank.critsToHits,   Util.span(0, 3),  numHandler('critsToHits')),
      new IncProps(N.Deadeye,        toCheckX(tank.deadeye),          Util.xAndCheck,   boolHandler('deadeye')),
      new IncProps(N.HighExplosive,  toCheckX(tank.highExplosive),    Util.xAndCheck,   boolHandler('highExplosive')),
      new IncProps(N.TargetHullDown, toCheckX(tank.targetIsHullDown), Util.xAndCheck,   boolHandler('targetIsHullDown')),
    ]);
  }
  else {
    params.push(...[
      //           id/label,         selectedValue,                   values,           valueChangeHandler
      new IncProps('HP',             tank.hp,                         Util.span(1,11),  numHandler('hp')),
    ]);

  }

  const paramElems = params.map(p =>
    <Row key={p.id}><Col className='pr-0'><IncDecSelect {...p}/></Col></Row>);

  const title = props.isAttacker ? "Attacker" : "Defender";

  return (
    <Container>
      <Row>{title}</Row>
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

export default TankControls;