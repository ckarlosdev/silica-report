import { Col, FloatingLabel, Form, Row } from "react-bootstrap";
import { Silica } from "../types";

type Props = {
  silicaData: Silica;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

function Plan({ silicaData, onChange }: Props) {
  const safeSilica = silicaData || {
    ventilationArea: "",
    datePlan: "",
    equipmentDescription: "",
  };

  return (
    <>
      <Row className="g-2">
        <Col md>
          <FloatingLabel
            // controlId="ventilationArea"
            label="Area or location in building of ventilation plan"
            className="mb-3"
          >
            <Form.Control
              type="text"
              onChange={onChange}
              value={safeSilica?.ventilationArea || ""}
              id="ventilationArea"
            />
          </FloatingLabel>
        </Col>
        <Col>
          <FloatingLabel
            // controlId="datePlan"
            label="Date plan was plan reviwed by workers"
            className="mb-3"
          >
            <Form.Control
              type="date"
              value={safeSilica?.datePlan || ""}
              onChange={onChange}
              id="datePlan"
            />
          </FloatingLabel>
        </Col>
      </Row>
      <Row className="justify-content-md-center">
        <Col xs lg="12" md="auto">
          <FloatingLabel
            // controlId="equipmentDescription"
            label="Types of neg. air fans & no"
            className="mb-3"
          >
            <Form.Control
              type="text"
              value={safeSilica?.equipmentDescription || ""}
              onChange={onChange}
              id="equipmentDescription"
            />
          </FloatingLabel>
        </Col>
      </Row>
    </>
  );
}

export default Plan;
