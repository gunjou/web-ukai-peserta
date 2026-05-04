export function setAuth(access: string, refresh: string) {
  localStorage.setItem("access_token", access);
  localStorage.setItem("refresh_token", refresh);
}

export function getAccessToken() {
  return localStorage.getItem("access_token");
}

export function clearAuth() {
  document.cookie = "access_token=; path=/; max-age=0";
  document.cookie = "refresh_token=; path=/; max-age=0";

  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}
