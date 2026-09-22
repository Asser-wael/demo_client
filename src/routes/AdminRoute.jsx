// AdminRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import Loading from "../components/common/Loading";

const AdminRoute = () => {
  const { accessToken, user, userLoading } = useSelector((state) => state.auth);

  // Never logged in at all — nothing to wait on, send them straight to login.
  if (!accessToken) return <Navigate to="/login" replace />;

  // Logged in, still resolving who they are.
  if (userLoading) return <Loading />;

  // Had a token but the user fetch never resolved a user (expired/invalid
  // token, deleted account, etc.) — don't strand them on a spinner forever.
  if (!user) return <Navigate to="/login" replace />;

  if (user.role !== "admin") return <Navigate to="/" replace />;

  return <Outlet />;
};
export default AdminRoute;
