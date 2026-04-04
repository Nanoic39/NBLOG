import { requestUpstream } from "../../utils/session";

export default defineEventHandler(async (event) => {
  return await requestUpstream(event, {
    path: "/api/admin/overview",
    auth: "admin",
  });
});
