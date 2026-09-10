import { useEffect, useState, type RefObject } from "react";

const A4_WIDTH_PX = 794;

export function useFitScale(
  ref: RefObject<HTMLElement>,
  baseWidth = A4_WIDTH_PX,
  maxScale = 1
): number {
  const [scale, setScale] = useState(maxScale);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const recompute = () => {
      const available = el.clientWidth;
      if (available <= 0) return;
      const next = Math.min(maxScale, available / baseWidth);
      setScale(next > 0 ? next : maxScale);
    };

    recompute();
    const observer = new ResizeObserver(recompute);
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, baseWidth, maxScale]);

  return scale;
}
