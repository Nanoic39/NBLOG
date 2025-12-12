import http from "./http.js";
import { getAboutInfo as mockGetAboutInfo } from "./mock/index.js";

const USE_MOCK = true;

export async function getAboutInfo() {
  if (USE_MOCK) return mockGetAboutInfo();
  const { data } = await http.get(`/api/about`);
  return data;
}
