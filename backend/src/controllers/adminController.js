import { validateAdminCredentials, generateAdminToken, storeAdminToken, revokeAdminToken, verifyAdminToken } from "../lib/adminAuth.js";

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
  console.log("adminAuthMiddleware - Authorization header:", authHeader ? "present" : "missing");
  
  const token = authHeader?.replace("Bearer ", "");
  console.log("Extracted token:", token ? token.substring(0, 20) + "..." : "none");
  console.log("Token verification result:", token ? verifyAdminToken(token) : false);

  if (!token || !verifyAdminToken(token)) {
    console.log("Auth failed - returning 401");
    return res.status(401).json({ message: "Unauthorized" });
  }

  console.log("Auth successful - calling next()");
  next();
}
