import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Table from 'react-bootstrap/Table';

import Model from 'src/Model';
import { toAscendingMap, weightedAverage, killProb, standardDeviation, } from 'src/Util';
import { MaxWounds, WoundRange } from 'src/KtMisc';
import Accordion from 'react-bootstrap/Accordion';
import 'src/components/ShootResultsDisplay.css'

export interface Props {
  defender: Model;
  //damageToProb: Map<number,number>;
  saveToDmgToProb: Map<number,Map<number,number>>;
}

const ShootResultsDisplay: React.FC<Props> = (props: Props) => {
  const digitsPastDecimal = 2;
  const toPercentString = (val: number) => (val * 100).toFixed(digitsPastDecimal);
  const saves = [...props.saveToDmgToProb.keys()].sort();

  const killChanceTableBody: JSX.Element[] = [];

  for(const wounds of WoundRange) {
    const killChances: number[] = [];

    for(const save of saves) {
      killChances.push(killProb(props.saveToDmgToProb.get(save)!, wounds));
    }

    killChanceTableBody.push(
      <tr key={`KillChance_${wounds}`}>
        <td>{wounds}</td>
        {killChances.map((killChance, index) => <td key={index}>{toPercentString(killChance)}%</td>)}
      </tr>
    );
  }

  const killChanceTable =
    <>
      <Table bordered={true} striped={true} style={{ fontSize: '11px' }}>
        <thead>
          <tr>
            <th>W</th>
            {saves.map(save => <th key={'Sv' + save}>Sv={save}+</th>)}
          </tr>
        </thead>
        <tbody>
          {killChanceTableBody}
        </tbody>
      </Table>
    </>;

  const saveToAvgDmgTableBody: JSX.Element[] = [];

  for(const save of saves) {
    const dmgToProb = props.saveToDmgToProb.get(save)!;
    const avgDmg = weightedAverage(dmgToProb);
    const stdDev = standardDeviation(dmgToProb);

    saveToAvgDmgTableBody.push(
      <tr key={`AvgDmg_${save}`}>
        <td>{save}+</td>
        <td>{avgDmg.toFixed(digitsPastDecimal)}</td>
        <td>{stdDev.toFixed(digitsPastDecimal)}</td>
      </tr>
    );
  }

  const saveToAvgDmgTable =
    <>
      <Table bordered={true} striped={true} style={{ fontSize: '11px' }}>
        <thead>
          <tr>
            <th>Sv</th>
            <th>AvgDmg</th>
            <th>StdDev</th>
          </tr>
        </thead>
        <tbody>
          {saveToAvgDmgTableBody}
        </tbody>
      </Table>
    </>;

  let avgDmgUnbounded = 0;
  const dmgProbTableBody: JSX.Element[] = [];

  const chosenSaveDmgToProb = props.saveToDmgToProb.get(props.defender.diceStat)!;
  const killChance = killProb(chosenSaveDmgToProb, props.defender.wounds);
  let ascendingDmgToProb = toAscendingMap(chosenSaveDmgToProb);
  let probCumulative = 0;
  let wantMoreDmgRows = true;

  for(const [dmg, prob] of ascendingDmgToProb) {
     avgDmgUnbounded += dmg * prob;

    if (wantMoreDmgRows) {
      const probAtLeastThisMuchDmg = 1 - probCumulative;
      probCumulative += prob;
      const probAtMostThisMuchDmg = probCumulative;

      dmgProbTableBody.push(
        <tr key={dmg}>
          <td>{dmg}</td>
          <td>{toPercentString(probAtLeastThisMuchDmg)}</td>
          <td>{toPercentString(probAtMostThisMuchDmg)}</td>
          <td>{toPercentString(prob)}</td>
        </tr>
      );

      if (dmg >= MaxWounds) {
        wantMoreDmgRows = false;
      }
    }
  }

  const dmgProbTable =
    <>
      <span style={{ fontSize: '13px' }}>Dmg probs for exact scenario...</span>
      <Table bordered={true} striped={true} style={{ fontSize: '11px' }}>
        <thead>
          <tr>
            <th>Dmg</th>
            <th>p(&gt;=Dmg)<br />(%)</th>
            <th>p(&lt;=Dmg)<br />(%)</th>
            <th>p(Dmg)<br />(%)</th>
          </tr>
        </thead>
        <tbody>
          {dmgProbTableBody}
        </tbody>
      </Table>
    </>;

  return (
    <Container fluid>
      <Row>
        <Col>
        <Accordion flush>
          <Accordion.Item eventKey='0'>
            <Accordion.Header as="h6">AvgDmg for various Sv...</Accordion.Header>
            <Accordion.Body>{saveToAvgDmgTable}</Accordion.Body>
          </Accordion.Item>
        </Accordion>
        </Col>
        <Col>
        <Accordion flush>
          <Accordion.Item eventKey='0'>
            <Accordion.Header as="h6">KillChances for various Sv&amp;W...</Accordion.Header>
            <Accordion.Body>{killChanceTable}</Accordion.Body>
          </Accordion.Item>
        </Accordion>
        </Col>
      </Row>
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
          KillChance:
        </Col>
        <Col>
          {toPercentString(killChance)}%
        </Col>
        <br/>
      </Row>
      <Row>
        <Col>
          {dmgProbTable}
        </Col>
      </Row>
    </Container>
  );
}

export default ShootResultsDisplay;