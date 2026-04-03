import { createError, readBody } from "h3";
import { saveNotice } from "../utils/notice-store";
import { requireAdmin } from "../utils/session";

type NoticeBody = {
  theme?: string;
  type?: string;
  title?: string;
  content?: string;
  active?: boolean;
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
  const themeInput = String(body.theme || body.type || "").trim();
  const theme = themeInput === "error" ? "warning" : themeInput;
  const title = String(body.title || "").trim();
  const content = String(body.content || "").trim();
  const active = typeof body.active === "boolean" ? body.active : true;

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
    active,
    updatedAt: Date.now(),
    updatedBy: user.email || "admin",
  });

  return {
    success: true,
    data: {
      theme: saved.theme,
      type: saved.theme,
      title: saved.title,
      content: saved.content,
      active: saved.active,
    },
  };
});
