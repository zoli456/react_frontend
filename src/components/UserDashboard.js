import { useState, useEffect } from "react";
import { Navbar, Nav, Dropdown, Container } from "react-bootstrap";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Profile from "./Profile";
import FormSelectScreen from "./FormSelectScreen";
import UserList from "./UserList";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles.css";
import { useTranslation } from "react-i18next";
import "./locales/i18n";

export default function UserDashboard({ user }) {
    const { t, i18n } = useTranslation();
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem("darkMode") === "true";
    });
    const [view, setView] = useState("welcome");

    const getToken = () => {
        return document.cookie.split(";").find((item) => item.trim().startsWith("token="))?.split("=")[1];
    };

    useEffect(() => {
        document.body.className = darkMode ? "dark-mode" : "light-mode";
        localStorage.setItem("darkMode", darkMode);
    }, [darkMode]);

    const toggleDarkMode = () => {
        setDarkMode(prevMode => !prevMode);
    };

    useEffect(() => {
        const savedLanguage = localStorage.getItem("language") || "en";
        i18n.changeLanguage(savedLanguage);
    }, [i18n]);

    const changeLanguage = (lang) => {
        i18n.changeLanguage(lang);
        localStorage.setItem("language", lang);
    };

    const handleLogout = async () => {
        if (!window.confirm(t("confirmLogout"))) return;
        try {
            await fetch(`${process.env.REACT_APP_BASE_URL}/api/logout`, {
                method: "POST",
                headers: { Authorization: `Bearer ${getToken()}` },
            });
        } catch (error) {
            console.error("Logout failed", error);
        }
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
        window.location.href = "/";
    };

    return (
        <div className={`${darkMode ? "dark-mode" : "light-mode"}`} style={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh'
        }}>
            {/* Navbar with dropdowns - removed overflow constraints here */}
            <Navbar bg={darkMode ? "dark" : "light"} variant={darkMode ? "dark" : "light"} expand="lg" className="shadow">
                <Container fluid>  {/* Changed to fluid to prevent horizontal cutoff */}
                    <Navbar.Brand href="#" onClick={() => setView("welcome")}>{t("home")}</Navbar.Brand>
                    <Nav className="ms-auto d-flex align-items-center">
                        <Button variant="link" onClick={() => setView("forms")}>{t("forms")}</Button>
                        {user.roles.includes("Admin") && (
                            <Button variant="link" onClick={() => setView("users")}>{t("userList")}</Button>
                        )}
                        <Button variant={darkMode ? "secondary" : "outline-dark"} onClick={toggleDarkMode}>
                            {darkMode ? "☀ " + t("lightMode") : "🌙 " + t("darkMode")}
                        </Button>
                        <Dropdown className="ms-3" align="end">
                            <Dropdown.Toggle variant={darkMode ? "secondary" : "primary"}>
                                🌍 {t("language")}
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item onClick={() => changeLanguage("en")}>🇺🇸 English</Dropdown.Item>
                                <Dropdown.Item onClick={() => changeLanguage("hu")}>🇭🇺 Magyar</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                        <Dropdown className="ms-3" align="end">
                            <Dropdown.Toggle variant={darkMode ? "secondary" : "primary"}>
                                {user.name}
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item onClick={() => setView("profile")}>{t("profile")}</Dropdown.Item>
                                <Dropdown.Divider />
                                <Dropdown.Item onClick={handleLogout}>{t("logout")}</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </Nav>
                </Container>
            </Navbar>

            {/* Scrollable content area */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '20px 0',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start'
            }}>
                {view === "welcome" && (
                    <Card className={`p-4 shadow-lg border-0 rounded-4 ${darkMode ? "bg-dark text-white" : "bg-light text-dark"}`} style={{ width: "700px" }}>
                        <h1>{t("welcome")}, {user.name}!</h1>
                    </Card>
                )}
                {view === "profile" && <Profile user={user} />}
                {view === "forms" && <FormSelectScreen user={user} />}
                {view === "users" && user.roles.includes("Admin") && <UserList />}
            </div>
        </div>
    );
}