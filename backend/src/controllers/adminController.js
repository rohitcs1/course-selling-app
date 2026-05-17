import { validateAdminCredentials, generateAdminToken, storeAdminToken, revokeAdminToken, verifyAdminToken } from "../lib/adminAuth.js";
import { sendCourseWelcomeEmail, logEmailStatus } from "../services/emailService.js";
import { getHomepageVideoSettings, upsertHomepageVideoSettings } from "../services/homepageService.js";

export async function adminLogin(req, res, next) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "username and password are required" });
    }

    const isValid = await validateAdminCredentials(username, password);

    if (!isValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateAdminToken();
    storeAdminToken(token);

    return res.status(200).json({ token });
  } catch (error) {
    return next(error);
  }
}

export async function adminLogout(req, res, next) {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (token) {
      revokeAdminToken(token);
    }

    return res.status(200).json({ message: "Logged out" });
  } catch (error) {
    return next(error);
  }
}

export function adminAuthMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace("Bearer ", "");

  if (!token || !verifyAdminToken(token)) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  next();
}

export async function adminSendTestEmail(req, res, next) {
  try {
    const { name, email, courseTitle, driveLink, userId, courseId, orderId, purchaseDate } = req.body;

    if (!name || !email || !courseTitle) {
      return res.status(400).json({ message: "name, email and courseTitle are required" });
    }

    const result = await sendCourseWelcomeEmail({
      userName: name,
      userEmail: email,
      courseTitle,
      driveLink,
      orderId,
      purchaseDate
    });

    if (userId && courseId) {
      await logEmailStatus({
        userId,
        courseId,
        emailType: "welcome_and_access",
        status: "sent",
        providerMessageId: result.messageId
      });
    }

    return res.json({ message: "Test email sent", messageId: result.messageId });
  } catch (error) {
    return next(error);
  }
}

export async function adminGetHomepageVideo(req, res, next) {
  try {
    const settings = await getHomepageVideoSettings();
    return res.json({ settings });
  } catch (error) {
    return next(error);
  }
}

export async function adminUpdateHomepageVideo(req, res, next) {
  try {
    const { title, youtubeUrl, description } = req.body;

    if (!youtubeUrl) {
      return res.status(400).json({ message: "youtubeUrl is required" });
    }

    const settings = await upsertHomepageVideoSettings({ title, youtubeUrl, description });
    return res.json({ message: "Homepage video updated", settings });
  } catch (error) {
    return next(error);
  }
}
