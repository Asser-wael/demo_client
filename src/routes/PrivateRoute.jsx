import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const PrivateRoute = () => {
  const { accessToken } = useSelector((state) => state.auth);
  if (!accessToken) return <Navigate to="/login" replace />;
  return <Outlet />;
};
export default PrivateRoute;