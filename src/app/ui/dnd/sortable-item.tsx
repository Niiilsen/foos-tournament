import {ReactNode} from "react";
import {useSortable} from "@dnd-kit/sortable";
import { CSS } from '@dnd-kit/utilities';

interface ISortableItemProps {
    id: string;
    children: ReactNode;
}

export default function SortableItem({id, children} : ISortableItemProps) {
    const { 
        attributes,
        listeners, 
        setNodeRef,
        transform,
        transition
    } = useSortable({id: id});
    
    const style = {
        transform: CSS.Transform.toString(transform),
        transition
    }
    
    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            {children}
        </div>
    )
}