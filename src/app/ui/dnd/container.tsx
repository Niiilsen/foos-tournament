import {SortableContext, verticalListSortingStrategy} from "@dnd-kit/sortable";
import {useDroppable} from "@dnd-kit/core";

interface IContainerProps {
    id: string;
    itemIds: string[];
    children: React.ReactNode;
}
export default function Container({id, itemIds, children}: IContainerProps) {
    const { setNodeRef } = useDroppable({id});
    
    return <SortableContext id={id} items={itemIds} strategy={verticalListSortingStrategy}>
        <div ref={setNodeRef}>
            {children}
        </div>
    </SortableContext>
}