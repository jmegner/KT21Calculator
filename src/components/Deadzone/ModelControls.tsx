import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import IncDecSelect, {Props as IncProps} from 'src/components/IncDecSelect';
import * as Util from 'src/Util';
import { boolToCheckX as toCheckX } from 'src/Util';
import Model from 'src/Deadzone/Model';
import * as N from 'src/Notes';


export interface Props {
  model: Model;
  isAttacker: boolean;
  changeHandler: Util.Accepter<Model>;
}

const ModelControls: React.FC<Props> = (props: Props) => {
  const model = props.model;
  const [textHandler, numHandler, boolHandler]
    = Util.makePropChangeHandlers(model, props.changeHandler);
  const diceSpan = Util.span(1, 10);
  const intSpan = Util.span(0, 9);

  let params: IncProps[] = [
    //           id/label,            selectedValue,        values,               valueChangeHandler
    new IncProps('HP',                model.hp,             Util.span(1,10),      numHandler('hp')),
    new IncProps('Dice',              model.numDice,        diceSpan,             numHandler('numDice')),
    new IncProps('Stat(RA/FI/SV)',    model.diceStat + "+", Util.span(1, 8, '+'), numHandler('diceStat')),
    new IncProps('Rerolls',           model.numRerolls,     intSpan,              numHandler('numRerolls')),
    new IncProps('Toxic/Dismantle',   model.toxicDmg,       intSpan,              numHandler('toxicDmg')),
    new IncProps('AP',                model.ap,             intSpan,              numHandler('ap')),
    new IncProps('Armor',             model.armor,          intSpan,              numHandler('armor')),
    new IncProps('ShieldDice',        model.numShieldDice,  intSpan,              numHandler('numShieldDice')),
  ];

  const paramElems = params.map(p =>
    <Row key={p.id}><Col className='pr-0'><IncDecSelect {...p}/></Col></Row>);

  const title = props.isAttacker ? "Attacker" : "Defender";

  return (
    <Container style={{width: '180px'}}>
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