import { useState, useEffect, useCallback } from "react";
import Card from "react-bootstrap/Card";
import ListGroup from "react-bootstrap/ListGroup";
import Spinner from "react-bootstrap/Spinner";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { FaTimes } from "react-icons/fa";
import UserModal from "./UserModal";
import {BiRefresh} from "react-icons/bi";

export default function UserList({ }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);

    const getToken = () => {
        return document.cookie.split(";").find((item) => item.trim().startsWith("token="))?.split("=")[1];
    };

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/users`, {
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            if (!response.ok) throw new Error("Failed to fetch users");
            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);


   /* useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);*/

    const handleUserUpdate = () => {
        fetchUsers();
    };

    const handleDelete = async (userId) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;

        try {
            const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/user/${userId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            if (!response.ok) throw new Error("Failed to delete user");
            fetchUsers();
        } catch (error) {
            console.error("Error deleting user:", error);
        }
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Card className="p-4 shadow-lg border-0 rounded-4" style={{ width: "600px" }}>
            <h3>User List</h3>

            <div className="d-flex gap-2 mb-3">
                <Form.Control
                    type="text"
                    placeholder="Search by name or email"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <Button variant="primary" onClick={fetchUsers} disabled={loading}>
                    {loading ? <Spinner as="span" animation="border" size="sm" /> : <BiRefresh size={20} />}
                </Button>
            </div>

            {loading ? (
                <Spinner animation="border" />
            ) : (
                <ListGroup>
                    {filteredUsers.map((user) => (
                        <ListGroup.Item key={user.id} className="d-flex justify-content-between align-items-center">
                            <span onClick={() => setSelectedUser(user)} style={{ cursor: "pointer" }}>
                                {user.name} ({user.email})
                            </span>
                            <Button variant="danger" size="sm" onClick={() => handleDelete(user.id)}>
                                <FaTimes />
                            </Button>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            )}

            {selectedUser && (
                <UserModal
                    user={selectedUser}
                    onClose={() => setSelectedUser(null)}
                    baseURL={process.env.REACT_APP_BASE_URL}
                    getToken={getToken}
                    onUpdate={handleUserUpdate}
                />
            )}
        </Card>
    );
}