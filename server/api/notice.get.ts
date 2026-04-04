import { requestUpstream, unwrapApiData } from "../utils/session";

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
    active: notice.active !== false,
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
