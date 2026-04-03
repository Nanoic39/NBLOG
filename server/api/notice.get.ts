import { readNotice } from "../utils/notice-store";

export default defineEventHandler(async () => {
  const notice = await readNotice();
  const item = {
    id: "global-notice",
    title: notice.title,
    content: notice.content,
    type: notice.theme,
    active: notice.active,
    updatedAt: notice.updatedAt,
    updatedBy: notice.updatedBy,
  };
  return {
    theme: notice.theme,
    title: notice.title,
    content: notice.content,
    active: notice.active,
    notices: [item],
  };
});
