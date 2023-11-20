import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Table from 'react-bootstrap/Table';

import * as Util from 'src/Util';

export interface Props {
  dmgToProb: Map<number,number>;
  attackerHp: number;
  defenderHp: number;
  attackerCanBeDamaged: boolean;
}

const ResultsDisplay: React.FC<Props> = (props: Props) => {
  const digitsPastDecimalForDamage = 1;
  function toPercent(prob: number) {
    return Util.toPercentString(prob, 1);
  }

  let avgDmgUnbounded = 0;
  let defenderDeathProb = 0;
  let attackerDeathProb = 0;
  const tableBody: JSX.Element[] = [];

  let ascendingDmgToProb = Util.toAscendingMap(props.dmgToProb);
  let probCumulative = 0;

  ascendingDmgToProb.forEach((prob, dmg) => {
     avgDmgUnbounded += dmg * prob;

     if(dmg >= props.defenderHp) {
       defenderDeathProb += prob;
     }
     else if(dmg <= -props.attackerHp) {
       attackerDeathProb += prob;
     }

     const probAtLeastThisMuchDmg = 1 - probCumulative;
     probCumulative += prob;
     const probAtMostThisMuchDmg = probCumulative;

     tableBody.push(
      <tr key={dmg}>
        <td>{dmg}</td>
        <td>{toPercent(probAtLeastThisMuchDmg)}</td>
        <td>{toPercent(probAtMostThisMuchDmg)}</td>
        <td>{toPercent(prob)}</td>
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
      <Row>
        <Col style={{fontSize: '11px'}}>
          DefenderDeathChance:
        </Col>
        <Col>
          {toPercent(defenderDeathProb)}%
        </Col>
      </Row>
      { props.attackerCanBeDamaged &&
        <Row>
          <Col style={{fontSize: '11px'}}>
            AttackerDeathChance:
          </Col>
          <Col>
            {toPercent(attackerDeathProb)}%
          </Col>
        </Row>
      }
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