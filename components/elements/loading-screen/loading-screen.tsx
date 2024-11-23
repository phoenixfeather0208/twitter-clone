import React from "react";

const LoadingScreen = () => {
  return (
    <div className="fixed top-0 left-0 w-dvw h-dvh z-50 flex justify-center items-center">
      <span className="sm:h-16 sm:w-16 h-12 w-12 dark:fill-white">
        <img src="./logo/logo_big.jpg" alt="" className="rounded-xl" />
      </span>
    </div>
  );
};

export default LoadingScreen;
