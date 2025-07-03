import { Col, Row } from "react-bootstrap";
import Image from "react-bootstrap/Image";
import hmbLogo from "../assets/hmbLogo.png";

type Props = {};

function Title({}: Props) {
  return (
    <>
      <Row className="justify-content-md-center">
        <Col xs={5} md={3}>
          <Image src={hmbLogo} rounded fluid />
        </Col>
      </Row>
      <br />
      <Row className="justify-content-md-center">
        <Col style={{ textAlign: "center" }}>
          <h4>SITE-SPECIFIC SILICA EXPOSURE CONTROL PLAN</h4>
        </Col>
      </Row>
    </>
  );
}

export default Title;
