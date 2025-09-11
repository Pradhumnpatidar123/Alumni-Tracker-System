import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { API_ALUMNI_URL } from "../../utils";
import { useAuth } from "../../context/AuthContext";

function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  const {loginAlumni, checkAuthStatus}=useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [flash, setFlash] = useState(() => {
    const msg = location.state?.message ?? "";
    const err = location.state?.error ?? "";
    return msg || err ? { type: err ? "error" : "success", text: msg || err } : null;
  });

  // Clear one-time navigation state so it doesn't persist across refresh/back
  useEffect(() => {
    if (location.state) {
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;

    if (!email || !password) {
      setFlash({ type: "error", text: "Email and password are required" });
      return;
    }

    setSubmitting(true);
    setFlash(null);

    try {
        // const res = await fetch(`${API_ALUMNI_URL}/alumniLogin`, {
        //   method: "POST",
        //   headers: { "Content-Type": "application/json" },
        //   credentials: "include", // include cookies if backend uses session auth
        //   body: JSON.stringify({ email, password }),
        // });
        const res=await loginAlumni(email,password);
        console.log(res);

      // Try to parse the body safely
      // let data = res.json();
      // try { data = await res.json(); } catch { /* ignore parse errors */ }

      if (res.success) {
        // Force auth context to refresh
        await checkAuthStatus();
        // Adjust redirect path as needed for the app (e.g., '/alumni/dashboard')
        navigate("/alumniHome", { replace: true, state:  "Login successful"  });
      } else {
        const message = res?.message || "Invalid email or password";
        setFlash({ type: "error", text: message });
        
    }} catch(error) {
      console.log(error);
      setFlash({ type: "error", text: "Network error. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="wrapper">
      <div className="about wow fadeInUp" data-wow-delay="0.1s">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-5 col-md-6">
              <div className="about-img">
                <img src="img/adminVector.jpg" alt="Image" />
              </div>
            </div>
            <div className="col-lg-7 col-md-6">
              <div className="section-header text-left">
                <h3>Alumni panel | Login</h3>
                <span aria-live="polite" style={{ display: "block", minHeight: 24, color: flash?.type === "error" ? "#b00020" : "#0c6" }}>
                  {flash?.text}
                </span>
              </div>
              <div className="about-text">
                <form className="form-group" onSubmit={handleSubmit} noValidate>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Enter Email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  /><br />
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Enter Password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  /><br />
                  <input
                    type="submit"
                    className="btn btn-warning btn-block w-100 mb-2"
                    value={submitting ? "Logging in..." : "Login"}
                    disabled={submitting}
                  /><br />
                  <input
                    type="reset"
                    className="btn btn-danger btn-block"
                    style={{ width: "100%" }}
                    value="Reset"
                    onClick={() => { setEmail(""); setPassword(""); setFlash(null); }}
                    disabled={submitting}
                  />
                </form>
                <Link to="/signup">Yet Not Registered ? Register Here</Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <a href="#" className="back-to-top"><i className="fa fa-chevron-up"></i></a>
    </div>
  );
}

export default Login;
