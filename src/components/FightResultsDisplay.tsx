import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Table from 'react-bootstrap/Table';

import * as Util from 'src/Util';

export interface Props {
  fighterAWoundProbs: Map<number,number>;
  fighterBWoundProbs: Map<number,number>;
  fighterAWoundsOrig: number;
  fighterBWoundsOrig: number;
}

const FightResultsDisplay: React.FC<Props> = (props: Props) => {
  return (
    <Container>
      <Row>Results</Row>
      <Row>
        <Col className='border'>
          {makeFighterResultsSection('FighterA', props.fighterAWoundProbs, props.fighterAWoundsOrig)}
        </Col>
        <Col className='border'>
          {makeFighterResultsSection('FighterB', props.fighterBWoundProbs, props.fighterBWoundsOrig)}
        </Col>
      </Row>
    </Container>
  );
}

function makeFighterResultsSection(
  title: string,
  woundProbs: Map<number,number>,
  woundsOrig: number,
): JSX.Element {
  const digitsPastDecimal = 2;
  let avgWounds = Util.weightedAverage(woundProbs);
  let avgDmg = woundsOrig - avgWounds;
  let deathProb = woundProbs.get(0) ?? 0;
  const tableBody: JSX.Element[] = [];

  let ascendingWoundProbs = new Map<number,number>([...woundProbs.entries()].sort((a, b) => a[0] - b[0]));
  let probCumulative = 0;

  ascendingWoundProbs.forEach((prob, wounds) => {
     const probAtLeastThisManyWounds = 1 - probCumulative;
     probCumulative += prob;
     const probAtMostThisManyWounds = probCumulative;

     tableBody.push(
      <tr key={wounds}>
        <td>{wounds}</td>
        <td>{Util.toPercentString(probAtLeastThisManyWounds)}</td>
        <td>{Util.toPercentString(probAtMostThisManyWounds)}</td>
        <td>{Util.toPercentString(prob)}</td>
      </tr>);
  });

  return (
    <Container>
      <Row>{title}</Row>
      <Row>
        <Col style={{fontSize: '11px'}}>
          DeathChance:
        </Col>
        <Col>
          {Util.toPercentString(deathProb)}%
        </Col>
      </Row>
      <Row>
        <Col style={{fontSize: '11px'}}>
          AvgRemainingWounds:
        </Col>
        <Col>
          {avgWounds.toFixed(digitsPastDecimal)}
        </Col>
      </Row>
      <Row>
        <Col style={{fontSize: '11px'}}>
          AvgDmgTaken:
        </Col>
        <Col>
          {avgDmg.toFixed(digitsPastDecimal)}
        </Col>
      </Row>
      <Row>
        <Col>
          <Table bordered={true} striped={true} style={{fontSize: '11px'}}>
            <thead>
              <tr>
                <th>Wnds</th>
                <th>p(&gt;=Wnds)<br />(%)</th>
                <th>p(&lt;=Wnds)<br />(%)</th>
                <th>p(Wnds)<br />(%)</th>
              </tr>
            </thead>
            <tbody>
              {tableBody}
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  );
}

export default FightResultsDisplay;