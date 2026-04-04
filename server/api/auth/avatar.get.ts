import { defineEventHandler, createError } from "h3";
import { getSessionUser } from "../../utils/session";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const user = getSessionUser(event);
  const baseUrl = String(config.public.backendBaseUrl || "")
    .trim()
    .replace(/\/+$/, "");

  if (!user || !user.picture) {
    throw createError({
      statusCode: 404,
      statusMessage: "未找到头像",
    });
  }

  // If no access token in session, we can't proxy protected resource
  if (!user.access_token) {
    throw createError({
      statusCode: 401,
      statusMessage: "缺少访问令牌，请重新登录",
    });
  }

  if (!baseUrl) {
    throw createError({
      statusCode: 500,
      statusMessage: "头像服务地址未配置",
    });
  }

  const cleanBaseUrl = baseUrl;
  let targetUrl = "";
  const pictureRaw = String(user.picture || "").trim();

  if (pictureRaw.startsWith("http://") || pictureRaw.startsWith("https://")) {
    const apiOrigin = new URL(cleanBaseUrl).origin;
    const pictureUrl = new URL(pictureRaw);
    targetUrl = `${apiOrigin}${pictureUrl.pathname}${pictureUrl.search}`;
  } else if (pictureRaw.startsWith("/file/")) {
    targetUrl = `${cleanBaseUrl}/api${pictureRaw}`;
  } else if (pictureRaw.startsWith("/api/file/")) {
    targetUrl = `${cleanBaseUrl}${pictureRaw}`;
  } else {
    targetUrl = pictureRaw.startsWith("/")
      ? `${cleanBaseUrl}${pictureRaw}`
      : `${cleanBaseUrl}/${pictureRaw}`;
  }

  // 确保URL中包含 inline=true 参数
  if (targetUrl.includes("?")) {
    if (!targetUrl.includes("inline=true")) {
      targetUrl += "&inline=true";
    }
  } else {
    targetUrl += "?inline=true";
  }

  try {
    // Proxy request with Authorization header
    const response = await $fetch.raw(targetUrl, {
      headers: {
        Authorization: `Bearer ${user.access_token}`,
      },
      responseType: "arrayBuffer",
      ignoreResponseError: true,
    });

    if (!response.ok) {
      console.error(
        "Avatar fetch failed:",
        response.status,
        response.statusText,
      );
      // 尝试解析错误信息
      const errorText = new TextDecoder().decode(response._data as ArrayBuffer);
      console.error("Error body:", errorText);

      throw createError({
        statusCode: response.status,
        statusMessage: "上游服务返回异常",
      });
    }

    // Forward content type
    const contentType = response.headers.get("content-type");
    if (contentType) {
      setHeader(event, "Content-Type", contentType);
    } else {
      // 如果后端没有返回 Content-Type，我们尝试猜测或者是默认图片
      // 通常图片应该是 image/jpeg, image/png 等
      setHeader(event, "Content-Type", "image/jpeg");
    }

    // 强制设置 Content-Length (如果能获取到)
    const contentLength = response.headers.get("content-length");
    if (contentLength) {
      setHeader(event, "Content-Length", Number(contentLength));
    }

    // 禁用缓存，防止调试时看到旧的错误图片
    // setHeader(event, 'Cache-Control', 'private, max-age=3600')
    setHeader(event, "Cache-Control", "no-cache, no-store, must-revalidate");

    // 直接返回 Buffer 数据，而不是 response._data
    // $fetch.raw 的 response._data 在 arrayBuffer 模式下应该就是 ArrayBuffer
    // 但是为了保险，我们将其转换为 Node.js Buffer
    return Buffer.from(response._data as ArrayBuffer);
  } catch (error) {
    console.error("Avatar proxy error:", error);
    // Fallback to a default avatar or error
    throw createError({
      statusCode: 500,
      statusMessage: "获取头像失败",
    });
  }
});
