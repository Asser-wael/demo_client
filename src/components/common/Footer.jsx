import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { FaFacebookF, FaTiktok } from "react-icons/fa";
import { FiArrowUp, FiShoppingBag, FiUser } from "react-icons/fi";

// Components Import
import Name from "../company/Name";
import Number from "../company/Number";
import Whatsapp from "../company/whatsapp";
import Instgrame from "../company/Instgrame";
import GoogleMaps from "../company/googleMaps";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { user } = useSelector((state) => state.auth || state.user || {});

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative mt-28 border-t border-[var(--border)] bg-[var(--card)] text-[var(--text)] transition-colors">
      
      {/* Top Banner Accent */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent opacity-40" />

      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-12">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-12">
          
          {/* Brand Info (Cols 1-4) */}
          <div className="flex flex-col justify-between space-y-6 lg:col-span-4">
            <div>
              <Link to="/" onClick={scrollToTop} className="inline-block">
                <Name className="text-3xl font-black uppercase tracking-widest text-[var(--text)] transition-opacity hover:opacity-80" />
              </Link>
              <p className="mt-4 max-w-sm text-xs leading-relaxed tracking-wide text-[var(--muted)] uppercase">
                Timeless fashion engineered with luxury design standards & premium quality craftsmanship.
              </p>
            </div>

            {/* Social Icons Stack */}
            <div className="flex items-center gap-3 pt-2">
              <Instgrame className="flex h-10 w-10 items-center justify-center rounded-none border border-[var(--border)] bg-transparent text-[var(--muted)] transition-all hover:border-[var(--text)] hover:text-[var(--text)]" />
              <Whatsapp className="flex h-10 w-10 items-center justify-center rounded-none border border-[var(--border)] bg-transparent text-[var(--muted)] transition-all hover:border-[var(--text)] hover:text-[var(--text)]" />
              
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="flex h-10 w-10 items-center justify-center border border-[var(--border)] bg-transparent text-[var(--muted)] transition-all hover:border-[var(--text)] hover:text-[var(--text)]"
              >
                <FaFacebookF size={14} />
              </a>

              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="flex h-10 w-10 items-center justify-center border border-[var(--border)] bg-transparent text-[var(--muted)] transition-all hover:border-[var(--text)] hover:text-[var(--text)]"
              >
                <FaTiktok size={14} />
              </a>
            </div>
          </div>

          {/* Quick Links / Shop (Cols 5-7) */}
          <div className="lg:col-span-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--text)]">
              Navigation
            </h4>
            <ul className="mt-6 space-y-3.5 text-xs font-medium text-[var(--muted)]">
              <li>
                <Link to="/" onClick={scrollToTop} className="transition-colors hover:text-[var(--text)]">
                  Home Collection
                </Link>
              </li>
              <li>
                <Link to="/products" onClick={scrollToTop} className="transition-colors hover:text-[var(--text)]">
                  All Catalog
                </Link>
              </li>
              <li>
                <Link to="/cart" onClick={scrollToTop} className="inline-flex items-center gap-2 transition-colors hover:text-[var(--text)]">
                  <FiShoppingBag size={14} />
                  Shopping Bag
                </Link>
              </li>
              <li>
                <Link to="/orders" onClick={scrollToTop} className="transition-colors hover:text-[var(--text)]">
                  Track Orders
                </Link>
              </li>
            </ul>
          </div>

          {/* Account (Cols 8-9) */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--text)]">
              Account
            </h4>
            <ul className="mt-6 space-y-3.5 text-xs font-medium text-[var(--muted)]">
              {user ? (
                <>
                  <li>
                    <Link to="/profile" onClick={scrollToTop} className="inline-flex items-center gap-2 text-[var(--text)] transition-colors hover:opacity-80">
                      <FiUser size={14} />
                      {user.name || "My Account"}
                    </Link>
                  </li>
                  <li>
                    <Link to="/orders" onClick={scrollToTop} className="transition-colors hover:text-[var(--text)]">
                      Order History
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link to="/login" onClick={scrollToTop} className="inline-flex items-center gap-2 transition-colors hover:text-[var(--text)]">
                      <FiUser size={14} />
                      Sign In
                    </Link>
                  </li>
                  <li>
                    <Link to="/register" onClick={scrollToTop} className="transition-colors hover:text-[var(--text)]">
                      Create Account
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Contact & Store (Cols 10-12) */}
          <div className="lg:col-span-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--text)]">
              Client Service
            </h4>
            <div className="mt-6 space-y-4 text-xs font-medium text-[var(--muted)]">
              <div className="flex items-center gap-3">
                <Number className="text-[var(--text)] font-semibold" />
              </div>
              <div className="flex items-start gap-3">
                <GoogleMaps className="leading-relaxed hover:text-[var(--text)] transition-colors" />
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-[var(--border)] pt-8 text-[11px] font-medium tracking-wider text-[var(--muted)] sm:flex-row">
          <p>© {currentYear} <Name className="inline" />. ALL RIGHTS RESERVED.</p>
          <div className="flex items-center gap-6 uppercase">
            <Link to="/products" onClick={scrollToTop} className="hover:text-[var(--text)]">Shop</Link>
            <Link to="/cart" onClick={scrollToTop} className="hover:text-[var(--text)]">Cart</Link>
            <Link to="/orders" onClick={scrollToTop} className="hover:text-[var(--text)]">Orders</Link>
          </div>
        </div>
      </div>

      {/* Floating Scroll Top */}
      <button
        onClick={scrollToTop}
        aria-label="Scroll to top"
        className="fixed bottom-6 right-6 z-50 flex h-10 w-10 items-center justify-center border border-[var(--border)] bg-[var(--card)] text-[var(--text)] shadow-md transition-all hover:bg-[var(--text)] hover:text-[var(--bg)]"
      >
        <FiArrowUp size={16} />
      </button>
    </footer>
  );
}