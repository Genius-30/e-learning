"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import MSME from "@/assets/companiesLogo/msme.webp";
import ISO from "@/assets/companiesLogo/iso.png";
import GOOGLE from "@/assets/companiesLogo/google.png";

const CompanyLogoData = [
  {
    src: MSME,
    alt: "MSME Logo",
  },
  {
    src: ISO,
    alt: "ISO Logo",
  },
  {
    src: GOOGLE,
    alt: "Google Logo",
  },
];

export default function TrustedCompaniesSection() {
  return (
    <div className="container md:p-5 md:mt-28 overflow-hidden">
      <h2 className="text-center text-xl md:text-4xl font-bold text-text mb-20">
        Trusted by the world&apos;s most innovative companies
      </h2>
      <div className="flex relative">
        <motion.div
          transition={{
            duration: 10,
            ease: "linear",
            repeat: Infinity,
          }}
          initial={{ translateX: 0 }}
          animate={{ translateX: "-50%" }}
          className="flex flex-none gap-16 md:gap-24"
        >
          {[...new Array(2)].fill(0).map((_, index) => (
            <React.Fragment key={index}>
              {CompanyLogoData.map(({ src, alt }) => (
                <Image
                  key={alt}
                  src={src}
                  alt={alt}
                  width={400}
                  height={400}
                  className={`h-[70px] md:h-[100px] w-auto object-cover grayscale-100 hover:scale-105 transition-transform duration-300 ease-in-out ${
                    alt == "MSME Logo" ? "invert" : ""
                  }`}
                />
              ))}
            </React.Fragment>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
