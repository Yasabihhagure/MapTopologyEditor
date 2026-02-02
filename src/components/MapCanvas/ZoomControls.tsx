import React from 'react';
import { useMapStore } from '../../store/useMapStore';
import { Button } from '../ui/button';
import { Plus, Minus } from 'lucide-react';

export const ZoomControls: React.FC = () => {
    const { project, updateViewBox, showZoomControls } = useMapStore();

    if (!showZoomControls) return null;

    const handleZoom = (direction: 'in' | 'out') => {
        const { zoom, panX, panY } = project.viewBox;
        const zoomFactor = 1.2;
        let newZoom = direction === 'in' ? zoom * zoomFactor : zoom / zoomFactor;

        // Clamp zoom level
        newZoom = Math.max(0.1, Math.min(10, newZoom));

        // Calculate center based zoom
        const container = document.getElementById('map-capture-target');
        if (container) {
            const rect = container.getBoundingClientRect();
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            // Current image projection at center
            // centerX = (imgX * zoom) + panX
            // => imgX = (centerX - panX) / zoom
            const imgX = (centerX - panX) / zoom;
            const imgY = (centerY - panY) / zoom;

            // Calculate new pan to keep imgX, imgY at center
            // centerX = (imgX * newZoom) + newPanX
            // => newPanX = centerX - (imgX * newZoom)
            const newPanX = centerX - (imgX * newZoom);
            const newPanY = centerY - (imgY * newZoom);

            updateViewBox({ zoom: newZoom, panX: newPanX, panY: newPanY });
        } else {
            // Fallback if container not found (old behavior)
            updateViewBox({ zoom: newZoom });
        }
    };

    return (
        <div className="flex flex-col gap-1 p-1 bg-white/80 dark:bg-slate-900/80 rounded shadow-md backdrop-blur-sm">
            <Button
                variant="outline"
                size="icon"
                className="w-8 h-8 rounded-full"
                onClick={() => handleZoom('in')}
                title="拡大"
            >
                <Plus className="w-4 h-4" />
            </Button>
            <Button
                variant="outline"
                size="icon"
                className="w-8 h-8 rounded-full"
                onClick={() => handleZoom('out')}
                title="縮小"
            >
                <Minus className="w-4 h-4" />
            </Button>
        </div>
    );
};
