// AdminRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import Loading from "../components/common/Loading";
import { getUser } from "../features/auth/authSlice";

const AdminRoute = () => {
  const { accessToken, user, userLoading } = useSelector((state) => state.auth);

  if (userLoading)
    return <Loading />;

  if (!user)
    return <Loading />;

  if (user.role !== "admin")
    return <Navigate to="/" replace />;


  return <Outlet />;
};
export default AdminRoute;
