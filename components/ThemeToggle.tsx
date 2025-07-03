"use client";
import { useTheme } from "next-themes";
import { Toggle } from "@/components/ui/toggle";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  return (
    <Toggle
      aria-label="Toggle dark mode"
      pressed={isDark}
      onPressedChange={() => setTheme(isDark ? "light" : "dark")}
      className="fixed left-4 bottom-4 z-50 bg-white/80 dark:bg-gray-900/80 border border-gray-300 dark:border-gray-700 shadow-lg rounded-full p-2 flex items-center justify-center transition-colors"
      size="sm"
      variant="outline"
    >
      {isDark ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-700" />}
    </Toggle>
  );
} 