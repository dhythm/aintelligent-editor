import { ViewModeToggleProps, ViewMode } from '@/types/editor';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { 
  FileText, 
  Eye, 
  Columns2,
  Rows2 
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function ViewModeToggle({ currentMode, onModeChange }: ViewModeToggleProps) {
  const modes: { value: ViewMode['type']; icon: React.ReactNode; label: string }[] = [
    {
      value: 'editor-only',
      icon: <FileText className="h-4 w-4" />,
      label: 'エディターのみ',
    },
    {
      value: 'preview-only',
      icon: <Eye className="h-4 w-4" />,
      label: 'プレビューのみ',
    },
    {
      value: 'split-horizontal',
      icon: <Columns2 className="h-4 w-4" />,
      label: '左右分割',
    },
    {
      value: 'split-vertical',
      icon: <Rows2 className="h-4 w-4" />,
      label: '上下分割',
    },
  ];

  return (
    <ToggleGroup
      type="single"
      value={currentMode}
      onValueChange={(value) => {
        if (value) {
          onModeChange(value as ViewMode['type']);
        }
      }}
      className="justify-start"
    >
      {modes.map((mode) => (
        <ToggleGroupItem
          key={mode.value}
          value={mode.value}
          aria-label={mode.label}
          className={cn(
            "gap-2",
            currentMode === mode.value && "bg-primary text-primary-foreground"
          )}
        >
          {mode.icon}
          <span className="hidden sm:inline">{mode.label}</span>
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}