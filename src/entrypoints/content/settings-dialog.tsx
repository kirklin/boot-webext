import type { Theme } from "~/lib/storage";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { useStorageItem } from "~/hooks/use-storage-item";
import { useTheme } from "~/hooks/use-theme";
import { storageDemo } from "~/lib/storage";
import { THEMES } from "~/lib/themes";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCloseAutoFocus: (event: Event) => void;
}

export function SettingsDialog({ open, onOpenChange, onCloseAutoFocus }: SettingsDialogProps) {
  const [storageValue, setStorageValue, storageReady] = useStorageItem(storageDemo);
  const { theme, setTheme, ready: themeReady } = useTheme();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm" onCloseAutoFocus={onCloseAutoFocus}>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Saved in extension storage and shared with every page and tab.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Label htmlFor="content-storage-demo">Storage demo</Label>
          <Input
            id="content-storage-demo"
            value={storageValue}
            disabled={!storageReady}
            onChange={event => void setStorageValue(event.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="content-theme">Theme</Label>
          <Select value={theme} disabled={!themeReady} onValueChange={(value: Theme) => void setTheme(value)}>
            <SelectTrigger id="content-theme" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {THEMES.map(({ value, label, icon: Icon }) => (
                <SelectItem key={value} value={value}>
                  <Icon />
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </DialogContent>
    </Dialog>
  );
}
