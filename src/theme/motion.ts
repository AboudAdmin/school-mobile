import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

// docs/MOBILE_MASTER_PLAN.md §3.11: short, purposeful transitions; non-essential motion off under "Reduce motion"
export const duration = { fast: 150, base: 220, slow: 300 } as const;

/** Live OS "Reduce motion" / "Remove animations" setting (updates when the user toggles it). */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduced).catch(() => {});
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => sub.remove();
  }, []);
  return reduced;
}
