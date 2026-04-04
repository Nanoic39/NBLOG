import { requestUpstream, unwrapApiData } from "../utils/session";

export default defineEventHandler(async (event) => {
  const upstream = await requestUpstream<any>(event, {
    path: "/api/doing",
  });
  return unwrapApiData<any>(upstream);
});
