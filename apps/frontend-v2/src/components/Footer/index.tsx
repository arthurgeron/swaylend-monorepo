import React from 'react';
import { Line } from '../Line';

export const Footer = () => {
  return (
    <div>
      <Line />
      <div className="min-h-[56px] relative flex justify-between overflow-hidden items-center px-4 sm:px-16 py-4 text-moon text-xs sm:text-md">
        {/* biome-ignore lint/a11y/useValidAnchor: <explanation> */}
        <a href="#">Terms</a>
        Swaylend. All Rights Reserved. © 2024
        <div className="absolute top-[calc(100%)] opacity-60 rounded-full left-[calc(50%-16%)] w-[32%] h-[40px] sm:w-[500px] sm:h-[200px] z-[-10] bg-primary blur-3xl" />
      </div>
    </div>
  );
};
