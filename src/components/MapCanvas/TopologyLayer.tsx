import React, { useRef } from 'react';
import { useMapStore } from '../../store/useMapStore';
import type { MapNode, MapWay } from '../../types/schema';

export const TopologyLayer: React.FC = () => {
    const {
        project, nodes, ways,
        mode, selectedElement, selectElement,
        addNode, addWay,
        interactionMode, setInteractionMode, setTempScalePoint,
        showNodes, showWays // Added visibility flags
    } = useMapStore();

    // Only used for adding nodes relative to image
    const layerRef = useRef<HTMLDivElement>(null);

    if (!project.mapImageSize) return null;

    const { width, height } = project.mapImageSize;

    const handleNodeClick = (e: React.MouseEvent, id: string) => {
        e.stopPropagation(); // Avoid triggering map click

        // Way Creation Logic: Shift + Click on another node
        if (mode === 'edit' && e.shiftKey && selectedElement?.type === 'node' && selectedElement.id !== id) {
            const newWayId = addWay([selectedElement.id, id]);
            selectElement('way', newWayId);
            return;
        }

        selectElement('node', id);
    };

    const handleWayClick = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        selectElement('way', id);
    }

    const handleLayerClick = (e: React.MouseEvent) => {
        const x = e.nativeEvent.offsetX / width;
        const y = e.nativeEvent.offsetY / height;

        // Scale Tool Interaction
        if (interactionMode === 'scale_p1') {
            setTempScalePoint('p1', x, y);
            setInteractionMode('scale_p2');
            return;
        }
        if (interactionMode === 'scale_p2') {
            setTempScalePoint('p2', x, y);
            setInteractionMode('idle');
            // Dialog should open automatically or visually change.
            // For now, we rely on ScaleSetting component listening to changes or manually re-opening.
            // Actually, better to let ScaleSetting component handle the flow control via effect.
            return;
        }

        // If in Edit mode, add node on click
        if (mode === 'edit') {
            if (x >= 0 && x <= 1 && y >= 0 && y <= 1) {
                const newId = addNode(x, y);
                selectElement('node', newId);
            }
        }
    };

    return (
        <div
            className="w-full h-full pointer-events-auto"
            onClick={handleLayerClick}
            ref={layerRef}
        >
            <svg
                width={width}
                height={height}
                className="overflow-visible"
            >
                {/* Ways (Lines) */}
                {showWays && ways.map((way: MapWay) => {
                    if (!way.visible) return null;
                    // Find coordinate path
                    const pathCoords = way.nodes.map((nid: string) => {
                        const n = nodes.find((node: MapNode) => node.id === nid);
                        return n ? [n.x * width, n.y * height] : null;
                    }).filter(Boolean) as [number, number][];

                    if (pathCoords.length < 2) return null;

                    const d = `M ${pathCoords.map((p: [number, number]) => p.join(',')).join(' L ')}`;
                    const isSelected = selectedElement?.id === way.id;

                    return (
                        <path
                            key={way.id}
                            d={d}
                            stroke={isSelected ? '#3b82f6' : '#f59e0b'} // Blue if selected, Amber if not
                            strokeWidth={isSelected ? 4 : 2}
                            fill="none"
                            onClick={(e) => handleWayClick(e, way.id)}
                            className="cursor-pointer hover:stroke-blue-400 transition-colors"
                        />
                    );
                })}

                {/* Way Names */}
                {/* Added for Beta 2: Show Way Names */}
                {useMapStore.getState().showWayNames && showWays && ways.map((way: MapWay) => {
                    if (!way.visible || !way.tags?.name) return null;

                    const pathCoords = way.nodes.map((nid: string) => {
                        const n = nodes.find((node: MapNode) => node.id === nid);
                        return n ? { x: n.x * width, y: n.y * height } : null;
                    }).filter(Boolean) as { x: number, y: number }[];

                    if (pathCoords.length < 2) return null;

                    // Calculate total length and segments
                    let totalLength = 0;
                    const segments = [];
                    for (let i = 0; i < pathCoords.length - 1; i++) {
                        const p1 = pathCoords[i];
                        const p2 = pathCoords[i + 1];
                        const dx = p2.x - p1.x;
                        const dy = p2.y - p1.y;
                        const len = Math.sqrt(dx * dx + dy * dy);
                        segments.push({ p1, p2, len, startDist: totalLength });
                        totalLength += len;
                    }

                    // Find midpoint
                    const targetDist = totalLength / 2;
                    let midPoint = pathCoords[0];

                    for (const seg of segments) {
                        if (targetDist >= seg.startDist && targetDist <= seg.startDist + seg.len) {
                            const remaining = targetDist - seg.startDist;
                            const ratio = remaining / seg.len;
                            midPoint = {
                                x: seg.p1.x + (seg.p2.x - seg.p1.x) * ratio,
                                y: seg.p1.y + (seg.p2.y - seg.p1.y) * ratio
                            };
                            break;
                        }
                    }

                    return (
                        <text
                            key={`text-${way.id}`}
                            x={midPoint.x}
                            y={midPoint.y}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="pointer-events-none select-none text-xs font-bold fill-slate-700 stroke-white stroke-2 paint-order-stroke"
                            style={{ paintOrder: 'stroke' }}
                        >
                            {way.tags.name}
                        </text>
                    );
                })}

                {/* Nodes (Circles) */}
                {showNodes && nodes.map((node: MapNode) => {
                    if (!node.visible) return null;
                    const isSelected = selectedElement?.id === node.id;

                    return (
                        <circle
                            key={node.id}
                            cx={node.x * width}
                            cy={node.y * height}
                            r={isSelected ? 6 : 4} // Larger if selected
                            fill={isSelected ? '#3b82f6' : '#ef4444'} // Blue if selected, Red if not
                            stroke="white"
                            strokeWidth={1}
                            className="cursor-pointer transition-all hover:r-6"
                            onClick={(e) => handleNodeClick(e, node.id)}
                        />
                    );
                })}
            </svg>
        </div>
    );
};
