import { requestUpstream, unwrapApiData } from "../../utils/session";

const parseBoolean = (value: unknown, defaultValue = true) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  const normalized = String(value ?? "").trim().toLowerCase();
  if (!normalized) return defaultValue;
  if (["false", "0", "off", "no", "disabled"].includes(normalized)) return false;
  if (["true", "1", "on", "yes", "enabled"].includes(normalized)) return true;
  return defaultValue;
};

export default defineEventHandler(async (event) => {
  const upstream = await requestUpstream<any>(event, {
    path: "/api/admin/overview",
    auth: "admin",
  });
  const payload = unwrapApiData<any>(upstream) || {};

  const [doingRaw, noticeRaw] = await Promise.all([
    payload?.doing
      ? Promise.resolve(payload.doing)
      : requestUpstream<any>(event, { path: "/api/doing", auth: "admin" })
          .then((res) => unwrapApiData<any>(res) || {})
          .catch(() => ({})),
    payload?.notice
      ? Promise.resolve(payload.notice)
      : requestUpstream<any>(event, { path: "/api/notice", auth: "admin" })
          .then((res) => unwrapApiData<any>(res) || {})
          .catch(() => ({})),
  ]);

  const doing = {
    action: String(doingRaw?.action || ""),
    target: String(doingRaw?.target || ""),
    type: String(doingRaw?.type || ""),
    startTime: String(doingRaw?.startTime || ""),
  };
  const notice = {
    theme: String(noticeRaw?.theme || noticeRaw?.type || "info"),
    title: String(noticeRaw?.title || ""),
    content: String(noticeRaw?.content || ""),
    active: parseBoolean(noticeRaw?.active, true),
  };

  return {
    ...payload,
    doing,
    notice,
  };
});
