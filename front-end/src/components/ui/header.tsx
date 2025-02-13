"use client";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

export default function Header() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <header
      className={`border-b ${
        darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"
      } shadow-sm`}
    >
      <div className="container mx-auto flex items-center justify-between py-4 px-6">
        {/* Logo */}
        <div className="text-2xl font-bold">
          <a href="/">Transparência</a>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex space-x-8">
          <a href="#features" className="hover:text-blue-500 transition">
            Coisa1
          </a>
          <a href="#pricing" className="hover:text-blue-500 transition">
            Coisa2
          </a>
          <a href="#about" className="hover:text-blue-500 transition">
            Coisa3
          </a>
          <div className="relative group">
            <button className="hover:text-blue-500 transition">Coisa4</button>
            <div className="absolute left-0 top-full hidden w-48 bg-white border shadow-lg group-hover:block">
              <a href="#team" className="block px-4 py-2 hover:bg-gray-100">
                Coisa5
              </a>
              <a href="#blog" className="block px-4 py-2 hover:bg-gray-100">
                Coisa6
              </a>
            </div>
          </div>
        </nav>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          {/* Dark Mode Switch */}
          <Switch
            checked={darkMode}
            onCheckedChange={setDarkMode}
            className="bg-gray-300"
          >
            {darkMode ? "Dark" : "Light"}
          </Switch>
          {/* Call to Action Button */}
          <Button className="hidden md:block bg-blue-500 text-white hover:bg-blue-600">
            Login
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Button variant="ghost">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </Button>
        </div>
      </div>
    </header>
  );
}
