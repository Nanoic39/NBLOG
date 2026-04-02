import { createError, getCookie, type H3Event } from "h3";

export type SessionUser = {
  role?: string;
  email?: string;
  access_token?: string;
  [key: string]: any;
};

export const getSessionUser = (event: H3Event): SessionUser | null => {
  const sessionCookie = getCookie(event, "user_session");
  if (!sessionCookie) {
    return null;
  }

  try {
    const sessionData = Buffer.from(sessionCookie, "base64").toString("utf-8");
    const user = JSON.parse(sessionData) as SessionUser;
    return user;
  } catch {
    return null;
  }
};

export const requireAdmin = (event: H3Event): SessionUser => {
  const user = getSessionUser(event);
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  if (user.role !== "admin") {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  }

  return user;
};
