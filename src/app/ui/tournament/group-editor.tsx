'use client';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import {useState} from "react";
import {
    DndContext,
    closestCenter,
    PointerSensor,
    KeyboardSensor,
    useSensor,
    useSensors,
    DragOverlay, DragEndEvent, DragOverEvent, DragStartEvent, useDndContext,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    verticalListSortingStrategy,
    useSortable, sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import {CSS} from "@dnd-kit/utilities";
import SortableItem from "@/app/ui/dnd/sortable-item";
import Container from "@/app/ui/dnd/container";
import {DialogBody} from "next/dist/client/components/react-dev-overlay/internal/components/Dialog";
import {clsx} from "clsx";

interface SimplePlayer {
    id: string;
    name: string;
}

interface Group {
    id: string;
    name: string;
    players: SimplePlayer[];
}

const defaultAnnouncements = {
    onDragStart(id: string) {
        console.log(`Picked up draggable item ${id}.`);
    },
    onDragOver(id: string, overId: string) {
        if (overId) {
            console.log(
                `Draggable item ${id} was moved over droppable area ${overId}.`
            );
            return;
        }

        console.log(`Draggable item ${id} is no longer over a droppable area.`);
    },
    onDragEnd(id: string, overId: string) {
        if (overId) {
            console.log(
                `Draggable item ${id} was dropped over droppable area ${overId}`
            );
            return;
        }

        console.log(`Draggable item ${id} was dropped.`);
    },
    onDragCancel(id: string) {
        console.log(`Dragging was cancelled. Draggable item ${id} was dropped.`);
    }
};

type groupTest = {
    [key: string]: Group;
}

export default function GroupEditor() {
    const [activeId, setActiveId] = useState<string | number | null>();
    const [groups, setGroups] = useState<groupTest>({
        Group1: {
            id: crypto.randomUUID(),
            name: 'Group 1',
            players: [
                {name: "Thomas", id: crypto.randomUUID()},
                {name: "Fredrik", id: crypto.randomUUID()},
                {name: "Steffen", id: crypto.randomUUID()},
                {name: "Kristoffer", id: crypto.randomUUID()},
                {name: "Vetle", id: crypto.randomUUID()},
            ],
        },
        Group2:
            {
                id: crypto.randomUUID(),
                name: 'Group 2',
                players: [
                    {name: "Audun", id: crypto.randomUUID()},
                    {name: "Ellinor", id: crypto.randomUUID()},
                    {name: "Jon Anders", id: crypto.randomUUID()},
                    {name: "Elena", id: crypto.randomUUID()},
                ],
            },
    });

    const [activePlayer, setActivePlayer] = useState<SimplePlayer | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates
        })
    );


    function findContainer(id: string) {
        // Check if `id` is directly a group key
        if (id in groups) {
            return id;
        }

        // Search for the group that contains the player with the matching `id`
        return Object.keys(groups).find((groupKey) =>
            groups[groupKey].players.some((player) => player.id === id)
        );
    }

    function handleDragStart(event: DragStartEvent) {
        const {active} = event;
        const {id} = active;

        const player = Object.values(groups)
            .flatMap((group) => group.players)
            .find((player) => player.id === id);

        if (player) {
            setActivePlayer(player);
        }
        console.log('Starting drag', id);
    }

    function handleDragOver(event: DragOverEvent) {
        const {active, over} = event;

        const id = active.id.toString();
        const overId = over?.id.toString() ?? '';

        // Find the containers
        const activeContainer = findContainer(id);
        const overContainer = findContainer(overId);

        if (!activeContainer || !overContainer || activeContainer === overContainer) {
            return;
        }

        setGroups((prev) => {
            if (active.rect.current.translated === null) {
                return prev;
            }

            const activeGroup = prev[activeContainer];
            const overGroup = prev[overContainer];

            // Find the indexes for the players
            const activeIndex = activeGroup.players.findIndex((player) => player.id === id);
            const overIndex = overGroup.players.findIndex((player) => player.id === overId);

            if (activeIndex === -1) {
                // If the active player is not found, return the previous state
                return prev;
            }

            let newIndex;
            if (overId in prev) {
                // We're at the root droppable of a container
                newIndex = overGroup.players.length;
            } else {
                const isBelowLastItem =
                    over &&
                    overIndex === overGroup.players.length - 1 &&
                    active.rect.current.translated.top > over.rect.top + over.rect.height;

                const modifier = isBelowLastItem ? 1 : 0;

                newIndex = overIndex >= 0 ? overIndex + modifier : overGroup.players.length;
            }

            // Remove the player from the active group
            const [movedPlayer] = activeGroup.players.splice(activeIndex, 1);

            // Add the player to the over group at the new index
            overGroup.players.splice(newIndex, 0, movedPlayer);

            // Return the updated groups
            return {
                ...prev,
                [activeContainer]: {...activeGroup, players: activeGroup.players},
                [overContainer]: {...overGroup, players: overGroup.players},
            };
        });
    }


    function handleDragEnd(event: DragEndEvent) {
        const {active, over} = event;
        const id = active.id.toString();
        const overId = over?.id.toString() ?? '';

        const activeContainer = findContainer(id);
        const overContainer = findContainer(overId);

        if (!activeContainer || !overContainer || activeContainer !== overContainer) {
            return;
        }

        // Use previous state to find active and over indices
        setGroups((prev) => {
            const activeIndex = prev[activeContainer].players.findIndex(
                (player) => player.id === id
            );
            const overIndex = prev[overContainer].players.findIndex(
                (player) => player.id === overId
            );

            if (activeIndex === -1 || overIndex === -1 || activeIndex === overIndex) {
                return prev; // No valid move, return the previous state unchanged
            }

            // Perform the move
            const updatedPlayers = arrayMove(
                prev[overContainer].players,
                activeIndex,
                overIndex
            );

            return {
                ...prev,
                [overContainer]: {
                    ...prev[overContainer],
                    players: updatedPlayers,
                },
            };
        });

        setActiveId(null);
        setActivePlayer(null);
    }


    return (
        <Dialog>
            <DialogTrigger>Edit groups</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Group editor</DialogTitle>
                    <DialogDescription>Move players between groups</DialogDescription>
                </DialogHeader>
                <DialogBody className="flex flex-col gap-8">
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDragEnd={handleDragEnd}
                    >
                        {Object.entries(groups).map(([groupId, group]) => (
                            <Container key={groupId} id={groupId} itemIds={group.players.map((player) => player.id)}>
                                <h2 className="text-sm font-bold mb-2">{group.name}</h2>
                                <div className="">
                                    {group.players.map((player) => (
                                        <SortableItem id={player.id} key={player.id}>
                                            <p className={
                                                clsx('border rounded-sm p-2 bg-white',
                                                activePlayer?.id === player.id ? 'opacity-50' : 'opacity-100'
                                                )}>{player.name}</p>
                                        </SortableItem>
                                    ))}
                                </div>
                            </Container>
                        ))}
                        <DragOverlay>{activePlayer ?
                            <p className="border rounded-sm p-2 bg-white">
                                {activePlayer.name}
                            </p> : null}
                        </DragOverlay>
                    </DndContext>
                </DialogBody>
            </DialogContent>
        </Dialog>
    );
}
