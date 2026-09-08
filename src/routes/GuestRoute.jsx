import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const GuestRoute = () => {
  const { accessToken } = useSelector((state) => state.auth);

  if (accessToken) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default GuestRoute;