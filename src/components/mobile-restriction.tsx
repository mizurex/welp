"use client";

import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";
import { Instrument_Serif } from "next/font/google";
const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
});

interface MobileRestrictionProps {
  children: React.ReactNode;
}

const MobileRestriction: React.FC<MobileRestrictionProps> = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobileUserAgent =
        /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
          userAgent
        );
      const isSmallScreen = window.innerWidth <= 768;

      setIsMobile(isMobileUserAgent || isSmallScreen);
      setIsLoading(false);
    };

    checkDevice();
    const handleResize = () => {
      const isSmallScreen = window.innerWidth <= 768;
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobileUserAgent =
        /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
          userAgent
        );
      setIsMobile(isMobileUserAgent || isSmallScreen);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-foreground" />
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 px-4">
        <div className="max-w-md w-full px-6 py-8 bg-white/80  border border-neutral-200  rounded-2xl text-center">
          <h1
            className={`text-4xl tracking-tight text-neutral-900 mb-2 ${instrumentSerif.className}`}
          >
            welp
          </h1>
          <p className="text-neutral-700 text-base leading-relaxed">
            <span>
              {" "}
              Welp is not optimized for small screens. Please switch to a
              desktop or laptop for the best experience.
            </span>
          </p>

          <div className="mt-6 space-y-2 text-left">
            <p className="text-sm text-neutral-500">Why desktop only?</p>
            <ul className="text-sm text-neutral-600 space-y-1 list-disc pl-5">
              <li>More space for interactive nodes</li>
              <li>Mouse/trackpad precision for editing nodes</li>
              <li>Smoother performance and navigation</li>
            </ul>
          </div>
          <div className="mt-8 flex justify-center">
            <Link href="/" passHref>
              <Button className="">Return Home</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default MobileRestriction;
