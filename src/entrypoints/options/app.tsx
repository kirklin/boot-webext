import type { Theme } from "~/lib/storage";
import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";
import { PageHeader } from "~/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group";
import { useStorageItem } from "~/hooks/use-storage-item";
import { useTheme } from "~/hooks/use-theme";
import { storageDemo } from "~/lib/storage";

const themes = [
  { value: "light", label: "Light", icon: SunIcon },
  { value: "dark", label: "Dark", icon: MoonIcon },
  { value: "system", label: "System", icon: MonitorIcon },
] satisfies { value: Theme; label: string; icon: typeof SunIcon }[];

export default function App() {
  const [storageValue, setStorageValue, storageReady] = useStorageItem(storageDemo);
  const { theme, setTheme } = useTheme();

  return (
    <main className="mx-auto flex max-w-md flex-col gap-6 px-4 py-10">
      <PageHeader title="Options" context="options" />
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>Saved in extension storage and shared with every page and tab.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="storage-demo">Storage demo</Label>
            <Input
              id="storage-demo"
              value={storageValue}
              disabled={!storageReady}
              onChange={event => void setStorageValue(event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label id="theme-label">Theme</Label>
            <ToggleGroup
              type="single"
              variant="outline"
              aria-labelledby="theme-label"
              value={theme}
              onValueChange={(value: Theme | "") => value && void setTheme(value)}
            >
              {themes.map(({ value, label, icon: Icon }) => (
                <ToggleGroupItem key={value} value={value}>
                  <Icon />
                  {label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </CardContent>
      </Card>
      <p className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
        Powered by Boot WebExt
        <span className="i-[pixelarticons--zap]" />
      </p>
    </main>
  );
}
