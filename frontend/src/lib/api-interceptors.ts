import { api } from "./api";
import { getCsrfToken } from "./csrf";

api.interceptors.request.use(async (config) => {
  const method = config.method?.toLowerCase();

  const protectedMethods = ["post", "put", "patch", "delete"];

  if (method && protectedMethods.includes(method)) {
    const csrfToken = await getCsrfToken();

    config.headers.set("X-CSRF-Token", csrfToken);
  }

  return config;
});
