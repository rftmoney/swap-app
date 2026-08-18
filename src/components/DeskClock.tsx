"use client";

import { useEffect, useState } from "react";

export function DeskClock() {
  // Rendered only after mount so server and client markup never disagree.
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => setTime(utcTime());
    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <span className="desk-clock" suppressHydrationWarning>
      UTC {time ?? "--:--:--"}
    </span>
  );
}

function utcTime() {
  return new Date().toISOString().slice(11, 19);
}
