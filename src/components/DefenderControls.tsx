import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import IncDecSelect, {Props as IncProps} from 'src/components/IncDecSelect';
import Defender from 'src/Defender';
import * as Util from 'src/Util';
import { boolToCheckX as toCheckX } from 'src/Util';

export interface Props {
  defender: Defender;
  changeHandler: Util.Accepter<Defender>;
}


const DefenderControls: React.FC<Props> = (props: Props) => {
  const saveId = 'Save';
  const defenseId = 'Defense';
  const woundsId = 'Wounds';
  const fnpId = 'FeelNoPain*';
  const invulnSaveId = 'InvulnSave*';
  const coverNormSavesId = 'CoverNormSaves*';
  const coverCritSavesId = 'CoverCritSaves*';
  const hardyxId = 'HardyX*';
  const chitinId = 'ExtendedChitin*';

  const def = props.defender;
  const [, numHandler, boolHandler]
    = Util.makePropChangeHandlers(def, props.changeHandler);

  const params: IncProps[] = [
    //           id,               selectedValue,        values,                valueChangeHandler
    new IncProps(defenseId,        def.defense,          Util.span(0, 4),       numHandler('defense')),
    new IncProps(saveId,           def.save + '+',       Util.rollSpan,         numHandler('save')),
    new IncProps(woundsId,         def.wounds,           Util.span(1, 19),      numHandler('wounds')),
    new IncProps(coverNormSavesId, def.coverNormSaves,   Util.xspan(1, 3),      numHandler('coverNormSaves')),
    new IncProps(coverCritSavesId, def.coverCritSaves,   Util.xspan(1, 3),      numHandler('coverCritSaves')),
    new IncProps(invulnSaveId,     def.invulnSave + '+', Util.xrollSpan,        numHandler('invulnSave')),
    new IncProps(hardyxId,         def.hardyx + '+',     Util.xspan(5, 5, '+'), numHandler('hardyx')),
    new IncProps(fnpId,            def.fnp + '+',        Util.xspan(3, 6, '+'), numHandler('fnp')),
    new IncProps(chitinId,     toCheckX(def.chitin),     Util.xAndCheck,        boolHandler('chitin')),
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