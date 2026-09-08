import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProfile,
  updateProfile,
  changePassword,
  clearAccountMessages,
} from "../features/account/accountSlice";

const Account = () => {
  const dispatch = useDispatch();
  const { profile, loading, error, successMessage } = useSelector(
    (state) => state.account
  );

  const [form, setForm] = useState({ name: "", email: "" });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
  });

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  useEffect(() => {
    if (profile) {
      setForm({ name: profile.name || "", email: profile.email || "" });
    }
  }, [profile]);

  useEffect(() => {
    if (successMessage || error) {
      const timer = setTimeout(() => dispatch(clearAccountMessages()), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, error, dispatch]);

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    dispatch(updateProfile(form));
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    dispatch(changePassword(passwordForm));
    setPasswordForm({ currentPassword: "", newPassword: "" });
  };

  if (loading && !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg px-4 py-10">
      <div className="mx-auto max-w-2xl space-y-8">
        <h1 className="text-3xl text-text">My Account</h1>

        {(error || successMessage) && (
          <div
            className={`rounded-xl px-4 py-3 text-sm ${
              error
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {error || successMessage}
          </div>
        )}

        {/* Profile Info */}
        <form onSubmit={handleProfileSubmit} className="card space-y-4 p-6">
          <h2 className="text-xl text-text">Profile Info</h2>

          <div>
            <label className="mb-1 block text-sm text-muted">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-muted">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="rounded-lg px-3 py-2"
            />
          </div>

          <button type="submit" className="btn-primary rounded-lg px-5 py-2.5" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>

        {/* Change Password */}
        <form onSubmit={handlePasswordSubmit} className="card space-y-4 p-6">
          <h2 className="text-xl text-text">Change Password</h2>

          <div>
            <label className="mb-1 block text-sm text-muted">Current Password</label>
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
              }
              className="rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-muted">New Password</label>
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, newPassword: e.target.value })
              }
              className="rounded-lg px-3 py-2"
            />
          </div>

          <button type="submit" className="btn-primary rounded-lg px-5 py-2.5" disabled={loading}>
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Account;