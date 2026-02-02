import React from 'react';
import { useMapStore } from '../../store/useMapStore';
import { Button } from '../ui/button';
import { Plus, Minus } from 'lucide-react';

export const ZoomControls: React.FC = () => {
    const { project, updateViewBox } = useMapStore();

    const handleZoom = (direction: 'in' | 'out') => {
        const currentZoom = project.viewBox.zoom;
        const zoomFactor = 1.2;
        let newZoom = direction === 'in' ? currentZoom * zoomFactor : currentZoom / zoomFactor;

        // Clamp zoom level
        newZoom = Math.max(0.1, Math.min(10, newZoom));

        updateViewBox({ zoom: newZoom });
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
