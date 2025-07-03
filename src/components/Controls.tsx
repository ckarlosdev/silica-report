import { Accordion, Col, Row } from "react-bootstrap";
import { Control, Silica, SilicaControl } from "../types";
import useHttpData from "../hooks/useHttpData";
import { searchControlsURL } from "../hooks/urls";
import { useEffect, useState } from "react";
import ControlInput from "./ControlInput";

type Props = {
  silicaData?: Silica;
//   setSilica: (silica: Silica) => void;
  onChange: (controlDescriptionId: number, newValue: any) => void;
};

function Controls({ silicaData, onChange }: Props) {
  const [controlsDetails, setControlsDetails] = useState<Control[] | undefined>(
    undefined
  );

  const { data: controlData, search } = useHttpData<Control[]>();

  const getData = () => {
    search(searchControlsURL());
  };

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    if (controlData && controlData.length > 0) {
      setControlsDetails(controlData);
    }
  }, [controlData]);

  return (
    <>
      <Row>
        <Col>
          <Accordion>
            {controlsDetails?.map((control) => (
              <Accordion.Item
                key={control.controlsId.toString()}
                eventKey={control.controlsId.toString()}
              >
                <Accordion.Header>
                  <span style={{ fontWeight: "bold" }}>
                    {control.controlType}
                  </span>
                  {"\u00A0"}
                  {control.typeDescription}
                </Accordion.Header>
                <Accordion.Body>
                  {control.descriptions.map((description) => (
                    <ControlInput
                      controlName={description.controlName}
                      typeElement={description.componentType}
                      key={description.controlsDescriptionsId}
                      controlDescriptionId={description.controlsDescriptionsId}
                      valueElement={
                        silicaData?.silicaControls.find(
                          (item) =>
                            item.controlDescriptionId ===
                            description.controlsDescriptionsId
                        )?.controlAnswer || ""
                      }
                      onChange={onChange}
                    ></ControlInput>
                  ))}
                </Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>
        </Col>
      </Row>
    </>
  );
}

export default Controls;
