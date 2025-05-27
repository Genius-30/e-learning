"use client";

import Link from "next/link";
import {
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandTwitter,
  IconBrandFacebook,
} from "@tabler/icons-react";

export const Footer = () => {
  return (
    <footer className="w-full lg:max-w-[80%] bg-background text-white border-t border-card mx-auto px-6 py-14 mt-20 sm:mt-28">
      <div className="container mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-text">
        {/* Company Info */}
        <div>
          <h2 className="text-xl font-semibold mb-4">E-Learning</h2>
          <p className="text-sm text-gray-400">
            Empowering learning with high-quality courses and resources.
          </p>
          {/* Copyright */}
          <div className="mt-10 text-xs sm:text-sm text-gray-500">
            &copy; {new Date().getFullYear()} E-Learning. All rights reserved.
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-medium mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm sm:text-base">
            <li>
              <Link href="/about" className="text-gray-400 hover:text-white">
                About Us
              </Link>
            </li>
            <li>
              <Link href="/courses" className="text-gray-400 hover:text-white">
                Courses
              </Link>
            </li>
            <li>
              <Link href="/contact" className="text-gray-400 hover:text-white">
                Contact
              </Link>
            </li>
            <li>
              <Link href="/faq" className="text-gray-400 hover:text-white">
                FAQ
              </Link>
            </li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h3 className="text-lg font-medium mb-4">Support</h3>
          <ul className="space-y-2 text-sm sm:text-base">
            <li>
              <Link
                href="/privacy-policy"
                className="text-gray-400 hover:text-white"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="text-gray-400 hover:text-white">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link href="/help" className="text-gray-400 hover:text-white">
                Help Center
              </Link>
            </li>
          </ul>
        </div>

        {/* Social Media */}
        <div>
          <h3 className="text-lg font-medium mb-4">Follow Us</h3>
          <div className="flex space-x-4">
            <Link
              href="https://www.facebook.com/"
              className="text-gray-400 hover:text-white text-xl"
            >
              <IconBrandFacebook />
            </Link>
            <Link
              href="https://x.com/"
              className="text-gray-400 hover:text-white text-xl"
            >
              <IconBrandTwitter />
            </Link>
            <Link
              href="https://linkedin.com"
              className="text-gray-400 hover:text-white text-xl"
            >
              <IconBrandLinkedin />
            </Link>
            <Link
              href="https://instagram.com"
              className="text-gray-400 hover:text-white text-xl"
            >
              <IconBrandInstagram />
            </Link>
          </div>
        </div>
      </div>

      {/* Gradient Footer Text */}
      <div className="text-center mt-10 flex flex-col items-center">
        <span className="bg-gradient-to-b from-background to-border-color bg-clip-text text-transparent text-[2.5rem] sm:text-[4rem] md:text-[6rem] lg:text-[8rem] xl:text-[9.5rem] font-bold leading-none">
          E-Learning
        </span>
        <span className="text-gray-500 text-lg tracking-widest">
          Powered by CodeBit
        </span>
      </div>
    </footer>
  );
};
