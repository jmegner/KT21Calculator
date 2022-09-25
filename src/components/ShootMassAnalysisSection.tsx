import React from 'react';
import {
  Col,
  Container,
  Row,
} from 'react-bootstrap';

import ShootOptions from 'src/ShootOptions';
import AttackerControls from "src/components/AttackerControls";
import DefenderControls from "src/components/DefenderControls";
import ShootOptionControls from 'src/components/ShootOptionControls';
import ShootResultsDisplay from 'src/components/ShootResultsDisplay';
import Credits from 'src/components/Credits';

import Attacker from 'src/Attacker';
import Defender from 'src/Defender';
import * as Util from "src/Util";
import { calcDmgProbs } from 'src/CalcEngineShoot';
import * as N from 'src/Notes';

const ShootMassAnalysisSection: React.FC = () => {

  return (
    <>
    </>
  );
};

export default ShootMassAnalysisSection;