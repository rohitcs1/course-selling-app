export const config = {
  apiBaseUrl:
    import.meta.env.VITE_API_BASE_URL ||
    (import.meta.env.PROD ? "https://api.rasoiroom.in" : "http://localhost:4000"),
  adminApiKey: import.meta.env.VITE_ADMIN_API_KEY || ""
};
