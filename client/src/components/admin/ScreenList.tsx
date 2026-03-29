import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { SCREEN_TYPE_CONFIG } from "@shared/types";
import type { Screen, Settings } from "@shared/types";
import { trpc } from "@/lib/trpc";
import { ScreenThumbnail } from "./ScreenPreview";
import { toast } from "sonner";
import { 
  GripVertical, 
  Pencil, 
  Trash2, 
  Clock, 
  Calendar,
  Shield,
  Image as ImageIcon,
  Eye,
  EyeOff,
} from "lucide-react";

interface ScreenListProps {
  screens: Screen[];
  onEdit: (screen: Screen) => void;
}

interface SortableScreenCardProps {
  screen: Screen;
  onEdit: (screen: Screen) => void;
  onDelete: (screen: Screen) => void;
  onToggleActive: (screen: Screen, active: boolean) => void;
  settings: Settings | null;
}

function SortableScreenCard({ screen, onEdit, onDelete, onToggleActive, settings }: SortableScreenCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: screen.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  };
  
  const typeConfig = SCREEN_TYPE_CONFIG[screen.type as keyof typeof SCREEN_TYPE_CONFIG];
  
  const hasScheduleRules = screen.startAt || screen.endAt || 
    (screen.daysOfWeek && screen.daysOfWeek.length > 0) ||
    screen.timeStart || screen.timeEnd;
  const schedulingEnabled = (screen as any).schedulingEnabled;
  
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group rounded-xl border bg-card overflow-hidden hover:shadow-md transition-all cursor-pointer ${!screen.isActive ? "opacity-50" : ""}`}
      onClick={() => onEdit(screen)}
    >
      {/* Live Screen Preview Thumbnail */}
      <div className="relative w-full aspect-video bg-muted">
        <ScreenThumbnail screen={screen} settings={settings} />
        
        {/* Type badge overlay - top left */}
        <div className="absolute top-2 left-2">
          <Badge 
            className="text-xs font-medium shadow-sm backdrop-blur-sm"
            style={{ 
              backgroundColor: typeConfig?.bgColor,
              color: typeConfig?.color,
              borderColor: typeConfig?.color + '40',
            }}
          >
            {typeConfig?.label || screen.type}
          </Badge>
        </div>
        
        {/* Protected shield - top right */}
        {screen.isProtected && (
          <div className="absolute top-2 right-2 bg-amber-400 text-amber-900 rounded-full p-1.5 shadow-sm">
            <Shield className="w-3.5 h-3.5 fill-current" />
          </div>
        )}
        
        {/* Active/Inactive indicator overlay - bottom left */}
        <div className="absolute bottom-2 left-2">
          <div 
            className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full shadow-sm backdrop-blur-sm ${
              screen.isActive 
                ? "bg-green-100/90 text-green-700" 
                : "bg-gray-100/90 text-gray-500"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleActive(screen, !screen.isActive);
            }}
          >
            {screen.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            {screen.isActive ? "Active" : "Inactive"}
          </div>
        </div>
        
        {/* Drag handle overlay - bottom right */}
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
          <button
            {...attributes}
            {...listeners}
            className="touch-none p-1.5 rounded-full bg-white/90 shadow-md text-muted-foreground hover:text-foreground"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="w-3.5 h-3.5" />
          </button>
          <Button
            variant="secondary"
            size="icon"
            className="h-7 w-7 rounded-full shadow-md"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(screen);
            }}
          >
            <Pencil className="w-3 h-3" />
          </Button>
          {!screen.isProtected && (
            <Button
              variant="secondary"
              size="icon"
              className="h-7 w-7 rounded-full shadow-md text-destructive hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(screen);
              }}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Card Info */}
      <div className="p-3 space-y-1.5">
        <h3 className="font-semibold text-sm truncate">{screen.title}</h3>
        
        {screen.subtitle && (
          <p className="text-xs text-muted-foreground truncate">
            {screen.subtitle}
          </p>
        )}
        
        {/* Meta row */}
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground flex-wrap">
          <span className="flex items-center gap-0.5">
            <Clock className="w-3 h-3" />
            {screen.durationSeconds}s
          </span>
          <span>P{screen.priority}</span>
          {hasScheduleRules && (
            <span className={`flex items-center gap-0.5 ${schedulingEnabled ? 'text-blue-600' : ''}`}>
              <Calendar className="w-3 h-3" />
              {schedulingEnabled ? 'Scheduled' : 'Sched Off'}
            </span>
          )}
        </div>

        {/* Active toggle + action buttons row */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            <Switch
              checked={screen.isActive}
              onCheckedChange={(checked) => onToggleActive(screen, checked)}
              className="scale-90"
            />
            <span className="text-[10px] text-muted-foreground">
              {screen.isActive ? "On" : "Off"}
            </span>
          </div>
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={() => onEdit(screen)}
            >
              <Pencil className="w-3.5 h-3.5" />
            </Button>
            {!screen.isProtected && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                onClick={() => onDelete(screen)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ScreenList({ screens, onEdit }: ScreenListProps) {
  const [items, setItems] = useState(screens);
  const [deleteTarget, setDeleteTarget] = useState<Screen | null>(null);
  
  const utils = trpc.useUtils();
  
  // Fetch settings for live screen previews
  const { data: settingsData } = trpc.settings.get.useQuery(undefined, {
    staleTime: 60000,
  });
  
  const updateOrderMutation = trpc.screens.updateOrder.useMutation({
    onSuccess: () => {
      toast.success("Order updated");
      utils.screens.getAll.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
      setItems(screens); // Revert on error
    },
  });
  
  const updateMutation = trpc.screens.update.useMutation({
    onSuccess: (_, variables) => {
      utils.screens.getAll.invalidate();
      utils.screens.getActive.invalidate();
      if (variables.data.isActive !== undefined) {
        toast.success(variables.data.isActive ? "Screen activated" : "Screen deactivated");
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const deleteMutation = trpc.screens.delete.useMutation({
    onSuccess: () => {
      toast.success("Screen deleted");
      utils.screens.getAll.invalidate();
      utils.screens.getActive.invalidate();
      setDeleteTarget(null);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  // Update items when screens prop changes
  useEffect(() => {
    setItems(screens);
  }, [screens]);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      
      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);
      
      // Update order in database
      const orders = newItems.map((item, index) => ({
        id: item.id,
        sortOrder: index,
      }));
      
      updateOrderMutation.mutate({ orders });
    }
  };
  
  const handleToggleActive = (screen: Screen, active: boolean) => {
    updateMutation.mutate({
      id: screen.id,
      data: { isActive: active },
    });
  };
  
  const handleDelete = (screen: Screen) => {
    if (screen.isProtected) {
      toast.error("Cannot delete protected screen");
      return;
    }
    setDeleteTarget(screen);
  };
  
  const confirmDelete = () => {
    if (deleteTarget) {
      deleteMutation.mutate({ id: deleteTarget.id });
    }
  };
  
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No screens yet</h3>
        <p className="text-muted-foreground">
          Create your first screen to get started
        </p>
      </div>
    );
  }
  
  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items.map(s => s.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((screen) => (
              <SortableScreenCard
                key={screen.id}
                screen={screen}
                onEdit={onEdit}
                onDelete={handleDelete}
                onToggleActive={handleToggleActive}
                settings={settingsData || null}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Screen</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteTarget?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
