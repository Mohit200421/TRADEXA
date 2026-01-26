import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
    >
      <div className="relative w-6 h-6">
        <Sun className={`w-6 h-6 text-yellow-500 transition-all duration-300 absolute inset-0 ${
          theme === 'light' ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'
        }`} />
        <Moon className={`w-6 h-6 text-blue-400 transition-all duration-300 absolute inset-0 ${
          theme === 'dark' ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90'
        }`} />
      </div>
    </button>
  );
};

export default ThemeToggle;