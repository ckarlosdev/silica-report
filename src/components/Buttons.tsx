import { Button, Col, Row } from "react-bootstrap";

type Props = {
  onClick:() => void;
};

function Buttons({ onClick }: Props) {
  return (
    <>
      <Row className="g-2">
        <Col md className="text-center">
          <Button variant="secondary" size="lg" onClick={onClick}>
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
