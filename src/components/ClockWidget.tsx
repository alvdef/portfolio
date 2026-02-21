'use client';

import { useEffect, useState } from 'react';

function formatNow(date: Date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
}

export default function ClockWidget() {
  const [value, setValue] = useState('--:--:--');

  useEffect(() => {
    const tick = () => setValue(formatNow(new Date()));
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, []);

  return <span className="mono-widget">{value}</span>;
}
