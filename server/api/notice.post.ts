import { createError, readBody } from "h3";
import { saveNotice } from "../utils/notice-store";
import { requireAdmin } from "../utils/session";

type NoticeBody = {
  theme?: string;
  title?: string;
  content?: string;
};

export default defineEventHandler(async (event) => {
  const user = requireAdmin(event);
  const body = (await readBody(event)) as NoticeBody | null;

  if (!body) {
    throw createError({
      statusCode: 400,
      statusMessage: "请求体格式无效",
    });
  }

  const allowedThemes = new Set(["info", "warning", "feature", "rainbow"]);
  const theme = String(body.theme || "").trim();
  const title = String(body.title || "").trim();
  const content = String(body.content || "").trim();

  if (!theme || !allowedThemes.has(theme)) {
    throw createError({
      statusCode: 400,
      statusMessage: "theme 必须为 info/warning/feature/rainbow 之一",
    });
  }
  if (!title || !content) {
    throw createError({
      statusCode: 400,
      statusMessage: "title、content 为必填项",
    });
  }

  const saved = await saveNotice({
    theme,
    title,
    content,
    updatedAt: Date.now(),
    updatedBy: user.email || "admin",
  });

  return {
    success: true,
    data: {
      theme: saved.theme,
      title: saved.title,
      content: saved.content,
    },
  };
});
