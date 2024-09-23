// components/LoadingScreen.tsx
import { motion } from "framer-motion";

const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-white z-50">
      <motion.div
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{
          ease: "linear",
          duration: 1,
          repeat: Infinity,
        }}
        className="w-10 h-10 border-4 border-t-transparent border-blue-500 rounded-full"
      ></motion.div>
    </div>
  );
};

export default LoadingScreen;
