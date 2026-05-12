import { Navigate, Route, Routes } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import HomePage from "./pages/HomePage";
import CoursePage from "./pages/CoursePage";
import CheckoutPage from "./pages/CheckoutPage";
import SuccessPage from "./pages/SuccessPage";
import DashboardPage from "./pages/DashboardPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import ContactPage from "./pages/ContactPage";
import AboutPage from "./pages/AboutPage";
import AdminPage from "./pages/AdminPage";
import { seedCourses } from "./data/seedCourses";
import { createCourseAdmin, getCourses } from "./lib/api";

function normalizeCourse(course) {
  return {
    id: course.id,
    title: course.title,
    heading: course.heading,
    description: course.description,
    price: Number(course.price),
    thumbnail:
      course.thumbnail_url ||
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80",
    driveLink: course.drive_link,
    includes: Array.isArray(course.includes) ? course.includes : [],
    level: course.level || "Beginner",
    duration: course.duration || "Self-paced"
  };
}

export default function App() {
  const [courses, setCourses] = useState([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [courseError, setCourseError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function fetchCourses() {
      try {
        const data = await getCourses();
        if (!isMounted) {
          return;
        }
        const nextCourses = (data.courses || []).map(normalizeCourse);
        setCourses(nextCourses.length > 0 ? nextCourses : seedCourses);
        setCourseError("");
      } catch (error) {
        if (!isMounted) {
          return;
        }
        setCourses(seedCourses);
        setCourseError("Live courses load nahi ho paye. Seed data show ho raha hai.");
      } finally {
        if (isMounted) {
          setIsLoadingCourses(false);
        }
      }
    }

    fetchCourses();

    return () => {
      isMounted = false;
    };
  }, []);

  const addCourse = async (newCourse, adminToken) => {
    const payload = {
      id: newCourse.id,
      title: newCourse.title,
      heading: newCourse.heading,
      description: newCourse.description,
      price: Number(newCourse.price),
      thumbnailUrl: newCourse.thumbnail,
      driveLink: newCourse.driveLink,
      duration: newCourse.duration,
      level: newCourse.level,
      isPublished: true
    };

    const data = await createCourseAdmin(payload, adminToken);
    const courseFromApi = {
      ...newCourse,
      id: data.course.id
    };

    setCourses((prev) => [courseFromApi, ...prev]);
    return courseFromApi;
  };

  const stats = useMemo(() => {
    return {
      totalCourses: courses.length,
      totalEnrollments: 0,
      totalRevenue: 0
    };
  }, [courses]);

  return (
    <AuthProvider>
      <div className="app-shell">
        <Navbar />
        <main className="page-shell">
          <Routes>
            <Route
              path="/"
              element={<HomePage courses={courses} isLoadingCourses={isLoadingCourses} courseError={courseError} />}
            />
            <Route path="/course/:courseId" element={<CoursePage courses={courses} />} />
            <Route path="/checkout/:courseId" element={<CheckoutPage courses={courses} />} />
            <Route path="/success" element={<SuccessPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/admin-login" element={<AdminLoginPage />} />
            <Route
              path="/admin"
              element={
                <ProtectedAdminRoute>
                  <AdminPage courses={courses} stats={stats} onAddCourse={addCourse} />
                </ProtectedAdminRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}
