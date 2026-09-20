import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import IncDecSelect, {Props as IncProps} from 'src/components/IncDecSelect';
import {
  Accepter,
  makeNumChangeHandler,
  makeIncDecPropsFromLookup,
  span,
} from 'src/Util';
import { DeadzoneModel, } from "src/DiceSim/pkg/dice_sim";


export interface Props {
  model: DeadzoneModel;
  isAttacker: boolean;
  isHaloFlashpoint?: boolean;
  changeHandler: Accepter<DeadzoneModel>;
}

const ModelControls: React.FC<Props> = (props: Props) => {
  const model = props.model;
  const numHandler = makeNumChangeHandler(model, props.changeHandler);
  const diceSpan = span(props.isAttacker ? 1 : 0, 9);
  const intSpan = span(0, 9);

  let params: IncProps[] = [
    //           id/label,            selectedValue,        values,               valueChangeHandler
    new IncProps('HP',                model.hp,             span(1,10),      numHandler('hp')),
    new IncProps('Dice',              model.numDice,        diceSpan,        numHandler('numDice')),
    new IncProps('Stat(RA/FI/SV)',    model.diceStat + "+", span(1, 8, '+'), numHandler('diceStat')),
    new IncProps('Rerolls',           model.numRerolls,     intSpan,         numHandler('numRerolls')),
    new IncProps('Toxic/Dismantle',   model.toxicDmg,       intSpan,         numHandler('toxicDmg')),
    new IncProps('AP',                model.ap,             intSpan,         numHandler('ap')),
    new IncProps('Armor',             model.armor,          intSpan,         numHandler('armor')),
    new IncProps('ShieldDice',        model.numShieldDice,  intSpan,         numHandler('numShieldDice')),
    new IncProps('DiceExplodeOn',     model.explodeStat + "+",    span(2, 8, '+'), numHandler('explodeStat')),
  ];

  if (props.isHaloFlashpoint) {
    // Halo Flashpoint reuses Deadzone's stats, rerolls and Toxic field (as Lethal).
    // Its defender always uses Survive, even in Assault; shields are tokens, not dice.
    params = [
      ...(!props.isAttacker ? [new IncProps('Health', model.hp, span(1, 10), numHandler('hp'))] : []),
      new IncProps('Dice', model.numDice, span(0, 20), numHandler('numDice')),
      new IncProps(props.isAttacker ? 'Ranged/Fight' : 'Survive', model.diceStat + '+', span(1, 8, '+'), numHandler('diceStat')),
      new IncProps('Rerolls', model.numRerolls, intSpan, numHandler('numRerolls')),
      ...(props.isAttacker ? [
        new IncProps('Lethal', model.toxicDmg, intSpan, numHandler('toxicDmg')),
        new IncProps('AP', model.ap, intSpan, numHandler('ap')),
        new IncProps('ESD', model.shieldDepleter, intSpan, numHandler('shieldDepleter')),
      ] : [
        new IncProps('Armour', model.armor, intSpan, numHandler('armor')),
        new IncProps('Energy Shields', model.energyShields, span(0, 20), numHandler('energyShields')),
      ]),
      makeIncDecPropsFromLookup('Headshots', model, props.changeHandler, 'explodeStat', new Map([
        [8, '8+'], [7, '7+'], [9, 'X'],
      ])),
    ];
  }

  const paramElems = params.map(p =>
    <Row key={p.id}><Col className='pr-0'><IncDecSelect {...p}/></Col></Row>);

  const title = props.isAttacker ? "Attacker" : "Defender";

  return (
    <Container style={{width: props.isHaloFlashpoint ? '150px' : '170px'}}>
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

export default ModelControls;
