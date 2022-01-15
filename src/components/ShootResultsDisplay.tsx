import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Table from 'react-bootstrap/Table';

import Defender from 'src/Defender';

export interface Props {
  defender: Defender;
  damageToProb: Map<number,number>;
}

const ShootResultsDisplay: React.FC<Props> = (props: Props) => {
  const digitsPastDecimal = 2;

  let avgDmgUnbounded = 0;
  let avgDmgBounded = 0;
  let killProb = 0;
  const tableBody: JSX.Element[] = [];

  let ascendingDmgToProb = new Map<number,number>([...props.damageToProb.entries()].sort((a, b) => a[0] - b[0]));
  let probCumulative = 0;

  const toPercentString = (val: number) => (val * 100).toFixed(digitsPastDecimal);

  ascendingDmgToProb.forEach((prob, dmg) => {
     avgDmgUnbounded += dmg * prob;
     avgDmgBounded += Math.min(dmg, props.defender.wounds) * prob;

     if(dmg >= props.defender.wounds) {
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
          {avgDmgUnbounded.toFixed(digitsPastDecimal)}
        </Col>
      </Row>
      <Row>
        <Col style={{fontSize: '11px'}}>
          AvgDmgBounded:
        </Col>
        <Col>
          {avgDmgBounded.toFixed(digitsPastDecimal)}
        </Col>
      </Row>
      <Row>
        <Col style={{fontSize: '11px'}}>
          KillChance:
        </Col>
        <Col>
          {(killProb * 100).toFixed(digitsPastDecimal)}%
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

export default ShootResultsDisplay;