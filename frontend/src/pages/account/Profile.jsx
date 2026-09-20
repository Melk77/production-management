import { useState, useEffect } from "react";
import PageLayout from "../../components/layout/PageLayout";
import StatusBadge from "../../components/common/StatusBadge";
import { usersApi } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function Profile() {
  const { updateUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    setError("");
    usersApi
      .getMe()
      .then((r) => {
        const data = r.data;
        setProfile(data);
        setForm({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          password: "",
          confirmPassword: "",
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const f = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.password && form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
      };
      if (form.password) payload.password = form.password;

      const res = await usersApi.updateMe(payload);
      setProfile(res.data);
      updateUser({
        name: res.data.name,
        email: res.data.email,
        phone: res.data.phone,
      });
      setForm((p) => ({ ...p, password: "", confirmPassword: "" }));
      setSuccess("Profile updated successfully");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageLayout>
      <div className="page-header">
        <div className="page-header-left">
          <h1>My Profile</h1>
          <p>View and update your account details</p>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          {loading ? (
            <div className="no-results">Loading…</div>
          ) : (
            <>
              {profile && (
                <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                  <label>Role</label>
                  <div>
                    <StatusBadge status={profile.role} />
                  </div>
                  <small style={{ color: "var(--text-muted, #888)" }}>
                    Your role is assigned by an administrator and can't be
                    changed here.
                  </small>
                </div>
              )}

              {error && <div className="alert alert-error">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}

              <form onSubmit={save}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input
                      value={form.name}
                      onChange={f("name")}
                      required
                      placeholder="Your Name"
                    />
                  </div>
                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={f("email")}
                      required
                      placeholder="your@email.com"
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      value={form.phone}
                      onChange={f("phone")}
                      placeholder="+251 911 000000"
                    />
                  </div>
                  <div className="form-group">
                    <label>New Password (leave blank to keep current)</label>
                    <input
                      type="password"
                      value={form.password}
                      onChange={f("password")}
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="form-group">
                    <label>Confirm New Password</label>
                    <input
                      type="password"
                      value={form.confirmPassword}
                      onChange={f("confirmPassword")}
                      placeholder="••••••••"
                      disabled={!form.password}
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saving}
                  >
                    {saving ? "Saving…" : "Save Changes"}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
