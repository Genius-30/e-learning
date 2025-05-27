import React from "react";
import { Sun, Moon } from "lucide-react";

const ThemeToggleButton = React.memo(
  ({ isDarkMode, onToggle, showLabel = false }) => (
    <button
      onClick={onToggle}
      className="flex items-center space-x-2 text-sm bg-transparent cursor-pointer"
      aria-label="Toggle theme"
    >
      {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
      {showLabel && (
        <span className="text-base capitalize">
          {isDarkMode ? "Light Mode" : "Dark Mode"}
        </span>
      )}
    </button>
  )
);

export default ThemeToggleButton;
