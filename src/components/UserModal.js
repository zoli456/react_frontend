import React, { useState, useEffect, useCallback } from "react";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import { CheckCircle, XCircle } from "react-bootstrap-icons";

export default function UserModal({ user, onClose, getToken, onUpdate }) {
    const [updateStatus, setUpdateStatus] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [roles, setRoles] = useState([]);
    const [selectedRole, setSelectedRole] = useState("");
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showNameEmailModal, setShowNameEmailModal] = useState(false);
    const [field, setField] = useState("");
    const [value, setValue] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [retypePassword, setRetypePassword] = useState("");
    const [showRemoveRoleModal, setShowRemoveRoleModal] = useState(false);
    const [roleToRemove, setRoleToRemove] = useState(null)
    const [userDetails, setUserDetails] = useState(user);


    const fetchUserData = useCallback(async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/user/${user.id}`, {
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            if (!response.ok) throw new Error("Failed to fetch user data");

            const data = await response.json();
            setUserDetails(data);
        } catch (error) {
            console.error("Error fetching user details:", error);
        }
    }, [user.id, getToken]);

    useEffect(() => {
        fetch(`${process.env.REACT_APP_BASE_URL}/api/list-roles`, {
            headers: { Authorization: `Bearer ${getToken()}` }
        })
            .then(response => response.json())
            .then(data => setRoles(data))
            .catch(error => console.error("Error fetching roles:", error));
    }, [getToken]);

    useEffect(() => {
        fetchUserData(); // Fetch latest data when modal opens
    }, [fetchUserData]);

    const handleUpdate = async (endpoint, body, callback, method = "PUT") => {
        try {
            const response = await fetch(endpoint, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${getToken()}`,
                },
                body: JSON.stringify(body),
            });
            if (!response.ok) throw new Error("Failed to update");
            callback();
            await fetchUserData();
            onUpdate();
            setUpdateStatus("success");
            setTimeout(() => setUpdateStatus(null), 3000);
        } catch (error) {
            setUpdateStatus("error");
            setErrorMessage(error.message);
            setTimeout(() => setUpdateStatus(null), 5000);
        }
    };

    const handleAddRole = () => {
        const roleObject = roles.find(role => role.id.toString() === selectedRole); // Ensure type matching
        if (!roleObject) {
            setUpdateStatus("error");
            setErrorMessage("Invalid role selection");
            return;
        }

        handleUpdate(
            `${process.env.REACT_APP_BASE_URL}/api/user/${user.id}/add-role`,
            {role_id: roleObject.id},
            () => setShowRoleModal(false)
        );
     };

    const handleRemoveRole = () => {
        handleUpdate(
            `${process.env.REACT_APP_BASE_URL}/api/user/${user.id}/remove-role`,
            {role_id: roleToRemove.id},
            () => {setShowRemoveRoleModal(false);},
            "DELETE"
        );
     };

    const handlePasswordChange = () => handleUpdate(
        `${process.env.REACT_APP_BASE_URL}/api/user/${user.id}/update-user`,
        { newPassword, retypePassword },
        () => setShowPasswordModal(false)
    );

    const handleNameEmailChange = () => handleUpdate(
        `${process.env.REACT_APP_BASE_URL}/api/user/${user.id}/update-user`,
        { [field]: value },
        () => {setShowNameEmailModal(false);
        }
    );

    return (
        <>
            <Modal show onHide={onClose} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>User Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {updateStatus === "success" && <Alert variant="success"><CheckCircle /> Update successful</Alert>}
                    {updateStatus === "error" && <Alert variant="danger"><XCircle /> {errorMessage}</Alert>}
                    <p><strong>Name:</strong> <span onClick={() => { setField("name"); setValue(userDetails.name); setShowNameEmailModal(true); }}>{userDetails.name}</span></p>

                    <p><strong>Email:</strong> <span onClick={() => { setField("email"); setValue(userDetails.email); setShowNameEmailModal(true); }}>{userDetails.email}</span></p>

                    <p><strong>Roles:</strong> {userDetails.roles.length > 0 ? (
                        userDetails.roles.map(role => (
                            <span key={role.id} className="d-inline-flex align-items-center me-2">
            {role.name}
                                <Button variant="danger" size="sm" className="ms-1" onClick={() => { setRoleToRemove(role); setShowRemoveRoleModal(true); }}>×</Button>
        </span>
                        ))
                    ) : <em>User has no assigned roles</em>}</p>

                    <p><strong>Account Created:</strong> {new Date(userDetails.created_at).toLocaleString()}</p>
                    <p><strong>Last Modified:</strong> {new Date(userDetails.updated_at || userDetails.created_at).toLocaleString()}</p>
                    <Button onClick={() => setShowRoleModal(true)}>Add Role</Button>
                    <Button onClick={() => { setField("password"); setValue(""); setShowPasswordModal(true); }} className="ms-2">Change Password</Button>
                </Modal.Body>
            </Modal>
            <Modal show={showRoleModal} onHide={() => setShowRoleModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Role</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group>
                            <Form.Label>Select Role</Form.Label>
                            <Form.Control as="select" value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
                                <option value="">Select a role</option>
                                {roles.map(role => <option key={role.id} value={role.id}>{role.name}</option>)}
                            </Form.Control>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowRoleModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleAddRole}>Add Role</Button>
                </Modal.Footer>
            </Modal>
            <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Change Password</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group>
                            <Form.Label>New Password</Form.Label>
                            <Form.Control type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Retype Password</Form.Label>
                            <Form.Control type="password" value={retypePassword} onChange={(e) => setRetypePassword(e.target.value)} />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowPasswordModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handlePasswordChange}>Change Password</Button>
                </Modal.Footer>
            </Modal>
            <Modal show={showNameEmailModal} onHide={() => setShowNameEmailModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Change {field === "name" ? "Name" : "Email"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group>
                            <Form.Label>New {field === "name" ? "Name" : "Email"}</Form.Label>
                            <Form.Control type={field === "email" ? "email" : "text"} value={value} onChange={(e) => setValue(e.target.value)} />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowNameEmailModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleNameEmailChange}>Update</Button>
                </Modal.Footer>
            </Modal>
            <Modal show={showRemoveRoleModal} onHide={() => setShowRemoveRoleModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Remove Role</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to remove the role <strong>{roleToRemove?.name}</strong> from this user?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowRemoveRoleModal(false)}>Cancel</Button>
                    <Button variant="danger" onClick={handleRemoveRole}>Remove Role</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}
