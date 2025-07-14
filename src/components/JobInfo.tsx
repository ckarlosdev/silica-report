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
      {/* Primera Fila: Job Number y Job Name */}
      <Row className="mb-3">
        {" "}
        {/* Añadir mb-3 para un espaciado consistente entre filas */}
        <Col xs={12} md={6}>
          {" "}
          {/* En móviles (xs) toma todo el ancho, en tabletas (md) y superiores toma la mitad */}
          <Input
            fieldType="text"
            fieldValue={job?.number}
            fieldName="Job Number"
          ></Input>
        </Col>
        <Col xs={12} md={6}>
          <Input
            fieldType="text"
            fieldValue={job?.name}
            fieldName="Job Name"
          ></Input>
        </Col>
      </Row>

      {/* Segunda Fila: Job Address y Event Date */}
      <Row className="mb-3">
        <Col xs={12}>
          <Input
            fieldType="text"
            fieldValue={job?.address}
            fieldName="Job Address"
          ></Input>
        </Col>
      </Row>

      {/* Tercera Fila: Work Description (Texto Largo) */}
      <Row className="mb-3">
        <Col xs={12}>
          {" "}
          {/* Siempre toma todo el ancho en cualquier tamaño de pantalla */}
          <FloatingLabel label="Work Description">
            <Form.Control
              as="textarea"
              // Quitar estilos inline de tamaño. Bootstrap se encargará del ancho.
              // La altura la podemos controlar con rows o con CSS, pero no un valor fijo en px inline.
              rows={4} // Sugerencia de altura inicial en líneas
              value={silicaData?.workDescription || ""} // Asegurarse de que no sea undefined
              id="workDescription"
              onChange={onChange}
            />
          </FloatingLabel>
        </Col>
      </Row>

      {/* Cuarta Fila: Supervisor Select */}
      <Row className="mb-3">
        <Col xs={12} md={6}>
          {" "}
          {/* En móviles todo el ancho, en tabletas y superiores la mitad */}
          <FloatingLabel controlId="selectSupervisor" label="Select Supervisor">
            {" "}
            {/* Añadir FloatingLabel para el Select */}
            <Form.Select
              aria-label="Open this select supervisor"
              className="form-control-lg" // Usar clase para tamaño
              value={selectedSupervisorId}
              onChange={handleChange} // Usar el handler específico si es necesario
            >
              <option value="">Select a supervisor</option>{" "}
              {/* Opción por defecto */}
              {employeeDetails &&
                employeeDetails.map(
                  (employee) =>
                    employee.title === "Supervisor" && ( // === para comparación estricta
                      <option
                        key={employee.employeesId}
                        value={employee.employeesId}
                      >
                        {employee.firstName} {employee.lastName}
                      </option>
                    )
                )}
            </Form.Select>
          </FloatingLabel>
        </Col>
        <Col xs={12} md={6}>
          <Form.Group controlId="eventDatess">
            <FloatingLabel
              controlId="eventDate"
              label="Date"
            >
              {" "}
              {/* Usar Form.Group para mejor estructura y controlId */}
              <Form.Label visuallyHidden>Event Date</Form.Label>{" "}
              {/* Ocultar label si el tipo es date y el campo es evidente */}
              <Form.Control
                type="date"
                // Usar clases CSS en lugar de inline styles rígidos para responsividad
                className="form-control-lg custom-date-input" // Añadir clase personalizada si necesitas más estilos. form-control-lg para un tamaño más grande.
                value={silicaData?.eventDate || ""} // Asegurarse de que no sea undefined, si no, se quejará React
                onChange={onChange}
              />
            </FloatingLabel>
          </Form.Group>
        </Col>
      </Row>
      <br />
    </>
  );
}

export default JobInfo;
