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
  const weekdayViews: number[] = [0, 0, 0, 0, 0, 0, 0];
  for (const post of posts) {
    const views = Math.max(0, Number(post?.views || 0));
    const time = parseTimestamp(post?.createdAt ?? post?.pubDate);
    if (!time) continue;
    const day = new Date(time).getDay();
    const index = day === 0 ? 6 : day - 1;
    weekdayViews[index] = (weekdayViews[index] || 0) + views;
  }
  return {
    weekdayPreference: [
      { label: "周一", value: weekdayViews[0] || 0 },
      { label: "周二", value: weekdayViews[1] || 0 },
      { label: "周三", value: weekdayViews[2] || 0 },
      { label: "周四", value: weekdayViews[3] || 0 },
      { label: "周五", value: weekdayViews[4] || 0 },
      { label: "周六", value: weekdayViews[5] || 0 },
      { label: "周日", value: weekdayViews[6] || 0 },
    ],
  };
});
