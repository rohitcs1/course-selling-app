export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="container footer-inner">
          <div className="footer-grid">
            {/* About Section */}
            <div className="footer-section">
              <div className="footer-icon">🚀</div>
              <h3>CourseNest</h3>
              <p>Mobile-first course platform for learning, sales, and delivery.</p>
              <div className="social-links">
                <a href="#" aria-label="Facebook" className="social-icon">f</a>
                <a href="#" aria-label="Twitter" className="social-icon">𝕏</a>
                <a href="#" aria-label="LinkedIn" className="social-icon">in</a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="footer-section">
              <h3>Quick Links</h3>
              <ul className="footer-links">
                <li><a href="/">Home</a></li>
                <li><a href="#courses">Courses</a></li>
                <li><a href="/about">About</a></li>
                <li><a href="/contact">Contact</a></li>
              </ul>
            </div>

            {/* Contact Section */}
            <div className="footer-section">
              <h3>📧 Contact</h3>
              <div className="contact-info">
                <p>
                  <a href="mailto:rasoiroom31@gmail.com">rasoiroom31@gmail.com</a>
                </p>
                <p>
                  <a href="tel:+918320191025">+91 8320191025</a>
                </p>
                <p>
                  <a href="tel:+917250939051">+91 7250939051</a>
                </p>
              </div>
            </div>

            {/* Support Section */}
            <div className="footer-section">
              <h3>Support</h3>
              <ul className="footer-links">
                <li><a href="/contact">Help Center</a></li>
                <li><a href="/contact">Payment Verification</a></li>
                <li><a href="/contact">Report Issue</a></li>
                <li><a href="/contact">FAQ</a></li>
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="footer-divider"></div>

          {/* Footer Bottom */}
          <div className="footer-bottom">
            <p className="footer-copy">
              © {new Date().getFullYear()} <a href="https://elneb.in">ELNEB</a>. All rights reserved.
            </p>
            <div className="footer-bottom-links">
              <a href="#privacy">Privacy Policy</a>
              <span>•</span>
              <a href="#terms">Terms of Service</a>
              <span>•</span>
              <a href="#cookies">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
