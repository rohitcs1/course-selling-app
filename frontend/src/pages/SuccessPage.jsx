import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getCourseById } from "../lib/api";

const PURCHASE_STORAGE_KEY = "course_app_last_purchase";

function getStoredPurchase() {
  if (typeof window === "undefined") {
    return null;
  }

  const storedValue = window.localStorage.getItem(PURCHASE_STORAGE_KEY);
  if (!storedValue) {
    return null;
  }

  try {
    return JSON.parse(storedValue);
  } catch {
    return null;
  }
}

export default function SuccessPage() {
  const { state } = useLocation();
  const purchase = useMemo(() => state || getStoredPurchase(), [state]);
  const [courseData, setCourseData] = useState(null);
  const [isLoadingCourse, setIsLoadingCourse] = useState(Boolean(purchase?.courseId));
  const [courseError, setCourseError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function fetchCourse() {
      if (!purchase?.courseId) {
        setIsLoadingCourse(false);
        return;
      }

      setIsLoadingCourse(true);
      setCourseError("");

      try {
        const data = await getCourseById(purchase.courseId);
        if (!isMounted) {
          return;
        }

        setCourseData(data.course || null);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setCourseError(error.message || "Course details load nahi ho paye");
      } finally {
        if (isMounted) {
          setIsLoadingCourse(false);
        }
      }
    }

    fetchCourse();

    return () => {
      isMounted = false;
    };
  }, [purchase?.courseId]);

  const courseTitle = courseData?.title || purchase?.courseTitle || "your course";
  const courseIncludes = Array.isArray(purchase?.includes) ? purchase.includes : [];
  const courseDriveLink = courseData?.drive_link || purchase?.driveLink || "";
  const purchaseSummary = [
    courseData?.level || purchase?.level || "Self-paced learning",
    courseData?.duration || purchase?.duration || "Lifetime access",
    purchase?.email ? `Confirmation sent to ${purchase.email}` : "Email confirmation sent"
  ];

  return (
    <section className="section success-section">
      <div className="container success-layout">
        <div className="success-hero animate-fade-in">
          <p className="eyebrow">Payment Successful</p>
          <h1>Welcome to {courseTitle}</h1>
          <p className="success-copy">
            Hi {purchase?.name || "Learner"}, your payment is confirmed and your course access is ready.
            We are loading the latest course record from the database so the Google Drive link stays accurate.
          </p>

          {courseError ? <p className="error-note">{courseError}</p> : null}

          <div className="success-summary-grid">
            {purchaseSummary.map((item) => (
              <div key={item} className="success-summary-pill">
                {item}
              </div>
            ))}
          </div>

          <div className="hero-actions">
            <Link to="/dashboard" className="btn btn-primary">
              Go to My Courses
            </Link>
            {courseDriveLink ? (
              <a href={courseDriveLink} target="_blank" rel="noreferrer" className="btn btn-soft">
                Open Google Drive
              </a>
            ) : null}
          </div>
        </div>

        <aside className="success-card success-panel animate-scale-in">
          <p className="success-panel-label">Purchased Course</p>
          <h2>{courseTitle}</h2>
          <p className="success-panel-text">
            {purchase?.courseDescription ||
              "Your enrollment has been activated. The course summary and learning materials are listed below."}
          </p>

          {isLoadingCourse ? <p className="success-panel-text">Fetching latest course access from database...</p> : null}

          <div className="success-access-box">
            <span className="success-access-title">Google Drive Access</span>
            {courseDriveLink ? (
              <a href={courseDriveLink} target="_blank" rel="noreferrer" className="success-drive-link">
                Open course folder
              </a>
            ) : (
              <span className="success-access-muted">Drive link will appear here once it is available.</span>
            )}
          </div>

          <div className="success-mini-section">
            <p className="success-mini-title">What is included</p>
            {courseIncludes.length > 0 ? (
              <ul className="success-list">
                {courseIncludes.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="success-panel-text">Course modules, resources, and guided materials are unlocked.</p>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}
