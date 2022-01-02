import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import IncDecSelect, {Props as IncProps} from './IncDecSelect';
import Defender from '../Defender';
import * as Util from '../Util';
import { boolToCheckX as toCheckX } from '../Util';

export interface Props {
  defender: Defender;
  changeHandler: Util.Accepter<Defender>;
}


const DefenderControls: React.FC<Props> = (props: Props) => {
  const saveId = 'Save';
  const defenseId = 'Defense';
  const woundsId = 'Wounds';
  const fnpId = 'FNP (Feel No Pain) (TODO)';
  const invulnSaveId = 'InvulnSave (used if valid)';
  const coverId = 'Cover (1 autosuccess)';
  const chitinId = 'Extended Chitin';

  const def = props.defender;
  const [, numHandler, boolHandler]
    = Util.makePropChangeHandlers(def, props.changeHandler);

  const params: IncProps[] = [
    //           id,           selectedValue,          values,                valueChangeHandler
    new IncProps(saveId,       def.save + '+',       Util.rollSpan,         numHandler('save')),
    new IncProps(defenseId,    def.defense,          Util.span(0, 4),       numHandler('defense')),
    new IncProps(woundsId,     def.wounds,           Util.span(1, 19),      numHandler('wounds')),
    new IncProps(fnpId,        def.fnp + '+',        Util.xspan(3, 6, '+'), numHandler('fnp')),
    new IncProps(invulnSaveId, def.invulnSave + '+', Util.xrollSpan,        numHandler('invulnSave')),
    new IncProps(coverId,      toCheckX(def.cover),  Util.xAndCheck,        boolHandler('cover')),
    new IncProps(chitinId,     toCheckX(def.chitin), Util.xAndCheck,        boolHandler('chitin')),
  ];

  const paramElems = params.map(p =>
    <Row key={p.id}><Col className='pr-0'><IncDecSelect {...p}/></Col></Row>);

  return (
    <Container style={{width: '320px'}}>
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
}

export default DefenderControls;