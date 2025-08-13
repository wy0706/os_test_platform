import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export const SortableItem = ({
  children,
  "data-row-key": rowKey,
  ...props
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: rowKey });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: "grab",
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      {...props}
    >
      {children}
    </tr>
  );
};
