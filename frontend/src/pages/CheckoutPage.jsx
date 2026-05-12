import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { createOrder, verifyPayment } from "../lib/api";

function loadRazorpayScript() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error("Razorpay SDK load nahi hua"));
    document.body.appendChild(script);
  });
}

function formatInr(price) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(price);
}

export default function CheckoutPage({ courses }) {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const course = useMemo(() => courses.find((item) => item.id === courseId), [courses, courseId]);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: ""
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!course) {
    return (
      <section className="section">
        <div className="container narrow">
          <h2>Course not available</h2>
          <Link to="/" className="btn btn-primary">
            Return Home
          </Link>
        </div>
      </section>
    );
  }

  const onChange = (event) => {
    setFormData((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handlePayment = async (event) => {
    event.preventDefault();
    setIsProcessing(true);
    setErrorMessage("");

    try {
      await loadRazorpayScript();

      const orderData = await createOrder({
        courseId: course.id,
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone
      });

      localStorage.setItem("course_app_user_email", formData.email);

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "CourseNest",
        description: `Enrollment for ${course.title}`,
        order_id: orderData.orderId,
        handler: async function (response) {
          try {
            console.log("🎉 Payment response received from Razorpay:", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature ? response.razorpay_signature.substring(0, 20) + "..." : "missing"
            });
            
            // Verify payment signature with backend
            console.log("🔍 Verifying payment with backend at:", `${window.location.origin}`);
            const verifyResult = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            
            console.log("✅ Payment verified successfully:", verifyResult);
            
            const purchasePayload = {
              courseId: course.id,
              courseTitle: course.title,
              courseDescription: course.description,
              includes: course.includes,
              level: course.level,
              duration: course.duration,
              driveLink: course.driveLink,
              name: formData.fullName,
              email: formData.email,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id
            };

            localStorage.setItem("course_app_last_purchase", JSON.stringify(purchasePayload));
            localStorage.setItem("course_app_user_email", formData.email);

            navigate("/success", {
              state: purchasePayload
            });
          } catch (error) {
            console.error("❌ Payment verification failed:", error);
            console.error("Error details:", {
              message: error.message,
              status: error.status,
              response: error.response
            });
            setErrorMessage("Payment verification failed: " + (error.message || "Unknown error. Check console for details."));
            setIsProcessing(false);
          }
        },
        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: formData.phone
        },
        theme: {
          color: "#d83f31"
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      setErrorMessage(error.message || "Payment start nahi ho paya");
      setIsProcessing(false);
    }
  };

  return (
    <section className="section">
      <div className="container checkout-grid">
        <div className="glass-card">
          <h2>Checkout</h2>
          <p>Fill details and complete your payment securely.</p>

          <form onSubmit={handlePayment} className="checkout-form">
            <label>
              Full Name
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={onChange}
                required
                placeholder="Enter your name"
              />
            </label>
            <label>
              Email Address
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={onChange}
                required
                placeholder="you@example.com"
              />
            </label>
            <label>
              Phone Number
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={onChange}
                required
                placeholder="10-digit number"
              />
            </label>

            <button type="submit" className="btn btn-primary full" disabled={isProcessing}>
              {isProcessing ? "Processing Payment..." : `Pay ${formatInr(course.price)}`}
            </button>
          </form>

          {errorMessage ? <p className="error-note">{errorMessage}</p> : null}
          <p className="small-muted">Payment Razorpay checkout ke through securely process hoga.</p>
        </div>

        <aside className="summary-card">
          <h3>Order Summary</h3>
          <p className="small-muted">Course</p>
          <strong>{course.title}</strong>
          <p className="small-muted top-gap">Total</p>
          <h2>{formatInr(course.price)}</h2>
          <Link to={`/course/${course.id}`} className="btn btn-soft full">
            View Course Details
          </Link>
        </aside>
      </div>
    </section>
  );
}
