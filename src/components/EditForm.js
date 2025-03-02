import { useState, useEffect } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

export default function EditForm({ editingForm, setEditingForm }) {
    const [updatedForm, setUpdatedForm] = useState({ name: "", fields: [], timeLimit: "" });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (editingForm) {
            setUpdatedForm({
                name: editingForm.name,
                timeLimit: editingForm.timeLimit || "",
                fields: typeof editingForm.fields === "string" ? JSON.parse(editingForm.fields) : editingForm.fields
            });
        }
    }, [editingForm]);

    const handleFieldChange = (index, key, value) => {
        const newFields = [...updatedForm.fields];
        newFields[index][key] = value;
        setUpdatedForm({ ...updatedForm, fields: newFields });
    };

    const handleOptionsChange = (index, value) => {
        const options = value.split(",").map(opt => opt.trim()).slice(0, 5);
        handleFieldChange(index, "options", options);
    };

    const handleAddField = () => {
        setUpdatedForm({
            ...updatedForm,
            fields: [...updatedForm.fields, { label: "", type: "text", options: [], minLength: "", maxLength: "", min: "", max: "" }]
        });
    };

    const handleRemoveField = (index) => {
        if (updatedForm.fields.length > 1) {
            const newFields = [...updatedForm.fields];
            newFields.splice(index, 1);
            setUpdatedForm({ ...updatedForm, fields: newFields });
        } else {
            alert("At least one field is required!");
        }
    };

    const handleSave = async () => {
        if (updatedForm.fields.length === 0) {
            alert("You must have at least one field.");
            return;
        }

        setSubmitting(true);
        const token = document.cookie.split(";").find((item) => item.trim().startsWith("token="))?.split("=")[1];

        try {
            const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/forms/${editingForm.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: updatedForm.name,
                    timeLimit: updatedForm.timeLimit,
                    fields: updatedForm.fields
                }),
            });

            if (response.ok) {
                alert("Form updated successfully!");
                setEditingForm(null);
            } else {
                alert(`Error ${response.status}: Failed to update form.`);
            }
        } catch (error) {
            alert("Failed to update form. Network error.");
            console.error("Update error:", error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Form>
            <h3>Edit Form</h3>
            <Form.Group className="mb-3">
                <Form.Label><strong>Form Name</strong></Form.Label>
                <Form.Control
                    type="text"
                    value={updatedForm.name}
                    onChange={(e) => setUpdatedForm({ ...updatedForm, name: e.target.value })}
                />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label><strong>Time Limit (seconds, optional)</strong></Form.Label>
                <Form.Control
                    type="number"
                    min="1"
                    value={updatedForm.timeLimit}
                    onChange={(e) => {
                        const value = e.target.value;
                        setUpdatedForm({ ...updatedForm, timeLimit: value === "" ? "" : Number(value) });
                    }}
                />
            </Form.Group>

            {updatedForm.fields.map((field, index) => (
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
                            <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleRemoveField(index)}
                                disabled={updatedForm.fields.length === 1}
                            >
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

                    {field.type === "checkbox" && (
                        <Form.Check
                            className="mt-2"
                            type="checkbox"
                            label="Default checked"
                            checked={field.checked}
                            onChange={(e) => handleFieldChange(index, "checked", e.target.checked)}
                        />
                    )}
                </Form.Group>
            ))}

            <Button variant="secondary" onClick={handleAddField} className="mb-3">+ Add Field</Button>
            <div>
                <Button
                    variant="primary"
                    onClick={handleSave}
                    disabled={submitting || updatedForm.fields.length === 0}
                >
                    {submitting ? "Saving..." : "Save Changes"}
                </Button>
                <Button variant="link" onClick={() => setEditingForm(null)}>Cancel</Button>
            </div>
        </Form>
    );
}