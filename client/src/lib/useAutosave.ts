import { useEffect, useRef, useState } from "react";

export type AutosaveStatus = "idle" | "pending" | "saving" | "saved" | "error";

export type UseAutosaveResult = {
  status: AutosaveStatus;
  lastSavedAt?: Date;
};

/**
 * Triggers `save(value)` ~delay ms after the dependency array stops changing.
 * Reports pending/saving/saved status for a status indicator.
 *
 * This is intentionally framework-light — Week 4 backend wiring will swap
 * the `save` callback for a tRPC mutation.
 */
export function useAutosave<T>(
  value: T,
  save: (value: T) => Promise<void> | void,
  options: { delayMs?: number; enabled?: boolean } = {}
): UseAutosaveResult {
  const { delayMs = 5000, enabled = true } = options;
  const [status, setStatus] = useState<AutosaveStatus>("saved");
  const [lastSavedAt, setLastSavedAt] = useState<Date | undefined>(undefined);
  const firstRunRef = useRef(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Stable refs so the effect does not retrigger when callers pass inline fns.
  const saveRef = useRef(save);
  saveRef.current = save;

  useEffect(() => {
    if (!enabled) return;
    if (firstRunRef.current) {
      firstRunRef.current = false;
      return;
    }
    setStatus("pending");
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setStatus("saving");
      try {
        await saveRef.current(value);
        setLastSavedAt(new Date());
        setStatus("saved");
      } catch {
        setStatus("error");
      }
    }, delayMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [value, delayMs, enabled]);

  return { status, lastSavedAt };
}
