import React from 'react';
import { useMapStore } from '../../store/useMapStore';
import { ScrollArea } from '../ui/scroll-area';
import { Button } from '../ui/button';
import type { MapNode } from '../../types/schema';

export const NodeList: React.FC = () => {
    const { nodes, selectedElement, selectElement, project, updateViewBox } = useMapStore();

    const handleNodeClick = (id: string) => {
        selectElement('node', id);

        // Center the view on the node
        const node = nodes.find(n => n.id === id);
        if (node && project.mapImageSize) {
            // Approximate viewport size (Canvas area)
            // Subtract sidebars (256 * 2) and header/footer (~80)
            const viewportW = window.innerWidth - 512;
            const viewportH = window.innerHeight - 80;

            const zoom = project.viewBox.zoom;
            // Target Node positions in pixels relative to image top-left
            const nodePxX = node.x * project.mapImageSize.width * zoom;
            const nodePxY = node.y * project.mapImageSize.height * zoom;

            // We want NodePx + Pan = ViewportCenter
            // Pan = ViewportCenter - NodePx
            // ViewportCenter is relative to the container geometry. 
            // The container is top-left aligned in the main area.
            // So ViewportCenter is literally (W/2, H/2).

            const centerX = viewportW / 2;
            const centerY = viewportH / 2;

            const newPanX = centerX - nodePxX;
            const newPanY = centerY - nodePxY;

            updateViewBox({ panX: newPanX, panY: newPanY });
        }
    };

    return (
        <div className="flex flex-col h-full">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                ノード一覧 ({nodes.length})
            </h3>
            <ScrollArea className="flex-1 pr-2">
                <div className="space-y-1">
                    {nodes.map((node: MapNode) => {
                        const isSelected = selectedElement?.id === node.id && selectedElement.type === 'node';
                        const displayName = node.tags.name || node.tags['name:en'] || `Node ${node.id.slice(0, 4)}`;

                        return (
                            <Button
                                key={node.id}
                                variant={isSelected ? "secondary" : "ghost"}
                                size="sm"
                                className="w-full justify-start text-left h-auto py-1 px-2 text-xs"
                                onClick={() => handleNodeClick(node.id)}
                            >
                                <span className="truncate">{displayName}</span>
                                {node.tags.place && <span className="ml-auto text-[10px] text-muted-foreground opacity-70 border px-1 rounded">{node.tags.place}</span>}
                            </Button>
                        );
                    })}
                    {nodes.length === 0 && (
                        <div className="text-xs text-muted-foreground p-2 text-center">
                            ノードがありません
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
};
