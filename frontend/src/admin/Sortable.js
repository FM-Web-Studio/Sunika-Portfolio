import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, TouchSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import {
  SortableContext, arrayMove, useSortable, sortableKeyboardCoordinates,
  verticalListSortingStrategy, rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ui from './Sortable.module.css';

export const DragHandle = ({ label = 'Drag to reorder', className = '', ...props }) => (
  <button type="button" className={`${ui.handle} ${className}`} aria-label={label} title={label} {...props}>
    <svg viewBox="0 0 12 18" aria-hidden="true">
      {[3, 9, 15].map((y) => (
        <g key={y}><circle cx="3" cy={y} r="1.5" /><circle cx="9" cy={y} r="1.5" /></g>
      ))}
    </svg>
  </button>
);

const Item = ({ id, as: Tag, className, render }) => {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Translate.toString(transform), transition };
  const handle = { ref: setActivatorNodeRef, ...attributes, ...listeners };
  return (
    <Tag ref={setNodeRef} style={style} className={`${className || ''} ${isDragging ? ui.dragging : ''}`}>
      {render(handle)}
    </Tag>
  );
};

export const SortableList = ({
  items, getId, onReorder, layout = 'list', as = 'ul', itemAs = 'li', className, itemClassName, children, after,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const ids = items.map((item, i) => String(getId(item, i)));
  const Tag = as;

  const onDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const from = ids.indexOf(active.id);
    const to = ids.indexOf(over.id);
    if (from >= 0 && to >= 0) onReorder(arrayMove(items, from, to));
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={ids} strategy={layout === 'grid' ? rectSortingStrategy : verticalListSortingStrategy}>
        <Tag className={className}>
          {items.map((item, i) => (
            <Item key={ids[i]} id={ids[i]} as={itemAs} className={itemClassName} render={(handle) => children(item, i, handle)} />
          ))}
          {after}
        </Tag>
      </SortableContext>
    </DndContext>
  );
};

let seq = 0;
export const withKeys = (list = []) => list.map((value) => ({ key: `k${(seq += 1)}`, value }));
