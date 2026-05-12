import { useEffect, useState } from "react";
import { getEnrollments } from "../lib/api";

function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

async function copyToClipboard(text) {
  if (navigator?.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return true;
  }

  return false;
}

export default function DashboardPage() {
  const [email, setEmail] = useState(localStorage.getItem("course_app_user_email") || "");
  const [searchedEmail, setSearchedEmail] = useState(email);
  const [enrollments, setEnrollments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [copyState, setCopyState] = useState({});

  useEffect(() => {
    if (!email) {
      return;
    }

    fetchEnrollments(email);
  }, []);

  async function fetchEnrollments(targetEmail) {
    const normalizedEmail = targetEmail.trim().toLowerCase();

    if (!normalizedEmail) {
      setErrorMessage("Please enter your purchase email");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    setSearchedEmail(normalizedEmail);

    try {
      const data = await getEnrollments(normalizedEmail);
      setEnrollments(data.enrollments || []);
      localStorage.setItem("course_app_user_email", normalizedEmail);
    } catch (error) {
      setErrorMessage(error.message || "Enrollments load nahi hue");
      setEnrollments([]);
    } finally {
      setIsLoading(false);
    }
  }

  const onSubmit = (event) => {
    event.preventDefault();
    fetchEnrollments(email);
  };

  const onCopyLink = async (link, enrollmentId) => {
    try {
      const copied = await copyToClipboard(link);
      if (copied) {
        setCopyState((prev) => ({ ...prev, [enrollmentId]: "Copied" }));
        setTimeout(() => {
          setCopyState((prev) => ({ ...prev, [enrollmentId]: "" }));
        }, 1800);
      }
    } catch (error) {
      setCopyState((prev) => ({ ...prev, [enrollmentId]: "Copy failed" }));
    }
  };

  const purchasedCourses = enrollments
    .map((item) => ({
      id: item.id,
      title: item.courses?.title || "Your Course",
      driveLink: item.courses?.drive_link || "",
      heading: item.courses?.heading || "Course access ready"
    }))
    .filter((item) => item.driveLink);

  // Debug log
  useEffect(() => {
    if (enrollments.length > 0) {
      console.log("📊 Dashboard Debug Info:");
      console.log("Total Enrollments:", enrollments.length);
      console.log("Raw Enrollments Data:", enrollments);
      console.log("Purchased Courses (filtered):", purchasedCourses);
      enrollments.forEach((enr, idx) => {
        console.log(`Enrollment ${idx}:`, {
          id: enr.id,
          courseId: enr.course_id,
          coursesObject: enr.courses,
          driveLink: enr.courses?.drive_link,
          hasEmptyDriveLink: enr.courses?.drive_link === ""
        });
      });
    }
  }, [enrollments, purchasedCourses]);

  return (
    <section className="section dashboard-section">
      <div className="container">
        <div className="section-head dashboard-head">
          <div>
            <p className="eyebrow">My Learning</p>
            <h2>Search the exact email used during purchase to see your course access</h2>
            <p>
              We match this email with the database and show every purchased course name with its Google Drive link.
            </p>
          </div>
          <div className="dashboard-note">
            <span>Matched email</span>
            <strong>{searchedEmail || "Not loaded yet"}</strong>
          </div>
        </div>

        <form className="dashboard-form" onSubmit={onSubmit}>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter your purchase email"
            autoComplete="email"
            required
          />
          <button className="btn btn-primary" type="submit" disabled={isLoading}>
            {isLoading ? "Loading..." : "Load My Courses"}
          </button>
        </form>

        {errorMessage ? <p className="error-note">{errorMessage}</p> : null}

        {/* Debug info when enrollments exist but no purchased courses found */}
        {!isLoading && enrollments.length > 0 && purchasedCourses.length === 0 ? (
          <div className="empty-box" style={{ background: "#fff3cd", border: "1px solid #ffc107" }}>
            <h3>⚠️ Debug: Enrollments found but no Google Drive links</h3>
            <p>Enrollments: {enrollments.length}</p>
            <p>
              <strong>Issue:</strong> Courses found in database, but they don't have Google Drive links configured.
            </p>
            <details style={{ marginTop: "1rem", cursor: "pointer" }}>
              <summary>Click to see raw data</summary>
              <pre style={{ background: "#f8f9fa", padding: "1rem", borderRadius: "4px", overflow: "auto" }}>
                {JSON.stringify(enrollments, null, 2)}
              </pre>
            </details>
          </div>
        ) : null}

        {!isLoading && purchasedCourses.length > 0 ? (
          <div className="dashboard-access-strip">
            <div className="section-head">
              <p className="eyebrow">Purchased Courses</p>
              <h3>Matched course name and Google Drive link</h3>
            </div>

            <div className="dashboard-access-list">
              {purchasedCourses.map((course) => (
                <article key={course.id} className="dashboard-access-item">
                  <div>
                    <p className="small-muted">Course Name</p>
                    <h4>{course.title}</h4>
                    <p className="course-subtitle">{course.heading}</p>
                  </div>
                  <a href={course.driveLink} target="_blank" rel="noreferrer" className="btn btn-soft">
                    Open Google Drive
                  </a>
                </article>
              ))}
            </div>
          </div>
        ) : null}

        {isLoading ? (
          <div className="enrollment-grid">
            <article className="enrollment-card enrollment-loading animate-pulse-card">
              <p className="small-muted">Checking enrollment status...</p>
              <div className="loading-bar" />
              <div className="loading-bar short" />
              <div className="loading-bar" />
            </article>
          </div>
        ) : enrollments.length === 0 ? (
          <div className="empty-box dashboard-empty">
            <h3>No course found for this email</h3>
            <p>
              If payment is completed, try the exact email used during checkout. Your Drive link
              will appear here with a quick animated access card.
            </p>
          </div>
        ) : (
          <div className="enrollment-grid">
            {enrollments.map((item) => {
              const driveLink = item.courses?.drive_link;
              const title = item.courses?.title || "Your Course";
              const heading = item.courses?.heading || "Course access ready";
              const studentName = item.users?.name || "Student";

              return (
                <article key={item.id} className="enrollment-card access-card animate-card-rise">
                  <div className="access-card-top">
                    <div>
                      <p className="small-muted">Enrollment ID: {item.id}</p>
                      <h3>{title}</h3>
                      <p className="course-subtitle">{heading}</p>
                    </div>
                    <div className="access-badge">Ready</div>
                  </div>

                  <div className="access-meta">
                    <p className="small-muted">Purchased on {formatDate(item.created_at)}</p>
                    <p>
                      Student: <strong>{studentName}</strong>
                    </p>
                  </div>

                  <div className="drive-link-panel">
                    <p className="drive-label">Google Drive Link</p>
                    <a
                      href={driveLink}
                      className="drive-link"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open Course Videos
                    </a>
                    <p className="drive-hint">Tap to open your course folder in Google Drive.</p>
                  </div>

                  <div className="access-actions">
                    <a
                      href={driveLink}
                      className="btn btn-primary"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open Drive
                    </a>
                    <button
                      type="button"
                      className="btn btn-soft"
                      onClick={() => onCopyLink(driveLink, item.id)}
                    >
                      {copyState[item.id] || "Copy Link"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
