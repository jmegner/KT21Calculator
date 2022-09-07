import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import IncDecSelect, {Props as IncProps} from 'src/components/IncDecSelect';
import Defender from 'src/Defender';
import * as Util from 'src/Util';
import {rerollAbilities as rerolls} from 'src/Ability';
import * as N from 'src/Notes';

export interface Props {
  defender: Defender;
  changeHandler: Util.Accepter<Defender>;
}


const DefenderControls: React.FC<Props> = (props: Props) => {
  const def = props.defender;
  const [textHandler, numHandler, /*boolHandler*/]
    = Util.makePropChangeHandlers(def, props.changeHandler);

  const params: IncProps[] = [
    //           id,               selectedValue,        values,                valueChangeHandler
    new IncProps('Defense',        def.defense,          Util.span(0, 4),       numHandler('defense')),
    new IncProps('Save',           def.save + '+',       Util.rollSpan,         numHandler('save')),
    new IncProps('Wounds',         def.wounds,           Util.span(1, 20),      numHandler('wounds')),
    new IncProps(N.CoverNormSaves, def.coverNormSaves,   Util.xspan(1, 4),      numHandler('coverNormSaves')),
    new IncProps(N.CoverCritSaves, def.coverCritSaves,   Util.xspan(1, 4),      numHandler('coverCritSaves')),
    new IncProps(N.NormToCrit,     def.normToCritPromotions, Util.xspan(1, 4),  numHandler('normToCritPromotions')),
    new IncProps(N.InvulnSave,     def.invulnSave + '+', Util.xrollSpan,        numHandler('invulnSave')),
    new IncProps(N.HardyX,         def.hardyx + '+',     Util.xspan(5, 2, '+'), numHandler('hardyx')),
    new IncProps(N.FeelNoPain,     def.fnp + '+',        Util.xspan(6, 2, '+'), numHandler('fnp')),
    new IncProps(N.Reroll,         def.reroll,           Util.preX(rerolls),    textHandler('reroll')),
  ];

  const paramElems = params.map(p =>
    <Row key={p.id}><Col className='pr-0'><IncDecSelect {...p}/></Col></Row>);

  return (
    <Container style={{width: '150px'}}>
      <Row>Defender</Row>
      <Row>
        <Col>
          <Container className='p-0'>
            {paramElems}
          </Container>
        </Col>
      </Row>
    </Container>
  );
};

export default DefenderControls;