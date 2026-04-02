import { readNotice } from "../utils/notice-store";

export default defineEventHandler(async () => {
  const notice = await readNotice();
  return {
    theme: notice.theme,
    title: notice.title,
    content: notice.content,
  };
});
