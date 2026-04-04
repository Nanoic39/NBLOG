import { createError, defineEventHandler, readMultipartFormData } from "h3";
import { getSessionUser } from "../../utils/session";

const unwrap = <T>(value: T | { data?: T } | null | undefined): T | null => {
  if (!value) return null;
  if (
    typeof value === "object" &&
    "data" in (value as Record<string, unknown>)
  ) {
    return ((value as { data?: T }).data ?? null) as T | null;
  }
  return value as T;
};

const pickValue = (payload: any): string => {
  if (!payload) return "";
  if (typeof payload === "string") return payload.trim();
  if (Array.isArray(payload)) {
    for (const item of payload) {
      const result = pickValue(item);
      if (result) return result;
    }
    return "";
  }
  if (typeof payload !== "object") return "";

  const possibleKeys = [
    "url",
    "fileUrl",
    "fileURL",
    "path",
    "filePath",
    "downloadUrl",
    "downloadURL",
    "src",
  ];
  for (const key of possibleKeys) {
    const val = (payload as Record<string, any>)[key];
    const result = pickValue(val);
    if (result) return result;
  }
  return "";
};

const toAbsoluteUrl = (apiBaseUrl: string, raw: string): string => {
  if (!raw) return "";
  if (
    raw.startsWith("http://") ||
    raw.startsWith("https://") ||
    raw.startsWith("data:")
  ) {
    return raw;
  }
  if (raw.startsWith("/api/file/")) {
    return `${apiBaseUrl}${raw}`;
  }
  if (raw.startsWith("/file/")) {
    return `${apiBaseUrl}/api${raw}`;
  }
  if (raw.startsWith("/")) {
    return `${apiBaseUrl}${raw}`;
  }
  return `${apiBaseUrl}/${raw}`;
};

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const apiBaseUrl = String(config.public.backendBaseUrl || "")
    .trim()
    .replace(/\/+$/, "");
  if (!apiBaseUrl) {
    throw createError({
      statusCode: 500,
      statusMessage: "上传服务地址未配置",
    });
  }

  const user = getSessionUser(event);
  if (!user?.access_token) {
    throw createError({
      statusCode: 401,
      statusMessage: "未登录或会话已失效，请重新登录",
    });
  }

  const form = await readMultipartFormData(event);
  const filePart = form?.find(
    (item) => item.name === "file" || item.name === "image",
  );
  if (!filePart?.data?.length) {
    throw createError({
      statusCode: 400,
      statusMessage: "缺少图片文件",
    });
  }

  const mimeType = String(filePart.type || "").toLowerCase();
  if (!mimeType.startsWith("image/")) {
    throw createError({
      statusCode: 400,
      statusMessage: "仅支持图片文件上传",
    });
  }

  const uploadEndpoints = [
    `${apiBaseUrl}/api/file/upload`,
    `${apiBaseUrl}/api/file/upload/image`,
    `${apiBaseUrl}/api/file/upload-img`,
  ];
  const uploadFields = ["file", "image", "uploadFile"];
  let lastErrorMessage = "";

  for (const endpoint of uploadEndpoints) {
    for (const fieldName of uploadFields) {
      const upstreamForm = new FormData();
      const bytes = new Uint8Array(
        filePart.data.buffer,
        filePart.data.byteOffset,
        filePart.data.byteLength,
      );
      const blob = new Blob([Uint8Array.from(bytes)], {
        type: filePart.type || "application/octet-stream",
      });
      upstreamForm.append(
        fieldName,
        blob,
        filePart.filename || `comment-image-${Date.now()}.png`,
      );

      try {
        const response = await $fetch.raw(endpoint, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${user.access_token}`,
          },
          body: upstreamForm,
          ignoreResponseError: true,
        });

        if (!response.ok) {
          lastErrorMessage = `上游上传失败（${response.status}）`;
          continue;
        }

        const payload =
          unwrap<Record<string, any>>(response._data as Record<string, any>) ||
          response._data;
        const rawPath = pickValue(payload);
        const absoluteUrl = toAbsoluteUrl(apiBaseUrl, rawPath);
        if (!absoluteUrl) {
          lastErrorMessage = "上游上传成功但未返回图片地址";
          continue;
        }

        return {
          success: true,
          data: {
            url: absoluteUrl,
            rawPath,
          },
        };
      } catch (error: any) {
        lastErrorMessage =
          error?.data?.message || error?.statusMessage || "上传失败";
      }
    }
  }

  throw createError({
    statusCode: 502,
    statusMessage: lastErrorMessage || "图片上传失败，请稍后重试",
  });
});
