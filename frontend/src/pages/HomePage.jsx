import { Link } from "react-router-dom";
import CourseCard from "../components/CourseCard";

function getYouTubeEmbedUrl(youtubeUrl) {
  if (!youtubeUrl) {
    return "";
  }

  try {
    const parsedUrl = new URL(youtubeUrl);
    if (parsedUrl.hostname.includes("youtu.be")) {
      const videoId = parsedUrl.pathname.replace("/", "");
      return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
    }

    const videoId = parsedUrl.searchParams.get("v");
    return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
  } catch {
    return "";
  }
}

export default function HomePage({ courses, isLoadingCourses, courseError, homepageVideo }) {
  const embedUrl = getYouTubeEmbedUrl(homepageVideo?.youtube_url);

  return (
    <div>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <p className="eyebrow">Built for Instagram Ad Traffic</p>
            <h1>Turn ad clicks into paid students with a high-converting course website.</h1>
            <p className="hero-copy">
              A mobile-first experience designed for trust, instant checkout, and fast course delivery.
            </p>
            <div className="hero-actions">
              <Link to="#courses" className="btn btn-primary">
                Explore Courses
              </Link>
              <Link to="/dashboard" className="btn btn-soft">
                Student Dashboard
              </Link>
            </div>
          </div>
          {/* hero panel removed to keep clean layout */}
        </div>
      </section>

      {homepageVideo?.youtube_url ? (
        <section className="section">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">Featured Video</p>
              <h2>{homepageVideo.title || "Watch this video"}</h2>
              {homepageVideo.description ? <p>{homepageVideo.description}</p> : null}
            </div>

            <article className="video-card glass-card">
              <div className="video-frame">
                {embedUrl ? (
                  <iframe
                    src={embedUrl}
                    title={homepageVideo.title || "Homepage featured video"}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : (
                  <div className="video-placeholder">
                    <p>Invalid YouTube link configured in admin panel.</p>
                  </div>
                )}
              </div>
            </article>
          </div>
        </section>
      ) : null}

      <section id="courses" className="section">
        <div className="container">
          <div className="section-head">
            <h2>Featured Courses</h2>
            <p>Pick a program and start learning instantly after payment.</p>
          </div>
          {isLoadingCourses ? <p className="small-muted">Loading live courses...</p> : null}
          {courseError ? <p className="error-note">{courseError}</p> : null}
          <div className="course-grid">
            {courses.map((course, idx) => (
              <CourseCard key={course.id} course={course} style={{ ['--delay']: `${idx * 0.06}s` }} />
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container split-grid">
          <div className="info-box">
            <h3>Student Promise</h3>
            <p>
              After successful payment, students get a professional welcome experience and direct
              access instructions for the course.
            </p>
          </div>
          <div className="info-box">
            <h3>Support Included</h3>
            <p>
              Add WhatsApp or email support in the course description to increase trust and
              completion rates.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
