import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import 'bootstrap/dist/css/bootstrap.min.css';
import "./locales/i18n";

export default function AuthForm({ onLogin }) {
    const { t, i18n } = useTranslation();
    const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
    const [isLogin, setIsLogin] = useState(true);
    const [message, setMessage] = useState({ type: "", text: "" });

    useEffect(() => {
        // Load language from localStorage
        const savedLanguage = localStorage.getItem("language") || "en";
        i18n.changeLanguage(savedLanguage);
    }, [i18n]);

    const changeLanguage = (lang) => {
        i18n.changeLanguage(lang);
        localStorage.setItem("language", lang);
    };

    const handleChange = (e) => {
        setForm((prevForm) => ({ ...prevForm, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isLogin && form.password !== form.confirmPassword) {
            setMessage({ type: "danger", text: t("passwordMismatch") });
            return;
        }

        const { confirmPassword, ...formData } = form;
        const endpoint = isLogin ? `${process.env.REACT_APP_BASE_URL}/api/login` : `${process.env.REACT_APP_BASE_URL}/api/register`;

        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || t("errorOccurred"));
            }

            setMessage({ type: "success", text: data.message });
            setForm({ name: "", email: "", password: "", confirmPassword: "" });

            if (isLogin && data.token) {
                document.cookie = `token=${data.token}; path=/; secure`;
                onLogin();
            }
        } catch (error) {
            setMessage({ type: "danger", text: error.message });
        }
    };

    return (
        <div className="d-flex flex-column align-items-center">
            <Card style={{ width: "400px" }} className="p-4 shadow-lg border-0 rounded-4">
                <h1 className="text-center mb-4 fw-bold">{isLogin ? t("login") : t("register")}</h1>

                {message.text && (
                    <Alert variant={message.type} onClose={() => setMessage({ text: "" })} dismissible>
                        {message.text}
                    </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                    {!isLogin && (
                        <Form.Group className="mb-3">
                            <Form.Label>{t("name")}</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                    )}
                    <Form.Group className="mb-3">
                        <Form.Label>{t("email")}</Form.Label>
                        <Form.Control
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>{t("password")}</Form.Label>
                        <Form.Control
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>
                    {!isLogin && (
                        <Form.Group className="mb-3">
                            <Form.Label>{t("confirmPassword")}</Form.Label>
                            <Form.Control
                                type="password"
                                name="confirmPassword"
                                value={form.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                    )}
                    <Button variant="primary" type="submit">{isLogin ? t("login") : t("register")}</Button>
                    <Button variant="link" onClick={() => setIsLogin(!isLogin)}>
                        {isLogin ? t("needAccount") : t("haveAccount")}
                    </Button>
                </Form>
            </Card>

            {/* Language Selector Below the Card */}
            <div className="mt-3">
                <Button variant="secondary" size="sm" onClick={() => changeLanguage("en")}>
                    English
                </Button>
                <Button variant="secondary" size="sm" className="ms-2" onClick={() => changeLanguage("hu")}>
                    Magyar
                </Button>
            </div>
        </div>
    );
}
