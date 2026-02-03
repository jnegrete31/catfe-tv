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
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import type { Screen } from "@shared/types";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { 
  GripVertical, 
  Edit2, 
  Trash2, 
  Clock, 
  Calendar,
  Shield,
  Image as ImageIcon,
} from "lucide-react";
import { format } from "date-fns";

interface ScreenListProps {
  screens: Screen[];
  onEdit: (screen: Screen) => void;
}

interface SortableScreenItemProps {
  screen: Screen;
  onEdit: (screen: Screen) => void;
  onDelete: (screen: Screen) => void;
  onToggleActive: (screen: Screen, active: boolean) => void;
}

function SortableScreenItem({ screen, onEdit, onDelete, onToggleActive }: SortableScreenItemProps) {
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
  };
  
  const typeConfig = SCREEN_TYPE_CONFIG[screen.type as keyof typeof SCREEN_TYPE_CONFIG];
  
  const hasScheduling = screen.startAt || screen.endAt || 
    (screen.daysOfWeek && screen.daysOfWeek.length > 0) ||
    screen.timeStart || screen.timeEnd;
  
  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`p-4 ${!screen.isActive ? "opacity-60" : ""}`}
    >
      <div className="flex items-start gap-3">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="touch-none p-1 -ml-1 text-muted-foreground hover:text-foreground"
        >
          <GripVertical className="w-5 h-5" />
        </button>
        
        {/* Image Thumbnail */}
        <div className="w-16 h-12 flex-shrink-0 rounded overflow-hidden bg-muted">
          {screen.imagePath ? (
            <img 
              src={screen.imagePath} 
              alt="" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-muted-foreground" />
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge 
              variant="secondary"
              style={{ 
                backgroundColor: typeConfig?.bgColor,
                color: typeConfig?.color,
              }}
            >
              {typeConfig?.label || screen.type}
            </Badge>
            {screen.isProtected && (
              <Shield className="w-4 h-4 text-amber-500" />
            )}
          </div>
          
          <h3 className="font-medium truncate">{screen.title}</h3>
          
          {screen.subtitle && (
            <p className="text-sm text-muted-foreground truncate">
              {screen.subtitle}
            </p>
          )}
          
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {screen.durationSeconds}s
            </span>
            <span>Priority: {screen.priority}</span>
            {hasScheduling && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Scheduled
              </span>
            )}
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-2">
          <Switch
            checked={screen.isActive}
            onCheckedChange={(checked) => onToggleActive(screen, checked)}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(screen)}
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(screen)}
            disabled={screen.isProtected}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

export function ScreenList({ screens, onEdit }: ScreenListProps) {
  const [items, setItems] = useState(screens);
  const [deleteTarget, setDeleteTarget] = useState<Screen | null>(null);
  
  const utils = trpc.useUtils();
  
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
        <SortableContext items={items.map(s => s.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {items.map((screen) => (
              <SortableScreenItem
                key={screen.id}
                screen={screen}
                onEdit={onEdit}
                onDelete={handleDelete}
                onToggleActive={handleToggleActive}
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
