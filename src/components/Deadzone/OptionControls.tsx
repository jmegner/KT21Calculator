import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import IncDecSelect, {Props as IncProps, propsToRows} from 'src/components/IncDecSelect';
import { DeadzoneOptions } from "src/DiceSim/pkg/dice_sim";
import {
  Accepter,
  makePropChangeHandlers,
  span,
  xAndCheck,
  boolToCheckX,
  makeIncDecPropsFromLookup,
  requiredAndOptionalItemsToTwoCols,
} from 'src/Util';

export interface Props {
  options: DeadzoneOptions;
  changeHandler: Accepter<DeadzoneOptions>;
}

const OptionControls: React.FC<Props> = (props: Props) => {
  const opts = props.options;
  // eslint-disable-next-line
  const [textHandler, numHandler, boolHandler]
    = makePropChangeHandlers(opts, props.changeHandler);

  const simCountToDisplayTexts = new Map<number,string>([
    [1, '1'],
    [1e2, '100'],
    [1e3, '1K'],
    [1e4, '10K, recommended'],
    [1e5, '100K, pretty accurate'],
    [1e6, '1M, excessive'],
  ]);
  const simCountIncProps = makeIncDecPropsFromLookup('Num Simulations', opts, props.changeHandler, 'numSimulations', simCountToDisplayTexts);
  const explodingDiceMaxLevelsToDisplayTexts = new Map<number,string>([
    [0x7fffffff, 'Unlimited'],
    [0, 'Disabled'],
    [1, '1'],
    [2, '2'],
    [3, '3'],
  ]);
  const explodingDiceMaxLevelsIncProps = makeIncDecPropsFromLookup('ExplodingDiceLevels', opts, props.changeHandler, 'explodingDiceMaxLevels', explodingDiceMaxLevelsToDisplayTexts);

  const fightBackVal = boolToCheckX(opts.attackerCanBeDamaged);

  const params: IncProps[] = [
    //           id,              selectedValue,          values,      valueChangeHandler
    new IncProps('FightBack?',    fightBackVal,           xAndCheck,   boolHandler('attackerCanBeDamaged')),
    simCountIncProps,
    new IncProps('Rounds',        opts.numRounds,         span(1, 9),  numHandler('numRounds')),
    explodingDiceMaxLevelsIncProps,
  ];

  const [elemsCol0, elemsCol1] = requiredAndOptionalItemsToTwoCols(propsToRows(params));

  return (
    <Container style={{width: '320px'}}>
      <Row>General</Row>
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
}

export default OptionControls;