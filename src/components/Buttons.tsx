import { Button, Col, Row } from "react-bootstrap";

type Props = {};

function Buttons({}: Props) {
  return (
    <>
      <Row className="g-2">
        <Col md className="text-center">
          <Button variant="secondary" size="lg">
            Back
          </Button>
        </Col>
        <Col md className="text-center">
          <Button variant="primary" size="lg">
            Save
          </Button>
        </Col>
      </Row>
    </>
  );
}

export default Buttons;
