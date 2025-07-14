import { FloatingLabel, Form } from "react-bootstrap";

type Props = {
  fieldValue?: string;
  fieldName: string;
  fieldType: string;
};

function Input({ fieldValue, fieldName, fieldType }: Props) {
  return (
    <>
      <FloatingLabel
        controlId={fieldName}
        label={fieldName}
        className="mb-3"
      >
        <Form.Control
          readOnly
          type={fieldType ? fieldType : ""}
          value={fieldValue ? fieldValue : ""}
          style={{ fontWeight: "bold", fontSize: "18px", textAlign: "center" }}
        />
      </FloatingLabel>
    </>
  );
}

export default Input;
