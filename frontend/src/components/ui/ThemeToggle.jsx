import React from 'react';
import { FaMoon, FaSun } from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggle = () => {
  const { darkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full transition-all duration-300 focus:outline-none"
      style={{
        backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(19, 78, 94, 0.1)'
      }}
      aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {darkMode ? (
        <FaSun className="text-yellow-300 text-xl" />
      ) : (
        <FaMoon className="text-[#134e5e] text-xl" />
      )}
    </button>
  );
};

export default ThemeToggle;