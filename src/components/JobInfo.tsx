import { Col, FloatingLabel, Form, Row } from "react-bootstrap";
import Input from "./Input";
import { Employee, Job, Silica } from "../types";
import { useEffect, useState } from "react";
import useHttpData from "../hooks/useHttpData";
import { searchEmployeesURL } from "../hooks/urls";

type Props = {
  job?: Job;
  silicaData?: Silica;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  supervisorId?: number;
  onSupervisorChange?: (id: number) => void;
};

function JobInfo({
  job,
  silicaData,
  onChange,
  supervisorId,
  onSupervisorChange,
}: Props) {
  const [employeeDetails, setEmployeeDetails] = useState<
    Employee[] | undefined
  >(undefined);
  const [selectedSupervisorId, setSelectedSupervisorId] = useState<string>("");

  const { data: employeesData, search: searchEmployees } =
    useHttpData<Employee[]>();

  const getEmployeesData = () => {
    searchEmployees(searchEmployeesURL());
  };

  useEffect(() => {
    getEmployeesData();
  }, []);

  useEffect(() => {
    setEmployeeDetails(employeesData);
  }, [employeesData]);

  useEffect(() => {
    if (supervisorId) {
      setSelectedSupervisorId(supervisorId.toString());
    }
  }, [supervisorId]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedSupervisorId(value);
    if (onSupervisorChange) {
      onSupervisorChange(Number(value));
    }
  };

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
      <Row className="justify-content-md-center">
        <Col xs lg="5" md="auto">
          <Form.Select
            aria-label="Open this select supervisor"
            style={{ fontWeight: "bold", fontSize: "17px", height: "60px" }}
            value={selectedSupervisorId}
            onChange={handleChange}
          >
            {employeeDetails &&
              employeeDetails.map(
                (employee) =>
                  employee.title == "Supervisor" && (
                    <option
                      key={employee.employeesId}
                      value={employee.employeesId}
                    >
                      {employee.firstName} {employee.lastName}
                    </option>
                  )
              )}
          </Form.Select>
        </Col>
      </Row>
      <br />
    </>
  );
}

export default JobInfo;
