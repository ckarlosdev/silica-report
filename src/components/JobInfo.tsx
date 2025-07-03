import { Col, FloatingLabel, Form, Row } from "react-bootstrap";
import Input from "./Input";
import { Job, Silica } from "../types";

type Props = {
  job?: Job;
  silicaData?: Silica;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

function JobInfo({ job, silicaData, onChange }: Props) {
  return (
    <>
      <Row className="justify-content-md-center">
        <Col xs lg="6" md="auto">
          <Input
            fieldType="text"
            fieldValue={job?.number}
            fieldName="Job Number"
          ></Input>
        </Col>
        <Col xs lg="6" md="auto">
          <Input
            fieldType="text"
            fieldValue={job?.name}
            fieldName="Job Name"
          ></Input>
        </Col>
      </Row>
      <Row className="justify-content-md-center">
        <Col xs lg="6" md="auto">
          <Input
            fieldType="text"
            fieldValue={job?.address}
            fieldName="Job Address"
          ></Input>
        </Col>
        <Col xs lg="6" md="auto">
          <input
            className="form-control"
            type="date"
            style={{ fontWeight: "bold", fontSize: "29px" }}
            value={silicaData?.eventDate}
            id="eventDate"
            onChange={onChange}
          />
        </Col>
      </Row>
      <Row className="justify-content-md-center">
        <Col xs lg="12" md="auto">
          <FloatingLabel label="Work desription" className="mb-3">
            <Form.Control
              as="textarea"
              style={{ fontSize: "17px", height: "100px" }}
              value={silicaData?.workDescription}
              id="workDescription"
              onChange={onChange}
            />
          </FloatingLabel>
        </Col>
      </Row>
      <br />
    </>
  );
}

export default JobInfo;
