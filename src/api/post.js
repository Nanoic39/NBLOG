import http from "./http.js";
import {
  getPostById as mockGetPostById,
  getPostComments as mockGetPostComments,
} from "./mock/index.js";

const USE_MOCK = true;

export async function getPostById(id) {
  if (USE_MOCK) return mockGetPostById(id);
  const { data } = await http.get(`/api/posts/${id}`);
  return data;
}

export async function getPostComments(id) {
  if (USE_MOCK) return mockGetPostComments(id);
  const { data } = await http.get(`/api/posts/${id}/comments`);
  return data;
}
