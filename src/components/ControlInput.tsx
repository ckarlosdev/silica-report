import { FloatingLabel, Form } from "react-bootstrap";

type Props = {
  typeElement: string;
  controlName: string;
  valueElement: string;
  controlDescriptionId: number;
  onChange: (controlDescriptionId: number, newValue: string) => void;
};

function ControlInput({
  typeElement,
  controlName,
  valueElement,
  controlDescriptionId,
  onChange,
}: Props) {
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    let newValue;
    // Safely access 'checked' only if the target is an HTMLInputElement and its type is 'checkbox'
    // console.log(typeElement);
    if (typeElement === "checkbox") {
      newValue = (e.target as HTMLInputElement).checked; // Type assertion for checkbox
      // console.log("dddata");
    } else {
      newValue = e.target.value;
    }
    // Call the parent's onChange handler, passing the ID and the new value
    onChange(controlDescriptionId, newValue.toString());
  };
  return (
    <>
      {typeElement != "checkbox" ? (
        <div
          className="row g-3 align-items-center"
          style={{ margin: "1px", height: "45" }}
        >
          <FloatingLabel style={{ marginTop: "1px" }} label={controlName}>
            <Form.Control
              type="text"
              value={valueElement || ""}
              onChange={handleChange}
            />
          </FloatingLabel>
        </div>
      ) : (
        <div
          className="row g-3 align-items-center"
          style={{ margin: "1px", height: "45" }}
        >
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              value=""
              checked={valueElement === "true"  ? true : false}
              onChange={handleChange}
            />
            <label className="form-check-label" htmlFor={controlName}>
              {controlName}
            </label>
          </div>
        </div>
      )}
    </>
  );
}

export default ControlInput;
