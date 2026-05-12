import { Link } from "react-router-dom";

function formatInr(price) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(price);
}

export default function CourseCard({ course }) {
  return (
    <article className="course-card">
      <img src={course.thumbnail} alt={course.title} className="course-image" loading="lazy" />
      <div className="course-content">
        <p className="tag">{course.level}</p>
        <h3>{course.title}</h3>
        <p className="heading-line">{course.heading}</p>
        <p className="course-description">{course.description}</p>
        <div className="course-meta">
          <span>{course.duration}</span>
          <strong>{formatInr(course.price)}</strong>
        </div>
        <div className="card-actions">
          <Link to={`/course/${course.id}`} className="btn btn-soft">
            View Details
          </Link>
          <Link to={`/checkout/${course.id}`} className="btn btn-primary">
            Buy Now
          </Link>
        </div>
      </div>
    </article>
  );
}
