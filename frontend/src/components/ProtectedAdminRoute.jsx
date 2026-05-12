import { Navigate } from "react-router-dom";
import { useAdminAuth } from "../context/AuthContext";

export default function ProtectedAdminRoute({ children }) {
  const { adminToken, isInitialized } = useAdminAuth();

  if (!isInitialized) {
    return (
      <section className="section">
        <div className="container narrow">
          <p>Loading...</p>
        </div>
      </section>
    );
  }

  if (!adminToken) {
    return <Navigate to="/admin-login" replace />;
  }

  return children;
}
