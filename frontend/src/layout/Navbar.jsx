import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const patrimoineLinks = [
  { to: "/patrimoine/materiel", label: "Materiel" },
  { to: "/patrimoine/logement", label: "Logement" },
  { to: "/patrimoine/vehicule", label: "Vehicule" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [patrimoineOpen, setPatrimoineOpen] = useState(false);

  const linkClass = ({ isActive }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? "bg-haigana-gold text-haigana-dark"
        : "text-white/90 hover:bg-white/10 hover:text-white"
    }`;

  return (
    <header className="bg-haigana-dark shadow-card sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/accueil" className="flex items-center">
            <img
              src="/Haigana.png"
              alt="Haigana"
              className="h-14 w-auto object-contain"
            />
          </Link>

          {/* Navigation desktop */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink to="/accueil" className={linkClass} end>
              Accueil
            </NavLink>

            <div
              className="relative"
              onMouseEnter={() => setPatrimoineOpen(true)}
              onMouseLeave={() => setPatrimoineOpen(false)}
            >
              <NavLink
                to="/patrimoine"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
                    isActive || patrimoineOpen
                      ? "bg-haigana-gold text-haigana-dark"
                      : "text-white/90 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                Patrimoine
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                >
                  <path
                    d="M2 4l4 4 4-4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
              </NavLink>

              {patrimoineOpen && (
                <div className="absolute left-0 top-full w-44 bg-white rounded-lg shadow-card overflow-hidden animate-in">
                  {patrimoineLinks.map((l) => (
                    <NavLink
                      key={l.to}
                      to={l.to}
                      className="block px-4 py-2.5 text-sm text-haigana-dark hover:bg-haigana-bg transition-colors"
                    >
                      {l.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>

            <NavLink to="/gestion" className={linkClass}>
              Gestion
            </NavLink>

            <NavLink to="/statistique" className={linkClass}>
              Statistique
            </NavLink>

            <NavLink to="/a-propos" className={linkClass}>
              A propos
            </NavLink>
          </nav>

          {/* Zone utilisateur */}
          <div className="hidden md:flex items-center gap-4">
            

            <div className="flex items-center gap-2">
              <div className="text-white text-sm leading-tight">
                <Link
                  to="/profil"
                  className="font-medium hover:underline"
                >
                  {user?.prenom} {user?.nom}
                </Link>

                <div className="text-white/60 text-xs">
                  {user?.role}
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              className="text-sm text-white/80 hover:text-haigana-gold transition-colors"
            >
              Deconnexion
            </button>
          </div>

          {/* Bouton hamburger mobile */}
          <button
            className="md:hidden text-white"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Menu"
          >
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
            >
              {mobileOpen ? (
                <path
                  d="M6 6l12 12M6 18L18 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      {mobileOpen && (
        <div className="md:hidden bg-haigana-dark border-t border-white/10 px-4 pb-4 space-y-1">
          <NavLink
            to="/accueil"
            className={linkClass}
            onClick={() => setMobileOpen(false)}
          >
            Accueil
          </NavLink>

          <div className="text-white/60 text-xs uppercase px-3 pt-3 pb-1">
            Patrimoine
          </div>

          {patrimoineLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={linkClass}
              onClick={() => setMobileOpen(false)}
            >
              {l.label}
            </NavLink>
          ))}

          <NavLink
            to="/gestion"
            className={linkClass}
            onClick={() => setMobileOpen(false)}
          >
            Gestion
          </NavLink>

          <NavLink
            to="/statistique"
            className={linkClass}
            onClick={() => setMobileOpen(false)}
          >
            Statistique
          </NavLink>

          <NavLink
            to="/a-propos"
            className={linkClass}
            onClick={() => setMobileOpen(false)}
          >
            A propos
          </NavLink>

          <NavLink
            to="/profil"
            className={linkClass}
            onClick={() => setMobileOpen(false)}
          >
            Mon profil ({user?.role})
          </NavLink>

          <button
            onClick={logout}
            className="w-full text-left px-3 py-2 text-sm text-haigana-gold"
          >
            Deconnexion
          </button>
        </div>
      )}
    </header>
  );
}
