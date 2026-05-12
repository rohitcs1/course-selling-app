import { useState, useEffect } from "react";

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, this would send to backend
    console.log("Contact form submitted:", formData);
    setSubmitted(true);
    setFormData({ name: "", email: "", message: "" });
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <main>
      {/* Hero Section */}
      <section className="section contact-hero">
        <div className="container">
          <div className="hero-content animate-fade-in">
            <h1>Get in Touch</h1>
            <p className="lead">We're here to help and answer any questions you might have</p>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="section">
        <div className="container">
          <div className="contact-methods animate-slide-up">
            <div className="contact-method">
              <div className="method-icon">📧</div>
              <h3>Email</h3>
              <a href="mailto:rasoiroom31@gmail.com">rasoiroom31@gmail.com</a>
              <p>Response time: 24 hours</p>
            </div>
            <div className="contact-method">
              <div className="method-icon">📞</div>
              <h3>Call Us</h3>
              <a href="tel:+918320191025">+91 8320191025</a>
              <a href="tel:+917250939051">+91 7250939051</a>
              <p>Available 9AM - 6PM IST</p>
            </div>
            <div className="contact-method">
              <div className="method-icon">💬</div>
              <h3>WhatsApp</h3>
              <a href="https://wa.me/918320191025">Chat with us</a>
              <p>Available 9AM - 6PM IST</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Contact Grid */}
      <section className="section">
        <div className="container">
          <div className="contact-grid">
            {/* Contact Form */}
            <div className="contact-form-container animate-slide-up">
              <h2>Send us a Message</h2>
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-group">
                  <label htmlFor="name">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your full name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us more about your query..."
                    rows="5"
                    required
                  />
                </div>
                <button type="submit" className="btn-primary">
                  Send Message
                </button>
                {submitted && (
                  <p className="success-message">✓ Thank you! We'll get back to you soon.</p>
                )}
              </form>
            </div>

            {/* Location Map */}
            <div className="map-container-contact animate-slide-up" style={{ "--delay": "0.1s" }}>
              <h2>Our Location</h2>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3601.923476274369!2d75.8578!3d26.8883!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x396c4c6e0000001f%3A0x1234567890abcdef!2sJaipur%2C%20Rajasthan!5e0!3m2!1sen!2sin!4v1234567890"
                width="100%"
                height="300"
                style={{ border: 0, borderRadius: "16px", marginBottom: "1rem" }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="CourseNest Office Location"
              />
              <div className="location-info">
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
                <a href="https://wa.me/918320191025" className="btn-secondary" style={{ marginTop: "0.5rem" }}>
                  WhatsApp Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section testimonials-section">
        <div className="container">
          <h2 className="section-title">What Our Users Say</h2>
          <div className="testimonials-grid">
            <div className="testimonial-card animate-scale-in">
              <div className="stars">⭐⭐⭐⭐⭐</div>
              <p className="testimonial-text">
                "CourseNest made it so easy to sell my courses! The admin panel is intuitive and
                the payment integration is seamless. Highly recommended!"
              </p>
              <p className="testimonial-author">— Priya Kumar, Course Creator</p>
            </div>
            <div className="testimonial-card animate-scale-in" style={{ "--delay": "0.1s" }}>
              <div className="stars">⭐⭐⭐⭐⭐</div>
              <p className="testimonial-text">
                "I converted my Instagram followers into paying students within the first month.
                The mobile-first design is perfect for social media traffic."
              </p>
              <p className="testimonial-author">— Rajesh Sharma, Educator</p>
            </div>
            <div className="testimonial-card animate-scale-in" style={{ "--delay": "0.2s" }}>
              <div className="stars">⭐⭐⭐⭐⭐</div>
              <p className="testimonial-text">
                "Instant course access after payment means my students start learning immediately.
                Absolutely love the platform!"
              </p>
              <p className="testimonial-author">— Aisha Patel, Online Trainer</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section faq-section">
        <div className="container narrow">
          <h2 className="section-title">Frequently Asked Questions</h2>
          <div className="faq-list">
            <details className="faq-item animate-slide-up">
              <summary>How long does it take to set up my store?</summary>
              <p>You can set up your store in minutes! Just contact us and we'll help you get started.</p>
            </details>
            <details className="faq-item animate-slide-up" style={{ "--delay": "0.1s" }}>
              <summary>What payment methods do you support?</summary>
              <p>We support all major payment methods through Razorpay including credit cards, debit cards, net banking, and UPI.</p>
            </details>
            <details className="faq-item animate-slide-up" style={{ "--delay": "0.2s" }}>
              <summary>Can I edit my courses after publishing?</summary>
              <p>Yes! You can edit course details, pricing, and content anytime from your admin panel.</p>
            </details>
            <details className="faq-item animate-slide-up" style={{ "--delay": "0.3s" }}>
              <summary>What support do you provide?</summary>
              <p>We provide email support, phone support, and WhatsApp support to help you succeed.</p>
            </details>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section cta-section">
        <div className="container">
          <div className="cta-box animate-fade-in">
            <h2>Have Questions?</h2>
            <p>Reach out to us and let's discuss how we can help you grow</p>
            <a href="https://wa.me/918320191025" className="btn-primary btn-large">
              Contact Us Now
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
