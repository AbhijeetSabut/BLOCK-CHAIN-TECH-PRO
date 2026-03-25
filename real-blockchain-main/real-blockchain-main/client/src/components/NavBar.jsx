import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import brandLogo from "../assets/brand-logo.png";

const linkClassName = ({ isActive }) =>
  [
    "rounded-full px-4 py-2 text-sm font-medium transition",
    isActive
      ? "bg-white/[0.12] text-white"
      : "text-slate-300 hover:bg-white/[0.06] hover:text-white"
  ].join(" ");

function NavBar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-20 pt-4 backdrop-blur-sm">
      <nav className="flex flex-col gap-4 rounded-[28px] border border-white/10 bg-slate-950/[0.65] px-5 py-4 shadow-[0_24px_90px_rgba(2,6,23,0.45)] sm:flex-row sm:items-center sm:justify-between">
        <Link to="/" className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl ring-1 ring-white/10">
            <img
              src={brandLogo}
              alt="Block Chain Technology logo"
              className="h-full w-full object-cover"
            />
          </span>
          <div>
            <p className="text-base font-semibold tracking-tight text-white">
              Block Chain Technology
            </p>
            <p className="mono text-xs uppercase tracking-[0.28em] text-slate-400">
              One-time delivery
            </p>
          </div>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <NavLink to="/" className={linkClassName}>
            Home
          </NavLink>
          {user ? (
            <>
              <NavLink to="/dashboard" className={linkClassName}>
                Dashboard
              </NavLink>
              <NavLink to="/blockchain-dashboard" className={linkClassName}>
                Blockchain
              </NavLink>
              <button
                type="button"
                onClick={logout}
                className="rounded-full border border-white/[0.12] px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/[0.08]"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={linkClassName}>
                Login
              </NavLink>
              <NavLink
                to="/register"
                className="rounded-full bg-gradient-to-r from-orange-400 to-teal-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:brightness-110"
              >
                Register
              </NavLink>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

export default NavBar;
