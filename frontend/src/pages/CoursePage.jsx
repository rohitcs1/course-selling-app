import { Link, useParams } from "react-router-dom";

function formatInr(price) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(price);
}

export default function CoursePage({ courses }) {
  const { courseId } = useParams();
  const course = courses.find((item) => item.id === courseId);

  if (!course) {
    return (
      <section className="section">
        <div className="container narrow">
          <h2>Course not found</h2>
          <p>Try selecting a course from the home page.</p>
          <Link to="/" className="btn btn-primary">
            Go Home
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="container course-detail-grid">
        <div>
          <img src={course.thumbnail} alt={course.title} className="detail-image" />
        </div>
        <div className="detail-content">
          <p className="eyebrow">{course.level}</p>
          <h1>{course.title}</h1>
          <p className="heading-line">{course.heading}</p>
          <p>{course.description}</p>

          <h3>What you get</h3>
          <ul className="feature-list">
            {course.includes?.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <div className="detail-price-row">
            <div>
              <p className="small-muted">Duration</p>
              <strong>{course.duration}</strong>
            </div>
            <div>
              <p className="small-muted">Course Price</p>
              <strong>{formatInr(course.price)}</strong>
            </div>
          </div>

          <div className="hero-actions">
            <Link to={`/checkout/${course.id}`} className="btn btn-primary">
              Buy This Course
            </Link>
            <Link to="/" className="btn btn-soft">
              Back to Courses
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
