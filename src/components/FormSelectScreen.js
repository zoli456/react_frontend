import { useState, useEffect } from "react";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import FillForm from "./FillForm";
import CreateForm from "./CreateForm";
import EditForm from "./EditForm";
import ViewFormFills from "./ViewFormFills";
import "bootstrap/dist/css/bootstrap.min.css";
import { BiRefresh } from "react-icons/bi";
import { useTranslation } from "react-i18next";
import "./locales/i18n";

export default function FormSelectScreen({ user }) {
    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedForm, setSelectedForm] = useState(null);
    const [creatingForm, setCreatingForm] = useState(false);
    const [editingForm, setEditingForm] = useState(null);
    const [viewingFills, setViewingFills] = useState(null);
    const { t, i18n } = useTranslation();

    const getToken = () => {
        return document.cookie.split(";").find((item) => item.trim().startsWith("token="))?.split("=")[1];
    };

    const fetchForms = async () => {
        setLoading(true);
        try {
            const token = getToken();
            const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/forms`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            setForms(data);
        } catch (error) {
            console.error("Error fetching forms:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchForms();
    }, []);

    const handleDeleteForm = async (formId) => {
        if (!window.confirm(t("question_delete_form"))) return;

        const token = getToken();
        try {
            await fetch(`${process.env.REACT_APP_BASE_URL}/api/forms/${formId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchForms();
        } catch (error) {
            alert(t("delete_failed"));
        }
    };

    const handleFormAction = () => {
        fetchForms();
        setSelectedForm(null);
        setCreatingForm(false);
        setEditingForm(null);
        setViewingFills(null);
    };

    return (
        <Card className="p-4 shadow-lg border-0 rounded-4" style={{ width: "700px" }}>
            {viewingFills ? (
                <ViewFormFills formId={viewingFills} setViewingFills={setViewingFills} />
            ) : selectedForm ? (
                <FillForm selectedForm={selectedForm} setSelectedForm={handleFormAction} />
            ) : editingForm ? (
                <EditForm editingForm={editingForm} setEditingForm={handleFormAction} />
            ) : creatingForm ? (
                <CreateForm setCreatingForm={handleFormAction} />
            ) : (
                <>
                    <div className="d-flex justify-content-between align-items-center">
                        <h3>{t("available_forms")}</h3>
                        <Button variant="secondary" onClick={fetchForms}>
                            <BiRefresh size={20} />
                        </Button>
                    </div>
                    {user.roles.includes("Admin") && (
                        <Button variant="primary" onClick={() => setCreatingForm(true)} className="mb-3">
                            {(t("create_form"))}
                        </Button>
                    )}
                    {loading ? (
                        <div className="text-center">
                            <Spinner animation="border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </Spinner>
                        </div>
                    ) : forms.length === 0 ? (
                        <p>No forms available.</p>
                    ) : (
                        <ul className="list-group">
                            {forms.map((form) => (
                                <li key={form.id} className="list-group-item d-flex justify-content-between align-items-center">
                                    <Button variant="link" onClick={() => setSelectedForm(form)}>
                                        {form.name}
                                    </Button>
                                    {user.roles.includes("Admin") && (
                                        <div>
                                            <Button variant="warning" className="me-2" onClick={() => setEditingForm(form)}>
                                                {t("edit")}
                                            </Button>
                                            <Button variant="danger" className="me-2" onClick={() => handleDeleteForm(form.id)}>
                                                {t("delete")}
                                            </Button>
                                            <Button variant="info" onClick={() => setViewingFills(form.id)}>
                                                {t("answers")}
                                            </Button>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </>
            )}
        </Card>
    );
}