import { getEnrollmentsByEmail } from "../services/userService.js";

export async function listMyEnrollments(req, res, next) {
  try {
    const email = req.query.email;
    if (!email) {
      return res.status(400).json({ message: "email query param is required" });
    }

    const enrollments = await getEnrollmentsByEmail(email);
    return res.json({ enrollments });
  } catch (error) {
    return next(error);
  }
}
