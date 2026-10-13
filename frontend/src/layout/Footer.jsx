import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-haigana-dark text-white/80 mt-auto">

      {/*CONTENU PRINCIPAL*/}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/*IDENTITE*/}
          <div className="lg:col-span-2">

            <div className="flex items-center gap-4">

              <div className="w-24 h-16 flex items-center justify-center">
                <img
                  src="/Haigana.png"
                  alt="Haigana"
                  className="w-full h-full object-contain"
                />
              </div>

              <div>
                <div className="text-xl font-bold text-white">
                  Haigana
                </div>

                <div className="text-sm text-white/50">
                  DRBF — SRPE Boeny
                </div>
              </div>

            </div>

            <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/60">
              Système de gestion du budget et service permettant
              de centraliser le recensement, le suivi, l'affectation et
              la traçabilité des biens de la région Boeny.
            </p>

            {/* Badge institutionnel */}

              <span className="text-xs font-medium text-white/70">
                Direction Régionale du Budget et des Finances
              </span>

          </div>

          {/*NAVIGATION*/}
          <div>

            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Navigation
            </h3>

            <div className="mt-4 space-y-3 text-sm">

              <Link
                to="/"
                className="block text-white/60 hover:text-haigana-gold transition-colors"
              >
                Accueil
              </Link>

              <Link
                to="/patrimoine"
                className="block text-white/60 hover:text-haigana-gold transition-colors"
              >
                Patrimoine
              </Link>

              <Link
                to="/statistique"
                className="block text-white/60 hover:text-haigana-gold transition-colors"
              >
                Statistiques
              </Link>

              <Link
                to="/a-propos"
                className="block text-white/60 hover:text-haigana-gold transition-colors"
              >
                À propos
              </Link>

            </div>

          </div>

          {/*CONTACT*/}
          <div>

            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Contact
            </h3>

            <div className="mt-4 space-y-4 text-sm">

              {/* Email */}
              <a
                href="https://www.dgbf.mg/direction_pe"
                className="flex items-start gap-3 text-white/60 hover:text-white transition-colors group"
              >

                <div className="w-9 h-9 shrink-0 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-haigana-gold/10 transition-colors">

              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://w3.org">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.7"/>
                <path d="M12 12V17" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 7H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>


                </div>

                <div>
                  <p className="text-xs text-white/40">
                    Plus d'information
                  </p>

                  <p className="mt-0.5">
                    Direction du Patrimoine de l'État.
                  </p>
                </div>

              </a>

              {/* Facebook */}
              <a
                href="https://web.facebook.com/dgbfdgbf"
                target="_blank"
                rel="noreferrer"
                className="flex items-start gap-3 text-white/60 hover:text-white transition-colors group"
              >

                <div className="w-9 h-9 shrink-0 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-haigana-gold/10 transition-colors">

                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M22 12a10 10 0 10-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.4h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0022 12z" />
                  </svg>

                </div>

                <div>
                  <p className="text-xs text-white/40">
                    Réseau social
                  </p>

                  <p className="mt-0.5">
                    Page Facebook
                  </p>
                </div>

              </a>

            </div>

          </div>

        </div>
      </div>

      {/*SEPARATION*/}
      <div className="border-t border-white/10" />

      {/*BAS DE PAGE*/}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">

        <div className="flex flex-col md:flex-row items-center justify-between gap-3">

          <p className="text-xs sm:text-sm text-white/40 text-center md:text-left">
            © {new Date().getFullYear()} Haigana — Direction Régionale du
            Budget et des Finances, Boeny.
          </p>

          <div className="flex items-center gap-4 text-xs text-white/40">

            <Link
              to="/a-propos"
              className="hover:text-haigana-gold transition-colors"
            >
              À propos
            </Link>

            <span className="w-1 h-1 rounded-full bg-white/20" />

            <span>
              Haigana v1.0
            </span>

          </div>

        </div>

      </div>

    </footer>
  );
}