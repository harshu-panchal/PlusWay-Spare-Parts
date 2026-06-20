import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Edit, Trash2, ChevronRight, GripVertical } from 'lucide-react';

export function SortableCategoryItem({ item, handleOpenModal, handleDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group relative"
    >
      <div 
        className="absolute top-2 left-2 z-20 cursor-grab active:cursor-grabbing p-1.5 bg-white/80 backdrop-blur rounded-lg shadow-sm text-gray-400 hover:text-gray-800 transition-colors"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={18} />
      </div>
      <div className="h-40 bg-gray-50 relative flex items-center justify-center p-4">
        <img
          src={item.image || null}
          alt={item.name}
          className="max-w-full max-h-full object-contain pointer-events-none"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <button
            onClick={(e) => { e.stopPropagation(); handleOpenModal(item); }}
            className="p-2 bg-white text-gray-800 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDelete(item._id); }}
            className="p-2 bg-white text-gray-800 rounded-lg hover:bg-red-600 hover:text-white transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
      <div className="p-4 flex justify-between items-center">
        <div>
          <h4 className="font-bold text-gray-900">{item.name}</h4>
          <p className="text-xs text-gray-500">Slug: {item.slug}</p>
        </div>
        <ChevronRight size={20} className="text-gray-300" />
      </div>
    </div>
  );
}
