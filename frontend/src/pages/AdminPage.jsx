import { useEffect, useState } from "react";
import { useAdminAuth } from "../context/AuthContext";
import { deleteCourseAdmin, getAllCoursesAdmin, updateCourseAdmin } from "../lib/api";

function makeIdFromTitle(title) {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 60);
}

function formatInr(price) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(price);
}

export default function AdminPage({ courses, stats, onAddCourse }) {
  const { adminToken } = useAdminAuth();
  const [adminCourses, setAdminCourses] = useState([]);
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    heading: "",
    description: "",
    price: "",
    thumbnail: "",
    driveLink: "",
    duration: "",
    level: "Beginner",
    includes: ""
  });

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const latestCourses = (adminCourses.length > 0 ? adminCourses : courses).slice(0, 5);

  useEffect(() => {
    if (!adminToken) {
      setErrorMessage("Admin token not found. Please log in again.");
      return;
    }

    loadAdminCourses();
  }, [adminToken]);

  const loadAdminCourses = async () => {
    setIsLoadingCourses(true);
    try {
      const data = await getAllCoursesAdmin(adminToken);
      setAdminCourses(data.courses || []);
    } catch (error) {
      setErrorMessage(error.message || "Courses load nahi hue");
    } finally {
      setIsLoadingCourses(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      heading: "",
      description: "",
      price: "",
      thumbnail: "",
      driveLink: "",
      duration: "",
      level: "Beginner",
      includes: ""
    });
    setEditingCourseId(null);
  };

  const onChange = (event) => {
    setFormData((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setMessage("");
    setErrorMessage("");

    const nextCourse = {
      id: editingCourseId || makeIdFromTitle(formData.title) || `course-${Date.now()}`,
      title: formData.title,
      heading: formData.heading,
      description: formData.description,
      price: Number(formData.price),
      thumbnail:
        formData.thumbnail ||
        "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80",
      driveLink: formData.driveLink,
      duration: formData.duration,
      level: formData.level,
      includes: formData.includes
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    };

    try {
      if (editingCourseId) {
        const updatePayload = {
          title: nextCourse.title,
          heading: nextCourse.heading,
          description: nextCourse.description,
          price: Number(nextCourse.price),
          thumbnailUrl: nextCourse.thumbnail,
          driveLink: nextCourse.driveLink,
          duration: nextCourse.duration,
          level: nextCourse.level,
          isPublished: true
        };
        await updateCourseAdmin(editingCourseId, updatePayload, adminToken);
        setMessage("Course updated successfully.");
      } else {
        await onAddCourse(nextCourse, adminToken);
        setMessage("Course added successfully.");
      }

      resetForm();
      await loadAdminCourses();
    } catch (error) {
      console.error("Form submission error:", error);
      setErrorMessage(error.message || "Course save nahi ho paya");
    } finally {
      setIsSaving(false);
    }
  };

  const onEditClick = (course) => {
    setEditingCourseId(course.id);
    const newFormData = {
      title: course.title || "",
      heading: course.heading || "",
      description: course.description || "",
      price: String(course.price || ""),
      thumbnail: course.thumbnail_url || "",
      driveLink: course.drive_link || "",
      duration: course.duration || "",
      level: course.level || "Beginner",
      includes: ""
    };
    setFormData(newFormData);
    setMessage("");
    setErrorMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onDeleteClick = async (courseId) => {
    const shouldDelete = window.confirm("Is course ko delete karna hai?");
    if (!shouldDelete) {
      return;
    }

    try {
      await deleteCourseAdmin(courseId, adminToken);
      setMessage("Course deleted successfully.");
      setAdminCourses((prev) => prev.filter((course) => course.id !== courseId));
      if (editingCourseId === courseId) {
        resetForm();
      }
    } catch (error) {
      console.error("Delete error:", error);
      setErrorMessage(error.message || "Course delete nahi ho paya");
    }
  };

  return (
    <section className="section">
      <div className="container admin-grid">
        <aside className="stats-card">
          <h3>Admin Overview</h3>
          <div className="stat-item">
            <span>Total Courses</span>
            <strong>{stats.totalCourses}</strong>
          </div>
          <div className="stat-item">
            <span>Total Enrollments</span>
            <strong>{stats.totalEnrollments}</strong>
          </div>
          <div className="stat-item">
            <span>Total Revenue</span>
            <strong>{formatInr(stats.totalRevenue)}</strong>
          </div>

          <h4 className="top-gap">Latest Courses</h4>
          <ul className="mini-list">
            {latestCourses.map((course) => (
              <li key={course.id}>{course.title}</li>
            ))}
          </ul>
        </aside>

        <div className="glass-card">
          <h2>{editingCourseId ? "Edit Course" : "Add New Course"}</h2>
          <p>Set title, price, content highlights and Google Drive access link.</p>
          {message ? <p className="success-note">{message}</p> : null}
          {errorMessage ? <p className="error-note">{errorMessage}</p> : null}

          <form onSubmit={onSubmit} className="checkout-form two-col">
            <label>
              Course Title
              <input
                name="title"
                value={formData.title}
                onChange={onChange}
                required
                placeholder="Instagram Ads Masterclass"
              />
            </label>
            <label>
              Heading
              <input
                name="heading"
                value={formData.heading}
                onChange={onChange}
                required
                placeholder="Scale your sales with paid ads"
              />
            </label>
            <label>
              Price (INR)
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={onChange}
                required
                min="1"
                placeholder="2999"
              />
            </label>
            <label>
              Duration
              <input
                name="duration"
                value={formData.duration}
                onChange={onChange}
                required
                placeholder="6 Weeks"
              />
            </label>
            <label>
              Level
              <input
                name="level"
                value={formData.level}
                onChange={onChange}
                required
                placeholder="Beginner to Intermediate"
              />
            </label>
            <label>
              Thumbnail URL
              <input
                name="thumbnail"
                value={formData.thumbnail}
                onChange={onChange}
                placeholder="https://..."
              />
            </label>
            <label className="span-2">
              Description
              <textarea
                name="description"
                value={formData.description}
                onChange={onChange}
                required
                placeholder="Write a strong promise and outcomes."
                rows="4"
              />
            </label>
            <label className="span-2">
              Highlights (comma separated)
              <input
                name="includes"
                value={formData.includes}
                onChange={onChange}
                required
                placeholder="Live examples, script templates, ad library"
              />
            </label>
            <label className="span-2">
              Google Drive Link
              <input
                type="url"
                name="driveLink"
                value={formData.driveLink}
                onChange={onChange}
                required
                placeholder="https://drive.google.com/..."
              />
            </label>
            <div className="span-2 admin-form-actions">
              <button type="submit" className="btn btn-primary full" disabled={isSaving}>
                {isSaving ? "Saving..." : editingCourseId ? "Update Course" : "Save Course"}
              </button>
              {editingCourseId ? (
                <button type="button" className="btn btn-soft full" onClick={resetForm}>
                  Cancel Edit
                </button>
              ) : null}
            </div>
          </form>
        </div>

        <div className="glass-card admin-course-list span-2">
          <h2>All Courses</h2>
          <p>Yahan se course edit ya delete kar sakte ho.</p>

          {isLoadingCourses ? <p className="small-muted">Loading courses...</p> : null}

          {!isLoadingCourses && adminCourses.length === 0 ? (
            <p className="small-muted">No courses found.</p>
          ) : null}

          <div className="admin-courses-grid">
            {adminCourses.map((course) => (
              <article key={course.id} className="enrollment-card">
                <p className="small-muted">{course.id}</p>
                <h3>{course.title}</h3>
                <p className="small-muted">{formatInr(course.price)}</p>
                <p>{course.heading}</p>
                <div className="hero-actions">
                  <button type="button" className="btn btn-soft" onClick={() => onEditClick(course)}>
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => onDeleteClick(course.id)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
