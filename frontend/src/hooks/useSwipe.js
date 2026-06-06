import { useRef } from "react";

/**
 * useSwipe — minimal touch-swipe detector for left/right navigation
 * (e.g. image galleries). Pointer / mouse drag is intentionally not
 * detected — desktop users have the chevron buttons and arrow keys.
 *
 * Vertical-scroll-safe: the horizontal delta must DOMINATE the vertical
 * delta before a swipe fires, so the page can still be scrolled
 * normally by dragging up/down on the swipeable surface.
 *
 * Returns:
 *   - swipeHandlers: spread onto the swipeable element
 *       <div {...swipeHandlers} className="touch-pan-y" />
 *     Pair with the Tailwind `touch-pan-y` class so the browser lets
 *     this element absorb horizontal pans but still owns vertical
 *     scroll handling.
 *
 *   - wasSwiped(): read inside an onClick handler to suppress the
 *     synthesized click that browsers fire at the end of a touch.
 *     Returns true once after each meaningful swipe.
 */
export default function useSwipe({
  onSwipeLeft,
  onSwipeRight,
  threshold = 40,
} = {}) {
  const startRef = useRef(null);
  const currentRef = useRef(null);
  const wasSwipedRef = useRef(false);

  const onTouchStart = (e) => {
    const t = e.touches?.[0];
    if (!t) return;
    startRef.current = { x: t.clientX, y: t.clientY };
    currentRef.current = { x: t.clientX, y: t.clientY };
    wasSwipedRef.current = false;
  };

  const onTouchMove = (e) => {
    const t = e.touches?.[0];
    if (!t || !startRef.current) return;
    currentRef.current = { x: t.clientX, y: t.clientY };
  };

  const onTouchEnd = () => {
    if (!startRef.current || !currentRef.current) {
      startRef.current = null;
      currentRef.current = null;
      return;
    }
    const dx = currentRef.current.x - startRef.current.x;
    const dy = currentRef.current.y - startRef.current.y;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > threshold) {
      wasSwipedRef.current = true;
      if (dx < 0) onSwipeLeft?.();
      else onSwipeRight?.();
    }
    startRef.current = null;
    currentRef.current = null;
  };

  return {
    swipeHandlers: { onTouchStart, onTouchMove, onTouchEnd },
    wasSwiped: () => wasSwipedRef.current,
  };
}
