import { requestUpstream, unwrapApiData } from "../utils/session";

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
    path: "/api/notice",
  });
  const notice = unwrapApiData<any>(upstream) || {};
  const item = {
    id: String(notice.id || "global-notice"),
    title: String(notice.title || ""),
    content: String(notice.content || ""),
    type: String(notice.theme || notice.type || "info"),
    active: parseBoolean(notice.active, true),
    updatedAt: notice.updatedAt,
    updatedBy: notice.updatedBy,
  };
  return {
    theme: item.type,
    title: item.title,
    content: item.content,
    active: item.active,
    notices: [item],
  };
});
