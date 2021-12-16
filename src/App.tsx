import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import AttackerControls from "./components/AttackerControls";
import DefenderControls from "./components/DefenderControls";
import Util from "./Util";

export default function App() {
  return (
    <Container style={{width: '800px'}}>
      <Row>
        <Col className={Util.centerHoriz}>
          <AttackerControls />
        </Col>
        <Col className={Util.centerHoriz}>
          <DefenderControls />
        </Col>
      </Row>
    </Container>
  );
};
