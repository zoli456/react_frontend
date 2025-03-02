import { useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

export default function CreateForm({ setCreatingForm }) {
    const [newForm, setNewForm] = useState({ name: "", fields: [], timeLimit: "" });

    const handleAddField = () => {
        setNewForm({
            ...newForm,
            fields: [...newForm.fields, { label: "", type: "text", options: [], minLength: "", maxLength: "", min: "", max: "" }],
        });
    };

    const handleFieldChange = (index, key, value) => {
        const updatedFields = [...newForm.fields];
        updatedFields[index][key] = value;
        setNewForm({ ...newForm, fields: updatedFields });
    };

    const handleOptionsChange = (index, value) => {
        const options = value.split(",").map(opt => opt.trim()).slice(0, 5); // Max 5 options
        handleFieldChange(index, "options", options);
    };

    const handleRemoveField = (index) => {
        if (newForm.fields.length > 1) {
            const updatedFields = [...newForm.fields];
            updatedFields.splice(index, 1);
            setNewForm({ ...newForm, fields: updatedFields });
        } else {
            alert("At least one field is required!");
        }
    };

    const handleSubmit = async () => {
        if (newForm.fields.length === 0) {
            alert("You must add at least one field!");
            return;
        }

        const token = document.cookie.split(";").find((item) => item.trim().startsWith("token="))?.split("=")[1];

        try {
            const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/forms`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(newForm),
            });

            if (response.ok) {
                alert("Form created successfully!");
                setCreatingForm(false);
            } else {
                alert(`Error ${response.status}: Failed to create form.`);
            }
        } catch (error) {
            alert("Failed to create form. Network error.");
            console.error("Submission error:", error);
        }
    };

    return (
        <Form>
            <h3>Create New Form</h3>
            <Form.Group className="mb-3">
                <Form.Label><strong>Form Name</strong></Form.Label>
                <Form.Control
                    type="text"
                    value={newForm.name}
                    onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label><strong>Time Limit (seconds, optional)</strong></Form.Label>
                <Form.Control
                    type="number"
                    min="1"
                    value={newForm.timeLimit}
                    onChange={(e) => {
                        const value = e.target.value;
                        setNewForm({ ...newForm, timeLimit: value === "" ? "" : Number(value) });
                    }}
                />
            </Form.Group>

            {newForm.fields.map((field, index) => (
                <Form.Group key={index} className="mb-3 p-3 border rounded">
                    <Form.Label><strong>{index + 1}. Field Label</strong></Form.Label>
                    <Form.Control
                        type="text"
                        value={field.label}
                        onChange={(e) => handleFieldChange(index, "label", e.target.value)}
                    />
                    <Row className="mt-2 align-items-end">
                        <Col md={4}>
                            <Form.Label>Field Type</Form.Label>
                            <Form.Select
                                value={field.type}
                                onChange={(e) => handleFieldChange(index, "type", e.target.value)}
                            >
                                <option value="text">Text</option>
                                <option value="email">Email</option>
                                <option value="number">Number</option>
                                <option value="textarea">Textarea</option>
                                <option value="password">Password</option>
                                <option value="checkbox">Checkbox</option>
                                <option value="radio">Radio (1-5 Options)</option>
                            </Form.Select>
                        </Col>

                        {(field.type === "text" || field.type === "email" || field.type === "password" || field.type === "textarea") && (
                            <>
                                <Col md={3}>
                                    <Form.Label>Min Length</Form.Label>
                                    <Form.Control
                                        type="number"
                                        min="1"
                                        value={field.minLength}
                                        onChange={(e) => handleFieldChange(index, "minLength", e.target.value)}
                                    />
                                </Col>
                                <Col md={3}>
                                    <Form.Label>Max Length</Form.Label>
                                    <Form.Control
                                        type="number"
                                        min="1"
                                        value={field.maxLength}
                                        onChange={(e) => handleFieldChange(index, "maxLength", e.target.value)}
                                    />
                                </Col>
                            </>
                        )}

                        {field.type === "number" && (
                            <>
                                <Col md={3}>
                                    <Form.Label>Min Value</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={field.min}
                                        onChange={(e) => handleFieldChange(index, "min", e.target.value)}
                                    />
                                </Col>
                                <Col md={3}>
                                    <Form.Label>Max Value</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={field.max}
                                        onChange={(e) => handleFieldChange(index, "max", e.target.value)}
                                    />
                                </Col>
                            </>
                        )}
                        <Col md={2} className="d-flex justify-content-end">
                            <Button variant="danger" size="sm" onClick={() => handleRemoveField(index)}>
                                Remove
                            </Button>
                        </Col>
                    </Row>
                    {field.type === "radio" && (
                        <Form.Group className="mt-2">
                            <Form.Label>Options (comma-separated, max 5)</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Option1, Option2, Option3"
                                value={field.options?.join(", ") || ""}
                                onChange={(e) => handleOptionsChange(index, e.target.value)}
                            />
                        </Form.Group>
                    )}
                </Form.Group>
            ))}
            <Button variant="secondary" onClick={handleAddField} className="mb-3">+ Add Field</Button>
            <div>
                <Button variant="primary" onClick={handleSubmit} disabled={newForm.fields.length === 0}>Create Form</Button>
                <Button variant="link" onClick={() => setCreatingForm(false)}>Cancel</Button>
            </div>
        </Form>
    );
}
