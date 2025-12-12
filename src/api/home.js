import http from "./http.js";
import { getHitokoto as mockGetHitokoto } from "./mock/index.js";
import { throttleRequest } from "@/script/netUtils.js";

const USE_MOCK = true;

export async function getHitokoto() {
  if (USE_MOCK) return mockGetHitokoto();
  const { data } = await http.get("https://v1.hitokoto.cn/?c=d&c=h&c=i&c=k");
  return {
    hitokoto: data?.hitokoto || "",
    href: "https://hitokoto.cn/?c=d&c=h&c&i&c&k",
  };
}

export const getHitokotoThrottled = throttleRequest(getHitokoto, 15000);
