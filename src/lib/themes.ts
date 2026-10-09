import type { Theme } from "~/lib/storage";
import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";

export const THEMES = [
  { value: "light", label: "Light", icon: SunIcon },
  { value: "dark", label: "Dark", icon: MoonIcon },
  { value: "system", label: "System", icon: MonitorIcon },
] satisfies { value: Theme; label: string; icon: typeof SunIcon }[];
