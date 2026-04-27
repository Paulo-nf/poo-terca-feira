import { useState, useEffect } from "react";

export function useCountdown(target: string) {
  const calc = () => {
    const diff = new Date(target).getTime() - Date.now();
    if (diff <= 0) return { h: "00", m: "00", s: "00" };
    return {
      h: String(Math.floor(diff / 3600000)).padStart(2, "0"),
      m: String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0"),
      s: String(Math.floor((diff % 60000) / 1000)).padStart(2, "0"),
    };
  };

  const [time, setTime] = useState(calc);

  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, [target]);

  return time;
}
