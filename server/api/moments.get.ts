import { readMomentsStore } from "../utils/moments-store";

export default defineEventHandler(async () => {
  const moments = await readMomentsStore();
  return {
    moments: moments.filter((item) => item.visibility === "public"),
  };
});
