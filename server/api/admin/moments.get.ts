import { readMomentsStore } from "../../utils/moments-store";
import { requireAdmin } from "../../utils/session";

export default defineEventHandler(async (event) => {
  requireAdmin(event);
  return {
    moments: await readMomentsStore(),
  };
});
