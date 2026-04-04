import { getSessionUser } from "../../utils/session";

type UserResponse = {
  user: Record<string, any> | null;
};

export default defineEventHandler(async (event): Promise<UserResponse> => {
  const config = useRuntimeConfig();
  const user = getSessionUser(event);
  if (!user?.access_token) {
    return { user: user || null };
  }
  const yunaBase = String(
    (config.public as any).yunaCoreApiBaseUrl || config.public.oauthApiBaseUrl || "",
  )
    .trim()
    .replace(/\/+$/, "");
  if (!yunaBase) {
    return { user };
  }
  try {
    const upstream: unknown = await $fetch(`${yunaBase}/api/user/oauth2/userinfo`, {
      headers: {
        Authorization: `Bearer ${user.access_token}`,
      },
    });
    const payload: Record<string, any> =
      upstream &&
      typeof upstream === "object" &&
      "data" in (upstream as Record<string, unknown>)
        ? (upstream as any).data
        : (upstream as Record<string, any>);
    const merged = {
      ...user,
      ...payload,
      email: payload?.email ?? user.email ?? "",
      role: user.role ?? payload?.role ?? payload?.userRole ?? "user",
      picture: payload?.picture ?? payload?.avatar ?? payload?.headImg ?? user.picture ?? "",
    };
    return { user: merged };
  } catch {
    return { user };
  }
});
