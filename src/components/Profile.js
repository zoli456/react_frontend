import { useState } from "react";
import Card from "react-bootstrap/Card";
import ListGroup from "react-bootstrap/ListGroup";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useTranslation } from "react-i18next";
import "./locales/i18n";

export default function Profile({ user }) {
    const { t, i18n } = useTranslation();
    const [email, setEmail] = useState(user.email);
    const [newEmail, setNewEmail] = useState("");
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [retypePassword, setRetypePassword] = useState("");
    const [showEmailForm, setShowEmailForm] = useState(false);
    const [showPasswordForm, setShowPasswordForm] = useState(false);

    const getToken = () => {
        return document.cookie.split(";").find((item) => item.trim().startsWith("token="))?.split("=")[1];
    };

    const handleEmailChange = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/user`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${getToken()}`
                },
                body: JSON.stringify({ email: newEmail })
            });
            if (response.ok) {
                setEmail(newEmail);
                setShowEmailForm(false);
                alert(t("email_update_successfull"));
            } else {
                alert("email_update_failed");
            }
        } catch (error) {
            console.error("Error updating email:", error);
        }
    };

    const handlePasswordChange = async () => {
        if (newPassword !== retypePassword) {
            alert(t("password_not_match"));
            return;
        }
        try {
            const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/user`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${getToken()}`
                },
                body: JSON.stringify({ oldPassword, newPassword, retypePassword })
            });
            if (response.ok) {
                setOldPassword("");
                setNewPassword("");
                setRetypePassword("");
                setShowPasswordForm(false);
                alert(t("password_change_success"));
            } else {
                alert(t("password_change_failed"));
            }
        } catch (error) {
            console.error("Error changing password:", error);
        }
    };

    return (
        <Container className="d-flex justify-content-center align-items-center vh-100">
            {showEmailForm ? (
                <Card className="p-4 shadow-lg border-0 rounded-4" style={{ width: "700px" }}>
                    <Card.Body>
                        <Card.Title className="text-center">{t("change_email")}</Card.Title>
                        <Form>
                            <Form.Group>
                                <Form.Label>{t("new_email")}</Form.Label>
                                <Form.Control type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
                            </Form.Group>
                            <Button className="mt-2" variant="success" onClick={handleEmailChange}>{t("submit")}</Button>
                            <Button className="mt-2" variant="secondary" onClick={() => setShowEmailForm(false)}>{t("cancel")}</Button>
                        </Form>
                    </Card.Body>
                </Card>
            ) : showPasswordForm ? (
                <Card className="p-4 shadow-lg border-0 rounded-4" style={{ width: "700px" }}>
                    <Card.Body>
                        <Card.Title className="text-center">{t("change_password")}</Card.Title>
                        <Form>
                            <Form.Group>
                                <Form.Label>{t("old_password")}</Form.Label>
                                <Form.Control type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>{t("new_password")}</Form.Label>
                                <Form.Control type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>{t("retype_password")}</Form.Label>
                                <Form.Control type="password" value={retypePassword} onChange={(e) => setRetypePassword(e.target.value)} />
                            </Form.Group>
                            <Button className="mt-2" variant="success" onClick={handlePasswordChange}>{t("submit")}</Button>
                            <Button className="mt-2" variant="secondary" onClick={() => setShowPasswordForm(false)}>{t("cancel")}</Button>
                        </Form>
                    </Card.Body>
                </Card>
            ) : (
                <Card className="p-4 shadow-lg border-0 rounded-4" style={{ width: "700px" }}>
                    <Card.Body>
                        <Card.Title className="text-center">{t("userprofile")}</Card.Title>
                        <ListGroup variant="flush">
                            <ListGroup.Item><strong>{t("name")}</strong> {user.name}</ListGroup.Item>
                            <ListGroup.Item><strong>{t("email")}</strong> {email}</ListGroup.Item>
                            <ListGroup.Item><strong>{t("roles")}</strong> {user.roles.join(", ")}</ListGroup.Item>
                        </ListGroup>
                        <div className="mt-3 d-flex flex-column gap-2">
                            <Button variant="primary" onClick={() => setShowEmailForm(true)}>{t("change_email")}</Button>
                            <Button variant="danger" onClick={() => setShowPasswordForm(true)}>{t("change_password")}</Button>
                        </div>
                    </Card.Body>
                </Card>
            )}
        </Container>
    );
}
