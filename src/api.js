const API = process.env.REACT_APP_API_URL || "http://localhost:4000";

const ACCESS_KEY = "token";

export function setAccessToken(tok) {
	if (tok) localStorage.setItem(ACCESS_KEY, tok);
	else localStorage.removeItem(ACCESS_KEY);
}
export function getAccessToken() {
	return localStorage.getItem(ACCESS_KEY) || "";
}

export async function apiFetch(path, opts = {}) {
	const headers = new Headers(opts.headers || {});
	const token = getAccessToken();
	if (token) headers.set("Authorization", `Bearer ${token}`);

	const res = await fetch(`${API}${path}`, {
		...opts,
		headers,
		credentials: "include",
	});
	return res;
}

export async function getJson(path) {
	const res = await apiFetch(path, { method: "GET" });
	const data = await res.json().catch(() => ({}));
	if (!res.ok) throw new Error(data.message || "Request failed");
	return data;
}

export async function putJson(path, body) {
	const res = await apiFetch(path, {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	});
	const data = await res.json().catch(() => ({}));
	if (!res.ok) throw new Error(data.message || "Request failed");
	return data;
}

export function initAuth() {
}

export function listPosts({ type, resolved = false, page = 1, limit = 20 }) {
  const q = new URLSearchParams({ type, resolved: String(resolved), page: String(page), limit: String(limit) });
  return getJson(`/api/posts?${q.toString()}`);
}

export function resolvePost(postId, resolved = true) {
  return putJson(`/api/posts/${postId}/resolve`, { resolved });
}