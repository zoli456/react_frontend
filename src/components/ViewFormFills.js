import { useState, useEffect, useCallback } from "react";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import ListGroup from "react-bootstrap/ListGroup";
import Form from "react-bootstrap/Form";
import "bootstrap/dist/css/bootstrap.min.css";

export default function ViewFormFills({ formId, setViewingFills }) {
    const [fills, setFills] = useState([]);
    const [selectedFill, setSelectedFill] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    const getToken = () => {
        return document.cookie.split(";").find((item) => item.trim().startsWith("token="))?.split("=")[1];
    };

    const fetchFills = useCallback(async () => {
        try {
            const token = getToken();
            const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/forms/${formId}/answers`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            setFills(data.submissions.map(sub => ({
                id: sub.id,
                userId: sub.user.id,
                userName: sub.user.name,
                userEmail: sub.user.email,
                submittedAt: new Date(sub.created_at).toLocaleString(),
                answers: sub.answers
            })));
        } catch (error) {
            console.error("Error fetching form fills:", error);
        }
    }, [formId]); // Csak akkor fut újra, ha `formId` változik

    useEffect(() => {
        fetchFills();
    }, [fetchFills]);

    const handleDelete = async (submissionId) => {
        if (!window.confirm("Are you sure you want to delete this submission?")) return;
        try {
            const token = getToken();
            await fetch(`${process.env.REACT_APP_BASE_URL}/api/answers/${submissionId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            await fetchFills();
        } catch (error) {
            console.error("Error deleting submission:", error);
        }
    };

    const filteredFills = fills.filter(fill =>
        fill.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fill.userEmail.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Card className="p-4 shadow-lg border-0 rounded-4" style={{ width: "700px" }}>
            {selectedFill ? (
                <div>
                    <h3>Submission by {selectedFill.userName}</h3>
                    <ul className="list-group">
                        {Object.entries(selectedFill.answers).map(([key, value], index) => (
                            <li key={index} className="list-group-item">
                                <strong>{key.replace(/_/g, ' ')}:</strong> {typeof value === "boolean" ? (value ? "Yes" : "No") : value}
                            </li>
                        ))}
                    </ul>
                    <Button variant="secondary" className="mt-3" onClick={() => setSelectedFill(null)}>
                        Back
                    </Button>
                </div>
            ) : (
                <div>
                    <h3>Form Answers</h3>
                    <div className="d-flex align-items-center justify-content-between mb-3">
                        <Form.Control
                            type="text"
                            placeholder="Search by name or email"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ width: "80%" }}
                        />
                        <Button variant="primary" onClick={fetchFills}>
                            Refresh
                        </Button>
                    </div>
                    {filteredFills.length === 0 ? (
                        <p>No matching submissions found.</p>
                    ) : (
                        <ListGroup>
                            {filteredFills.map((fill) => (
                                <ListGroup.Item key={fill.id} className="d-flex justify-content-between align-items-center">
                                    <span onClick={() => setSelectedFill(fill)} style={{ cursor: "pointer" }}>
                                        {fill.userName} ({fill.userEmail}) - {fill.submittedAt}
                                    </span>
                                    <Button variant="danger" size="sm" onClick={() => handleDelete(fill.id)}>
                                        Delete
                                    </Button>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    )}
                    <Button variant="secondary" className="mt-3" onClick={() => setViewingFills(null)}>
                        Back
                    </Button>
                </div>
            )}
        </Card>
    );
}
