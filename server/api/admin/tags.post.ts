import { createError, readBody } from "h3";
import { readPostsStore, savePostsStore } from "../../utils/posts-store";
import { requireAdmin } from "../../utils/session";

type Body =
  | {
      action?: "rename";
      name?: string;
      newName?: string;
    }
  | {
      action?: "delete";
      name?: string;
    };

const normalizeTags = (tags: string[]) => {
  const set = new Set(
    tags
      .map((item) => String(item || "").trim())
      .filter(Boolean),
  );
  return Array.from(set);
};

export default defineEventHandler(async (event) => {
  requireAdmin(event);
  const body = (await readBody(event)) as Body | null;
  if (!body) {
    throw createError({ statusCode: 400, statusMessage: "请求体格式无效" });
  }

  const action = String(body.action || "").trim();
  const name = String((body as any).name || "").trim();
  if (!action || !name) {
    throw createError({ statusCode: 400, statusMessage: "action、name 为必填项" });
  }

  const store = await readPostsStore();
  const updatePostTags = (tags: string[]) => {
    if (action === "delete") {
      return normalizeTags(tags.filter((tag) => tag !== name));
    }
    if (action === "rename") {
      const newName = String((body as any).newName || "").trim();
      if (!newName) {
        throw createError({ statusCode: 400, statusMessage: "newName 为必填项" });
      }
      return normalizeTags(tags.map((tag) => (tag === name ? newName : tag)));
    }
    throw createError({ statusCode: 400, statusMessage: "action 仅支持 rename/delete" });
  };

  const nextPinned = store.pinned.map((post) => ({
    ...post,
    tags: updatePostTags(Array.isArray(post.tags) ? post.tags : []),
  }));
  const nextRegular = store.regular.map((post) => ({
    ...post,
    tags: updatePostTags(Array.isArray(post.tags) ? post.tags : []),
  }));

  await savePostsStore({
    pinned: nextPinned,
    regular: nextRegular,
  });

  return { success: true };
});
