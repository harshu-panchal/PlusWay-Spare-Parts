import React, { useMemo } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
  sortableKeyboardCoordinates,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";

/**
 * SortableImageGrid
 *
 * A grid of image thumbnails the admin can drag to reorder. The first image
 * (index 0) is marked "PRIMARY" so it's clear the order matters for the
 * customer-facing display.
 *
 * Props:
 *  images               string[]                     URLs in current display order
 *  onReorder            (newImages: string[]) => void  Called with the reordered array
 *  onRemove             (index: number) => void      Called when the trash button is clicked
 *  uploadSlot           ReactNode                    Optional — rendered after the thumbnails as a non-sortable cell
 *  gridClassName        string                       Tailwind grid classes (default 2-col / md:4-col)
 *  thumbnailClassName   string                       Extra classes applied to the inner image container
 *  removeIconSize       number                       Lucide icon size for the trash button (default 14)
 *  RemoveIcon           component                    Override the trash icon (e.g. <X />)
 *  altPrefix            string                       Used for the img alt attribute
 *  showPrimaryBadge     boolean                      Show the "PRIMARY" pill on the first thumbnail (default true)
 */

const SortableThumbnail = ({
  id,
  index,
  src,
  alt,
  onRemove,
  removeIconSize,
  RemoveIcon,
  thumbnailClassName,
  showPrimaryBadge,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : "auto",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`relative group aspect-square touch-none cursor-grab active:cursor-grabbing ${
        isDragging ? "ring-2 ring-blue-500 ring-offset-2 rounded-xl" : ""
      }`}
    >
      <div
        className={`w-full h-full rounded-xl overflow-hidden border border-gray-200 ${
          thumbnailClassName || ""
        }`}
      >
        <img
          src={src}
          alt={alt}
          draggable={false}
          className="w-full h-full object-contain pointer-events-none select-none"
        />
      </div>

      {/* Grip handle (visual cue) — drag listeners are on the entire tile */}
      <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded-md p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm pointer-events-none">
        <GripVertical size={12} className="text-gray-500" />
      </div>

      {/* Primary badge on the first thumbnail */}
      {showPrimaryBadge && index === 0 && (
        <span className="absolute bottom-2 left-2 bg-blue-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm pointer-events-none">
          Primary
        </span>
      )}

      {/* Remove button — must stop propagation so click doesn't start a drag */}
      <button
        type="button"
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onRemove(index);
        }}
        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
        aria-label="Remove image"
      >
        <RemoveIcon size={removeIconSize} />
      </button>
    </div>
  );
};

const SortableImageGrid = ({
  images = [],
  onReorder,
  onRemove,
  uploadSlot,
  gridClassName = "grid grid-cols-2 md:grid-cols-4 gap-4",
  thumbnailClassName = "",
  removeIconSize = 14,
  RemoveIcon = Trash2,
  altPrefix = "Image",
  showPrimaryBadge = true,
}) => {
  // PointerSensor with a small activation distance prevents accidental drags
  // when the admin just clicks the delete button or wants to select an image.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // dnd-kit requires unique stable ids per item. URLs are unique in practice
  // for product galleries, but a defensive map handles the duplicate-URL edge
  // case so dnd-kit never collides ids.
  const items = useMemo(() => {
    const seen = new Map();
    return images.map((url) => {
      const count = seen.get(url) ?? 0;
      seen.set(url, count + 1);
      return { id: count === 0 ? url : `${url}#${count}`, url };
    });
  }, [images]);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((it) => it.id === active.id);
    const newIndex = items.findIndex((it) => it.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    onReorder(arrayMove(images, oldIndex, newIndex));
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items.map((it) => it.id)} strategy={rectSortingStrategy}>
        <div className={gridClassName}>
          {items.map((it, idx) => (
            <SortableThumbnail
              key={it.id}
              id={it.id}
              index={idx}
              src={it.url}
              alt={`${altPrefix} ${idx + 1}`}
              onRemove={onRemove}
              removeIconSize={removeIconSize}
              RemoveIcon={RemoveIcon}
              thumbnailClassName={thumbnailClassName}
              showPrimaryBadge={showPrimaryBadge}
            />
          ))}
          {uploadSlot ? <div className="aspect-square">{uploadSlot}</div> : null}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default SortableImageGrid;
