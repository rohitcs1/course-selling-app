import { supabase } from "../lib/supabase.js";

const HOMEPAGE_VIDEO_ID = 1;

export async function getHomepageVideoSettings() {
  const { data, error } = await supabase
    .from("homepage_video_settings")
    .select("id,title,youtube_url,description,updated_at")
    .eq("id", HOMEPAGE_VIDEO_ID)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function upsertHomepageVideoSettings(payload) {
  const { data, error } = await supabase
    .from("homepage_video_settings")
    .upsert(
      {
        id: HOMEPAGE_VIDEO_ID,
        title: payload.title?.trim() || "Featured Video",
        youtube_url: payload.youtubeUrl?.trim() || "",
        description: payload.description?.trim() || null,
        updated_at: new Date().toISOString()
      },
      { onConflict: "id" }
    )
    .select("id,title,youtube_url,description,updated_at")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getPublicHomepageVideoSettings() {
  return getHomepageVideoSettings();
}