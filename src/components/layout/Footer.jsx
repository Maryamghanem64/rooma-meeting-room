import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function Footer() {
  return (
    <footer className="footer text-light pt-5" style={{ background: "#2E5D4E" }}>
      <div className="container">
        <div className="row gy-4">
          {/* Logo & About */}
          <div className="col-md-4">
            <h4 className="fw-bold text-light mb-4">Rooma</h4>
            <p className="text-light">
              Smart meeting room management platform for teams who want
              productivity, simplicity, and efficiency in one place.
            </p>
          </div>

          {/* Navigation */}
          <div className="col-md-2">
            <h6 className="text-uppercase fw-bold mb-3 text-light">Navigation</h6>
            <ul className="list-unstyled">
              <li><a href="/" className="footer-link text-light">Home</a></li>
              <li><a href="/rooms" className="footer-link text-light">Rooms</a></li>
              <li><a href="/bookings" className="footer-link text-light">Bookings</a></li>
              <li><a href="/about" className="footer-link text-light">About</a></li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="col-md-3">
            <h6 className="text-uppercase fw-bold mb-3 text-light">Quick Links</h6>
            <ul className="list-unstyled">
              <li><a href="/faq" className="footer-link text-light">FAQ</a></li>
              <li><a href="/support" className="footer-link text-light">Support</a></li>
              <li><a href="/privacy" className="footer-link text-light">Privacy Policy</a></li>
              <li><a href="/terms" className="footer-link text-light">Terms & Conditions</a></li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div className="col-md-3">
            <h6 className="text-uppercase fw-bold mb-3 text-light">Contact</h6>
            <p className="mb-1 text-light"><i className="bi bi-geo-alt-fill me-2"></i> Beirut, Lebanon</p>
            <p className="mb-1 text-light"><i className="bi bi-envelope-fill me-2"></i> support@rooma.com</p>
            <p className="mb-3 text-light"><i className="bi bi-telephone-fill me-2"></i> +961 123 456</p>
            <div>
              <a href="#" className="footer-social text-light me-3"><i className="bi bi-facebook"></i></a>
              <a href="#" className="footer-social text-light me-3"><i className="bi bi-twitter"></i></a>
              <a href="#" className="footer-social text-light me-3"><i className="bi bi-instagram"></i></a>
              <a href="#" className="footer-social text-light"><i className="bi bi-linkedin"></i></a>
            </div>
          </div>
        </div>

        <hr className="border-light my-4" />

        {/* Bottom bar */}
        <div className="text-center pb-3">
          <small className="text-light">
            © {new Date().getFullYear()} Rooma. All Rights Reserved.
          </small>
        </div>
      </div>

     
    </footer>
  );
}