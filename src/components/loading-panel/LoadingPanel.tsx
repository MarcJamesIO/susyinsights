// components/LoadingScreen.tsx
import { motion } from "framer-motion";
import React from "react";
import HouseAnimation from "./HouseAnimation";
interface LoadingPanelProps {
  loadingText: string;
}

const LoadingPanel: React.FC<LoadingPanelProps> = ({ loadingText }) => {
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full flex items-center justify-center bg-white z-50 opacity-100 flex flex-col">
      {/* Uncomment the following line if you want to display the logo */}
      {/* <Image src="/logo-sml.png" alt="logo" width={50} height={55} /> */}
      <HouseAnimation />
      <br />
      <p className="text-susyBlue mb-12 font-bold mt-8">{loadingText}</p>

      {/* <motion.div
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{
          ease: "linear",
          duration: 1,
          repeat: Infinity,
        }}
        className="w-10 h-10 border-4 border-t-transparent border-susyBlue rounded-full"
      ></motion.div> */}
    </div>
  );
};

export default LoadingPanel;
