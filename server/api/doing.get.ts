import { readDoing } from "../utils/doing-store";

export default defineEventHandler(async () => {
  return await readDoing();
});
