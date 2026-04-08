import { createError } from "h3";
import { requestUpstream, unwrapApiData } from "../../utils/session";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const slug = String(query.slug || "").trim();
  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: "缺少文章 slug",
    });
  }

  const listRaw = await requestUpstream<any>(event, {
    path: "/api/posts/latest",
    query: { page: 1, size: 500 },
  });
  const listPayload = unwrapApiData<any>(listRaw);
  const list = Array.isArray(listPayload)
    ? listPayload
    : Array.isArray(listPayload?.posts)
      ? listPayload.posts
      : Array.isArray(listPayload?.list)
        ? listPayload.list
        : Array.isArray(listPayload?.records)
          ? listPayload.records
          : [];
  const hit = list.find(
    (item: any) => String(item?.slug || "").trim() === slug,
  );
  if (!hit?.id) {
    throw createError({
      statusCode: 404,
      statusMessage: "未找到对应文章",
    });
  }
  const detailRaw = await requestUpstream<any>(event, {
    path: `/api/posts/${encodeURIComponent(String(hit.id))}`,
  });
  const detail = unwrapApiData<any>(detailRaw);
  const lastModified = detail?.updatedAt ?? "";
  return {
    // TODO：点击输入文本。（待删除）
    ...detail,
    editDate: lastModified ?? detail?.editDate,
    updatedAt: detail?.updatedAt ?? hit?.updatedAt,
    updateTime: detail?.updateTime ?? hit?.updateTime,
    modifiedAt: detail?.modifiedAt ?? hit?.modifiedAt,
    modifyTime: detail?.modifyTime ?? hit?.modifyTime,
    content:
      detail?.content ||
      `# ${detail?.title || ""}\n\n${detail?.description || ""}`,
  };
});
