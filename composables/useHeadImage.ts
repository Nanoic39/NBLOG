export const useHeadImage = () => {
  const modules = import.meta.glob<{ default: string }>(
    "/assets/image/HEADIMAGE.{jpg,png}",
    { eager: true },
  );

  const entries = Object.entries(modules);
  entries.sort(([a], [b]) => {
    const aPng = a.toLowerCase().endsWith(".png");
    const bPng = b.toLowerCase().endsWith(".png");
    if (aPng !== bPng) return aPng ? -1 : 1;
    return a.localeCompare(b);
  });

  const first = entries[0]?.[1];
  return first?.default || "";
};

