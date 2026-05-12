import { useEffect } from "react";

export default function AboutPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main>
      {/* Hero Section */}
      <section className="section about-hero">
        <div className="container">
          <div className="hero-content animate-fade-in">
            <h1>About CourseNest</h1>
            <p className="lead">
              Empowering educators and entrepreneurs to sell courses with confidence
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="section">
        <div className="container">
          <div className="about-grid">
            <div className="about-card animate-slide-up">
              <h2>Our Mission</h2>
              <p>
                To make course selling accessible to everyone. We provide a simple, secure platform
                that converts your Instagram traffic into paying students with instant course access
                and professional communication.
              </p>
            </div>
            <div className="about-card animate-slide-up" style={{ "--delay": "0.1s" }}>
              <h2>Why CourseNest?</h2>
              <ul className="feature-list">
                <li>✓ Mobile-first design for Instagram traffic</li>
                <li>✓ Secure Razorpay payment integration</li>
                <li>✓ Instant course access after payment</li>
                <li>✓ Professional admin dashboard</li>
                <li>✓ Automated email notifications</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Find Us</h2>
          <div className="location-grid">
            <div className="map-container animate-slide-up">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3601.923476274369!2d75.8578!3d26.8883!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x396c4c6e0000001f%3A0x1234567890abcdef!2sJaipur%2C%20Rajasthan!5e0!3m2!1sen!2sin!4v1234567890"
                width="100%"
                height="400"
                style={{ border: 0, borderRadius: "16px" }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="CourseNest Office Location"
              />
            </div>
            <div className="address-card animate-slide-up" style={{ "--delay": "0.1s" }}>
              <h3>Our Location</h3>
              <div className="address-info">
                <p>
                  <strong>City:</strong> Jaipur, Rajasthan
                </p>
                <p>
                  <strong>Email:</strong>{" "}
                  <a href="mailto:rasoiroom31@gmail.com">rasoiroom31@gmail.com</a>
                </p>
                <p>
                  <strong>Phone:</strong>{" "}
                  <a href="tel:+918320191025">+91 8320191025</a>
                </p>
                <p>
                  <a href="tel:+917250939051">+91 7250939051</a>
                </p>
              </div>
              <div className="contact-buttons">
                <a href="mailto:rasoiroom31@gmail.com" className="btn-primary">
                  Email Us
                </a>
                <a href="https://wa.me/918320191025" className="btn-secondary">
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team & Trust Section */}
      <section className="section trust-section">
        <div className="container">
          <h2 className="section-title">Why Trust Us?</h2>
          <div className="trust-grid">
            <div className="trust-card animate-scale-in">
              <div className="trust-icon">🔒</div>
              <h3>Secure Payments</h3>
              <p>Razorpay verified payment gateway for safe transactions</p>
            </div>
            <div className="trust-card animate-scale-in" style={{ "--delay": "0.1s" }}>
              <div className="trust-icon">⚡</div>
              <h3>Instant Access</h3>
              <p>Students get immediate course access after successful payment</p>
            </div>
            <div className="trust-card animate-scale-in" style={{ "--delay": "0.2s" }}>
              <div className="trust-icon">📧</div>
              <h3>Professional Communication</h3>
              <p>Automated emails for payments, enrollment, and course access</p>
            </div>
            <div className="trust-card animate-scale-in" style={{ "--delay": "0.3s" }}>
              <div className="trust-icon">📱</div>
              <h3>Mobile Optimized</h3>
              <p>Perfect for converting Instagram and mobile traffic</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section cta-section">
        <div className="container">
          <div className="cta-box animate-fade-in">
            <h2>Ready to Start Selling Courses?</h2>
            <p>Join us and reach your students today</p>
            <a href="/" className="btn-primary btn-large">
              Explore Courses
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
