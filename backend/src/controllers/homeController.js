import { getPublicHomepageVideoSettings } from "../services/homepageService.js";

export async function getHomepageVideo(req, res, next) {
  try {
    const settings = await getPublicHomepageVideoSettings();
    return res.json({ settings });
  } catch (error) {
    return next(error);
  }
}