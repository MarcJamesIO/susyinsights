import React, { useEffect, useRef, useState } from "react";
import { motion, useAnimation, SVGMotionProps } from "framer-motion";

interface AnimatedStrokeProps extends SVGMotionProps<SVGPathElement> {
  d: string;
}

const AnimatedStroke: React.FC<AnimatedStrokeProps> = ({ d, ...props }) => {
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = useState(0);

  useEffect(() => {
    if (pathRef.current) {
      setPathLength(pathRef.current.getTotalLength());
    }
  }, [d]);

  const controls = useAnimation();

  useEffect(() => {
    controls.start({
      strokeDashoffset: [pathLength, 0],
      transition: {
        duration: 2,
        ease: "linear",
        repeat: Infinity, // Loop the animation infinitely
        repeatType: "loop", // This ensures the animation restarts after it ends
      },
    });
  }, [pathLength, controls]);

  return (
    <motion.path
      ref={pathRef}
      d={d}
      stroke="url(#gradient)"
      strokeLinecap="round"
      strokeWidth={8.5}
      strokeDasharray={pathLength}
      animate={controls}
      {...props}
    />
  );
};

const HouseAnimation: React.FC = () => {
  return (
    <div>
      <svg
        width="100"
        height="100"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#353EA4" />
            <stop offset="100%" stopColor="#FF8080" />
          </linearGradient>
        </defs>
        <AnimatedStroke d="M91.213 82.092V48.464c0-4.726-1.971-9.245-5.45-12.491L53.689 6.033c-3.353-3.13-8.597-3.13-11.95 0L9.661 35.973a17.087 17.087 0 0 0-5.45 12.491v33.628c0 4.746 3.896 8.594 8.7 8.594h69.6c4.806 0 8.7-3.848 8.7-8.594Z" />
      </svg>
    </div>
  );
};

export default HouseAnimation;
