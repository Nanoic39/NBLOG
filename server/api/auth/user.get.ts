import { getSessionUser } from "../../utils/session";

type UserResponse = {
  user: Record<string, any> | null;
};

const resolveAdminRole = (
  currentRole: unknown,
  payload: Record<string, any> | null | undefined,
  userEmail: unknown,
  adminEmailRaw: unknown,
) => {
  const roleCandidates = [
    currentRole,
    payload?.role,
    payload?.userRole,
    Array.isArray(payload?.roles) ? payload?.roles[0] : undefined,
  ]
    .map((item) => String(item || "").trim().toLowerCase())
    .filter(Boolean);
  const hasAdminRole = roleCandidates.some((role) => role.includes("admin"));
  const adminEmail = String(adminEmailRaw || "").trim().toLowerCase();
  const email = String(payload?.email || userEmail || "").trim().toLowerCase();
  if (hasAdminRole) return "admin";
  if (adminEmail && email && adminEmail === email) return "admin";
  return "user";
};

export default defineEventHandler(async (event): Promise<UserResponse> => {
  const config = useRuntimeConfig();
  const user = getSessionUser(event);
  if (!user?.access_token) {
    return {
      user: user
        ? {
            ...user,
            role: resolveAdminRole(user.role, null, user.email, config.adminEmail),
          }
        : null,
    };
  }
  const yunaBase = String(
    (config.public as any).yunaCoreApiBaseUrl || config.public.oauthApiBaseUrl || "",
  )
    .trim()
    .replace(/\/+$/, "");
  if (!yunaBase) {
    return {
      user: {
        ...user,
        role: resolveAdminRole(user.role, null, user.email, config.adminEmail),
      },
    };
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
      role: resolveAdminRole(user.role, payload, user.email, config.adminEmail),
      picture: payload?.picture ?? payload?.avatar ?? payload?.headImg ?? user.picture ?? "",
    };
    return { user: merged };
  } catch {
    return {
      user: user
        ? {
            ...user,
            role: resolveAdminRole(user.role, null, user.email, config.adminEmail),
          }
        : null,
    };
  }
});
