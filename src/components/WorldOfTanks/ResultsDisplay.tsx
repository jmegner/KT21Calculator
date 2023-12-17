import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Table from 'react-bootstrap/Table';

import * as Util from 'src/Util';
import Tank from 'src/WorldOfTanks/Tank';

export interface Props {
  defender: Tank;
  dmgToProb: Map<number,number>;
  critsToProb: Map<number,number>;
}

const ResultsDisplay: React.FC<Props> = (props: Props) => {
  const digitsPastDecimalForDamage = 3;
  const digitsPastDecimalForNondamage = 2;

  let avgDmgUnbounded = 0;
  let killProb = 0;
  const tableBody: JSX.Element[] = [];

  let ascendingDmgToProb = Util.toAscendingMap(props.dmgToProb);
  const avgCrits = Util.weightedAverage(props.critsToProb);
  let probCumulative = 0;

  const toPercentString = (val: number) => (val * 100).toFixed(digitsPastDecimalForNondamage);

  ascendingDmgToProb.forEach((prob, dmg) => {
     avgDmgUnbounded += dmg * prob;

     if(dmg >= props.defender.hp) {
       killProb += prob;
     }

     const probAtLeastThisMuchDmg = 1 - probCumulative;
     probCumulative += prob;
     const probAtMostThisMuchDmg = probCumulative;

     tableBody.push(
      <tr key={dmg}>
        <td>{dmg}</td>
        <td>{toPercentString(probAtLeastThisMuchDmg)}</td>
        <td>{toPercentString(probAtMostThisMuchDmg)}</td>
        <td>{toPercentString(prob)}</td>
      </tr>);
  });

  return (
    <Container style={{width: '320px'}}>
      <Row>Results</Row>
      <Row>
        <Col style={{fontSize: '11px'}}>
          AvgDmgUnbounded:
        </Col>
        <Col>
          {avgDmgUnbounded.toFixed(digitsPastDecimalForDamage)}
        </Col>
      </Row>
      {/*
      <Row>
        <Col style={{fontSize: '11px'}}>
          AvgDmgBounded:
        </Col>
        <Col>
          {avgDmgBounded.toFixed(digitsPastDecimalForDamage)}
        </Col>
      </Row>
      */}
      <Row>
        <Col style={{fontSize: '11px'}}>
          KillChance:
        </Col>
        <Col>
          {toPercentString(killProb)}%
        </Col>
      </Row>
      <Row>
        <Col style={{fontSize: '11px'}}>
          AvgCrits:
        </Col>
        <Col>
          {avgCrits.toFixed(digitsPastDecimalForDamage)}
        </Col>
      </Row>
      <Row>
        <Col>
          <Table bordered={true} striped={true} style={{fontSize: '11px'}}>
            <thead>
              <tr>
                <th>Dmg</th>
                <th>p(&gt;=Dmg)<br />(%)</th>
                <th>p(&lt;=Dmg)<br />(%)</th>
                <th>p(Dmg)<br />(%)</th>
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

export default ResultsDisplay;