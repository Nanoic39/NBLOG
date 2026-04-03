import { readDoing } from "../../utils/doing-store";
import { readNotice } from "../../utils/notice-store";
import { readPostsStore } from "../../utils/posts-store";
import { requireAdmin } from "../../utils/session";

export default defineEventHandler(async (event) => {
  requireAdmin(event);
  const [doing, notice, posts] = await Promise.all([
    readDoing(),
    readNotice(),
    readPostsStore(),
  ]);

  return {
    doing,
    notice: {
      theme: notice.theme,
      title: notice.title,
      content: notice.content,
      active: notice.active,
    },
    stats: {
      postTotal: posts.regular.length + posts.pinned.length,
      pinnedTotal: posts.pinned.length,
      regularTotal: posts.regular.length,
      tagTotal: new Set(
        [...posts.regular, ...posts.pinned].flatMap((item) => item.tags || []),
      ).size,
    },
  };
});
