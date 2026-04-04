import { getSessionUser } from "../../utils/session";

export default defineEventHandler(async (event) => {
  const user = getSessionUser(event);
  return { user: user || null };
});
