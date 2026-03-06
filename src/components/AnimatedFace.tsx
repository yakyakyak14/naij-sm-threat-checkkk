import { useEffect, useState } from "react";
import "@/components/ui/security-card.css";

export function AnimatedFace({ className }: { className?: string }) {
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationKey((prev) => prev + 1);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative" key={animationKey}>
      <svg
        viewBox="0 0 80 96"
        fill="none"
        className={
          className ??
          "w-[320px] h-[384px] sm:w-[400px] sm:h-[480px] lg:w-[480px] lg:h-[576px]"
        }
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      >
        {/* Base face outline (dim) */}
        <path
          d="M26.22 78.25c2.679-3.522 1.485-17.776 1.485-17.776-1.084-2.098-1.918-4.288-2.123-5.619-3.573 0-3.7-8.05-3.827-9.937-.102-1.509 1.403-1.383 2.169-1.132-.298-1.3-.92-5.408-1.021-11.446C22.775 24.794 30.94 17.75 40 17.75h.005c9.059 0 17.225 7.044 17.097 14.59-.102 6.038-.723 10.147-1.021 11.446.765-.251 2.271-.377 2.169 1.132-.128 1.887-.254 9.937-3.827 9.937-.205 1.331-1.039 3.521-2.123 5.619 0 0-1.194 14.254 1.485 17.776"
          className="stroke-muted-foreground/30"
        />
        <path
          d="M27.705 60.474a26.884 26.884 0 0 0 1.577 2.682c1.786 2.642 5.36 6.792 10.718 6.792h.005c5.358 0 8.932-4.15 10.718-6.792a26.884 26.884 0 0 0 1.577-2.682"
          className="stroke-muted-foreground/30"
        />
        {/* Animated glowing outline */}
        <path
          d="M26.22 78.25c2.679-3.522 1.485-17.776 1.485-17.776-1.084-2.098-1.918-4.288-2.123-5.619-3.573 0-3.7-8.05-3.827-9.937-.102-1.509 1.403-1.383 2.169-1.132-.298-1.3-.92-5.408-1.021-11.446C22.775 24.794 30.94 17.75 40 17.75h.005c9.059 0 17.225 7.044 17.097 14.59-.102 6.038-.723 10.147-1.021 11.446.765-.251 2.271-.377 2.169 1.132-.128 1.887-.254 9.937-3.827 9.937-.205 1.331-1.039 3.521-2.123 5.619 0 0-1.194 14.254 1.485 17.776"
          className="animate-draw-outline stroke-[hsl(190,100%,50%)] [filter:drop-shadow(0_0_8px_hsl(190,100%,50%))]"
        />
        <path
          d="M27.705 60.474a26.884 26.884 0 0 0 1.577 2.682c1.786 2.642 5.36 6.792 10.718 6.792h.005c5.358 0 8.932-4.15 10.718-6.792a26.884 26.884 0 0 0 1.577-2.682"
          className="animate-draw stroke-[hsl(190,100%,50%)] [filter:drop-shadow(0_0_8px_hsl(190,100%,50%))]"
        />
      </svg>
    </div>
  );
}
