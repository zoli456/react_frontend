import { useState, useEffect } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import ProgressBar from "react-bootstrap/ProgressBar";
import 'bootstrap/dist/css/bootstrap.min.css';

export default function FillForm({ selectedForm, setSelectedForm }) {
    const [formToRender, setFormToRender] = useState(null);
    const [formData, setFormData] = useState({});
    const [timeLeft, setTimeLeft] = useState(null);
    let [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (selectedForm) {
            setFormToRender({
                ...selectedForm,
                fields: typeof selectedForm.fields === "string" ? JSON.parse(selectedForm.fields) : selectedForm.fields
            });
            setTimeLeft(selectedForm.timeLimit || null);
        }
    }, [selectedForm]);

    useEffect(() => {
        if (timeLeft === null || timeLeft <= 0 || submitting) return;

        const timer = setInterval(() => {
            setTimeLeft(prevTime => {
                if (prevTime <= 1) {
                    clearInterval(timer);
                    if (!submitting) handleFormSubmit(); // Ensure it only submits once
                    submitting = true;
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, submitting]);

    const handleFormInputChange = (e) => {
        const { name, type, value, checked } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleFormSubmit = async (e) => {
        if (e) e.preventDefault();
        if (submitting) return; // Prevent multiple submissions

        /*if (!Object.keys(formData).length) {
            alert("You must fill out at least one field before submitting.");
            return;
        }*/

        setSubmitting(true);

        const token = document.cookie.split(";").find((item) => item.trim().startsWith("token="))?.split("=")[1];
        if (!token || !formToRender) return;

        try {
            const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/forms/${formToRender.id}/submit`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ answers: formData }),
            });
            if (response.ok) {
                alert("Form submitted successfully!");
                setSelectedForm(null);
            } else {
                alert(`Error ${response.status}: Submission failed.`);
            }
        } catch (error) {
            alert("Failed to submit form. Please check your connection.");
        } finally {
            setSubmitting(false);
        }
    };

    if (!formToRender) {
        return <p>Loading form...</p>;
    }

    return (
        <Form onSubmit={handleFormSubmit}>
            <h3>{formToRender.name}</h3>

            {timeLeft !== null && (
                <>
                    <p>Time Left: {timeLeft} seconds</p>
                    <ProgressBar now={(timeLeft / (selectedForm.timeLimit || 1)) * 100} />
                </>
            )}

            {Array.isArray(formToRender.fields) && formToRender.fields.length > 0 ? (
                formToRender.fields.map((field, index) => {
                    const fieldName = field.label.replace(/\s+/g, "_");

                    return (
                        <Form.Group key={index} className="mb-3 p-3 border rounded">
                            <Form.Label><strong>{index + 1}. {field.label}</strong></Form.Label>

                            {field.type === "textarea" ? (
                                <Form.Control
                                    as="textarea"
                                    name={fieldName}
                                    value={formData[fieldName] || ""}
                                    onChange={handleFormInputChange}
                                    minLength={field.minLength || undefined}
                                    maxLength={field.maxLength || undefined}
                                    required
                                    style={{ width: "100%" }} // Makes input full width
                                />
                            ) : field.type === "radio" && field.options ? (
                                field.options.map((option, optIndex) => (
                                    <Form.Check
                                        key={optIndex}
                                        type="radio"
                                        label={option}
                                        name={fieldName}
                                        value={option}
                                        onChange={handleFormInputChange}
                                        checked={formData[fieldName] === option}
                                        required
                                    />
                                ))
                            ) : field.type === "checkbox" ? (
                                <Form.Check
                                    type="checkbox"
                                    label="Check if true"
                                    name={fieldName}
                                    checked={formData[fieldName] || false}
                                    onChange={handleFormInputChange}
                                />
                            ) : (
                                <Form.Control
                                    type={field.type}
                                    name={fieldName}
                                    value={formData[fieldName] || ""}
                                    onChange={handleFormInputChange}
                                    min={field.min || undefined}
                                    max={field.max || undefined}
                                    minLength={field.minLength || undefined}
                                    maxLength={field.maxLength || undefined}
                                    required
                                    style={{ width: "100%" }} // Makes input full width
                                />
                            )}
                        </Form.Group>
                    );
                })
            ) : (
                <p>No fields available.</p>
            )}

            <Button variant="primary" type="submit" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit"}
            </Button>
            <Button variant="link" onClick={() => setSelectedForm(null)}>Back</Button>
        </Form>
    );
}
