import React, { useRef, useEffect, useState } from 'react';
import { useMapStore } from '../../store/useMapStore';
import type { ProjectData } from '../../types/schema';

// Simple types for local drag handling
interface DragState {
    isDragging: boolean;
    startX: number;
    startY: number;
    viewBoxStartX: number;
    viewBoxStartY: number;
}

export const MapCanvas: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
    const { project, updateViewBox, setMapImage, loadProject, mode } = useMapStore();
    const containerRef = useRef<HTMLDivElement>(null);

    // Drag state for panning
    const [drag, setDrag] = useState<DragState>({
        isDragging: false,
        startX: 0,
        startY: 0,
        viewBoxStartX: 0,
        viewBoxStartY: 0
    });

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const zoomSensitivity = 0.001;
        const newZoom = Math.max(0.1, Math.min(10, project.viewBox.zoom - e.deltaY * zoomSensitivity));
        updateViewBox({ zoom: newZoom });
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        // Pan condition: Middle click, Shift+Left click, or 'pan' mode with Left click
        const isPanAction = e.button === 1 || (e.button === 0 && e.shiftKey) || (mode === 'pan' && e.button === 0);

        if (isPanAction) {
            setDrag({
                isDragging: true,
                startX: e.clientX,
                startY: e.clientY,
                viewBoxStartX: project.viewBox.panX,
                viewBoxStartY: project.viewBox.panY
            });
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (drag.isDragging) {
            const dx = e.clientX - drag.startX;
            const dy = e.clientY - drag.startY;
            updateViewBox({
                panX: drag.viewBoxStartX + dx,
                panY: drag.viewBoxStartY + dy
            });
        }
    };

    const handleMouseUp = () => {
        setDrag(prev => ({ ...prev, isDragging: false }));
    };

    // Image Upload Handler
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (loadEvent) => {
                const url = loadEvent.target?.result as string;
                const img = new Image();
                img.onload = () => {
                    setMapImage(url, img.width, img.height);
                }
                img.src = url;
            };
            reader.readAsDataURL(file);
        }
    };

    // JSON Upload Handler
    const handleJsonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (loadEvent) => {
                try {
                    const json = JSON.parse(loadEvent.target?.result as string) as ProjectData;
                    loadProject(json);
                } catch (err) {
                    console.error("Failed to parse JSON", err);
                    alert("プロジェクトファイルの読み込みに失敗しました。");
                }
            };
            reader.readAsText(file);
        }
    }

    // Prevent default browser zoom behavior
    useEffect(() => {
        const container = containerRef.current;
        if (container) {
            // Prevent generic wheel scrolling
            const preventDefault = (e: WheelEvent) => e.preventDefault();
            container.addEventListener('wheel', preventDefault, { passive: false });
            return () => container.removeEventListener('wheel', preventDefault);
        }
    }, []);

    if (!project.mapImage) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 border-2 border-dashed m-8 rounded-lg">
                <h2 className="text-2xl font-bold mb-4">地図画像がありません</h2>
                <div className="flex gap-4">
                    <label className="cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md">
                        画像アップロード
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                    <label className="cursor-pointer bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-md">
                        JSON読込
                        <input type="file" accept=".json" className="hidden" onChange={handleJsonUpload} />
                    </label>
                </div>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className="w-full h-full relative cursor-crosshair bg-slate-50 dark:bg-slate-950 overflow-hidden"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
        >
            <div
                className="absolute origin-top-left transition-transform duration-75 ease-out"
                style={{
                    transform: `translate(${project.viewBox.panX}px, ${project.viewBox.panY}px) scale(${project.viewBox.zoom})`,
                    width: project.mapImageSize?.width,
                    height: project.mapImageSize?.height,
                }}
            >
                <img
                    src={project.mapImage}
                    alt="Map"
                    className="w-full h-full object-contain pointer-events-none select-none"
                    draggable={false}
                />
                <div className="absolute inset-0 pointer-events-none">
                    {children}
                </div>
            </div>
        </div>
    );
};
