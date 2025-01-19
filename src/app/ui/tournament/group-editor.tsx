'use client';

import {
    Dialog,
    DialogContent,
    DialogDescription, DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

import { useState } from "react";
import {
    DndContext,
    closestCenter,
    PointerSensor,
    KeyboardSensor,
    useSensor,
    useSensors,
    DragOverlay, DragEndEvent, DragOverEvent, DragStartEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import SortableItem from "@/app/ui/dnd/sortable-item";
import Container from "@/app/ui/dnd/container";
import { clsx } from "clsx";
import { IFormattedGroup, ISimplePlayer } from "@/app/lib/tournaments/data";
import {Button} from "@/components/ui/button";
import {saveEditedGroups} from "@/app/lib/actions";

interface IGroupEditorProps {
    groups: IFormattedGroup[];
    tournamentId: string;
}

export default function GroupEditor({ groups: initialGroups, tournamentId }: IGroupEditorProps) {
    const [groups, setGroups] = useState<IFormattedGroup[]>(initialGroups);
    const [activePlayer, setActivePlayer] = useState<ISimplePlayer | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates
        })
    );

    function findContainer(id: string) {
        // Search for the group that contains the player with the matching `id`
        return groups.find((group) => group.players.some((player) => player.id === id))?.id ?? null;
    }

    function handleDragStart(event: DragStartEvent) {
        const { active } = event;
        const { id } = active;

        const player = groups
            .flatMap((group) => group.players)
            .find((player) => player.id === id);

        if (player) {
            setActivePlayer(player);
        }
    }

    function handleDragOver(event: DragOverEvent) {
        const { active, over } = event;
        const id = active.id.toString();
        const overId = over?.id.toString() ?? null;

        if (!overId) {
            return;
        }

        const activeContainerId = findContainer(id);
        const overContainerId = findContainer(overId);

        if (!activeContainerId || !overContainerId || activeContainerId === overContainerId) {
            return;
        }

        setGroups((prevGroups) => {
            const updatedGroups = [...prevGroups];

            const activeContainerIndex = updatedGroups.findIndex(group => group.id === activeContainerId);
            const overContainerIndex = updatedGroups.findIndex(group => group.id === overContainerId);

            const activeGroup = updatedGroups[activeContainerIndex];
            const overGroup = updatedGroups[overContainerIndex];

            const activeIndex = activeGroup.players.findIndex(player => player.id === id);

            if (activeIndex === -1) {
                return prevGroups;
            }

            const [movedPlayer] = activeGroup.players.splice(activeIndex, 1);
            overGroup.players.push(movedPlayer);

            return updatedGroups;
        });
    }

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        const id = active.id.toString();
        const overId = over?.id.toString() ?? null;

        // Exit early if there's no valid drop target
        if (!overId) {
            return;
        }

        const activeContainerId = findContainer(id);
        const overContainerId = findContainer(overId);

        // If the containers are different, or one is invalid, exit early
        if (!activeContainerId || !overContainerId || activeContainerId !== overContainerId) {
            return;
        }

        setGroups((prevGroups) => {
            const updatedGroups = [...prevGroups];

            // Find the container index
            const containerIndex = updatedGroups.findIndex(group => group.id === activeContainerId);
            if (containerIndex === -1) {
                console.error(`Container not found for id: ${activeContainerId}`);
                return prevGroups; // No valid container, return previous state
            }

            const group = updatedGroups[containerIndex];

            // Find the indices of the active and over players within the group
            const activeIndex = group.players.findIndex(player => player.id === id);
            const overIndex = group.players.findIndex(player => player.id === overId);

            // Debugging logs to verify indices
            console.log("Active Index:", activeIndex, "Over Index:", overIndex);
            console.log("Group before move:", JSON.stringify(group.players, null, 2));

            // Ensure indices are valid
            if (activeIndex === -1 || overIndex === -1 || activeIndex === overIndex) {
                console.warn("Invalid indices or no move required");
                return prevGroups;
            }

            // Move the player using arrayMove
            const reorderedPlayers = arrayMove(group.players, activeIndex, overIndex);

            // Update the group with reordered players
            updatedGroups[containerIndex] = {
                ...group,
                players: reorderedPlayers,
            };

            console.log("Group after move:", JSON.stringify(reorderedPlayers, null, 2));

            return updatedGroups;
        });

        // Reset active state
        setActivePlayer(null);
    }

    async function handleSaveGroups() {
        await saveEditedGroups(tournamentId, groups);
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <Dialog>
                <DialogTrigger>Edit groups</DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Group editor</DialogTitle>
                        <DialogDescription>Move players between groups</DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-8">
                        {groups.map((group) => (
                            <Container key={group.id} id={group.id} itemIds={group.players.map(player => player.id)}>
                                <h2 className="text-sm font-bold mb-2">{group.name}</h2>
                                <div>
                                    {group.players.map((player) => (
                                        <SortableItem id={player.id} key={player.id}>
                                            <p className={
                                                clsx('border rounded-sm p-2 bg-white',
                                                    activePlayer?.id === player.id ? 'opacity-50' : 'opacity-100'
                                                )}
                                            >
                                                {player.name}
                                            </p>
                                        </SortableItem>
                                    ))}
                                </div>
                            </Container>
                        ))}
                    </div>
                    <DialogFooter>
                        <Button variant="default" onClick={handleSaveGroups}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <DragOverlay>
                {activePlayer ? (
                    <div className="border rounded-sm p-2 bg-white w-full flex items-center">
                        {activePlayer.name}
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}
