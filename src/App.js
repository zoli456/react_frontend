import { useState, useEffect } from "react";
import Container from "react-bootstrap/Container";
import AuthForm from "./components/AuthForm.js";
import UserDashboard from "./components/UserDashboard.js";

export default function AuthPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Add a loading state

  const getToken = () => {
    return document.cookie
        .split(";")
        .find((item) => item.trim().startsWith("token="))
        ?.split("=")[1];
  };

  const fetchUserData = async () => {
    try {
      const token = getToken();
      if (!token) return;

      const userResponse = await fetch(`${process.env.REACT_APP_BASE_URL}/api/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!userResponse.ok) throw new Error("Failed to fetch user data");

      const userData = await userResponse.json();
      setUser(userData);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  if (loading) {
    return (
        <Container className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
          <p>Loading...</p>
        </Container>
    );
  }

  return (
      <Container className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
        {user ? <UserDashboard user={user} /> : <AuthForm onLogin={fetchUserData} />}
      </Container>
  );
}
