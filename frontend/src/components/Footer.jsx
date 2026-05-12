export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-grid">
          <div>
            <strong>CourseNest</strong>
            <p>Mobile-first course platform for learning, sales, and delivery.</p>
          </div>
          <div>
            <strong>Contact</strong>
            <p>
              Email: <a href="mailto:rasoiroom31@gmail.com">rasoiroom31@gmail.com</a>
            </p>
            <p>
              Phone: <a href="tel:+918320191025">+91 8320191025</a>,{' '}
              <a href="tel:+917250939051">+91 7250939051</a>
            </p>
          </div>
          <div>
            <strong>Verification</strong>
            <p>Payment and support verification ke liye contact page available hai.</p>
          </div>
        </div>
        <p className="footer-copy">
          © {new Date().getFullYear()} <a href="https://elneb.in">ELNEB. All rights reserved.
        </a> </p>
      </div>
    </footer>
  );
}
