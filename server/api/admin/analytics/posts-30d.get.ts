import { requestUpstream, unwrapApiData } from "../../../utils/session";

const parseTimestamp = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value < 1_000_000_000_000 ? value * 1000 : value;
  }
  const raw = String(value ?? "").trim();
  if (!raw) return 0;
  const asNumber = Number(raw);
  if (Number.isFinite(asNumber)) {
    return asNumber < 1_000_000_000_000 ? asNumber * 1000 : asNumber;
  }
  const parsed = Date.parse(raw);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatDate = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;

export default defineEventHandler(async (event) => {
  const upstream = await requestUpstream<any>(event, {
    path: "/api/admin/posts",
    auth: "admin",
  });
  const payload = unwrapApiData<any>(upstream);
  const posts = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.posts)
      ? payload.posts
      : Array.isArray(payload?.list)
        ? payload.list
        : [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const baseDays = Array.from({ length: 30 }).map((_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (29 - index));
    return {
      date: formatDate(date),
      posts: 0,
    };
  });
  const map = new Map(baseDays.map((item) => [item.date, item]));
  for (const post of posts) {
    const timestamp = parseTimestamp(post?.createdAt ?? post?.pubDate);
    if (!timestamp) continue;
    const dateKey = formatDate(new Date(timestamp));
    const current = map.get(dateKey);
    if (!current) continue;
    current.posts += 1;
  }
  return {
    analysis30d: baseDays,
  };
});
