import { Button, Col, Row } from "react-bootstrap";

type Props = {
  onClick: () => void;
};

function Buttons({ onClick }: Props) {
  return (
    <>
      <Row className="g-2">
        <Col md className="text-center">
          <Button
            variant="secondary"
            size="lg"
            onClick={() =>
              (window.location.href =
                "https://script.google.com/a/hmbrandt.com/macros/s/AKfycby8eDlskli0ele5atseGWfNyzkzTC7pcZ37vHxJ29U/dev?page=TemplateDRList")
            }
          >
            Back
          </Button>
        </Col>
        <Col md className="text-center">
          <Button variant="primary" size="lg" onClick={onClick}>
            Save
          </Button>
        </Col>
      </Row>
    </>
  );
}

export default Buttons;
