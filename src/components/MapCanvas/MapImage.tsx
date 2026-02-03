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

        // Calculate normalized position of the mouse relative to the image
        // We use the current viewBox to determine where the mouse is in "image space"
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;

        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Current image projection
        // x_screen = (x_img * zoom) + panX
        // => x_img = (x_screen - panX) / zoom
        const imgX = (mouseX - project.viewBox.panX) / project.viewBox.zoom;
        const imgY = (mouseY - project.viewBox.panY) / project.viewBox.zoom;

        const zoomSensitivity = 0.001;
        const newZoom = Math.max(0.1, Math.min(10, project.viewBox.zoom - e.deltaY * zoomSensitivity));

        // We want the point (imgX, imgY) to remain at (mouseX, mouseY) after zoom
        // mouseX = (imgX * newZoom) + newPanX
        // => newPanX = mouseX - (imgX * newZoom)
        const newPanX = mouseX - (imgX * newZoom);
        const newPanY = mouseY - (imgY * newZoom);

        updateViewBox({ zoom: newZoom, panX: newPanX, panY: newPanY });
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
                    // Also set the filename in store
                    const { setMapImageName } = useMapStore.getState();
                    setMapImageName(file.name);
                }
                img.src = url;
            };
            reader.readAsDataURL(file);
        }
    };

    // Project Upload Handler (JSON + Image)
    const handleProjectUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        // Find JSON file
        const jsonFile = files.find(f => f.name.endsWith('.json'));
        if (!jsonFile) {
            alert("JSONファイルが見つかりません。");
            return;
        }

        try {
            const jsonText = await jsonFile.text();
            const projectData = JSON.parse(jsonText) as ProjectData;

            // 1. Load project data (nodes, ways, settings)
            loadProject(projectData);

            // 2. Handle Map Image
            const mapImageName = projectData.project.mapImage;

            if (mapImageName) {
                // Case A: mapImage is a Data URL (Legacy support or embedded)
                if (mapImageName.startsWith('data:')) {
                    const img = new Image();
                    img.onload = () => {
                        setMapImage(mapImageName, img.width, img.height);
                        // For legacy data, we might not have a filename, or we can leave it null
                        useMapStore.getState().setMapImageName(null);
                    }
                    img.src = mapImageName;
                }
                // Case B: mapImage is a filename
                else {
                    const imageFile = files.find(f => f.name === mapImageName);
                    if (imageFile) {
                        const reader = new FileReader();
                        reader.onload = (loadEvent) => {
                            const url = loadEvent.target?.result as string;
                            const img = new Image();
                            img.onload = () => {
                                setMapImage(url, img.width, img.height);
                                useMapStore.getState().setMapImageName(mapImageName);
                            }
                            img.src = url;
                        };
                        reader.readAsDataURL(imageFile);
                    } else {
                        // Image file missing in the selection
                        alert(`プロジェクトに含まれる地図画像 (${mapImageName}) が選択されていません。\nJSONファイルと画像ファイルを同時に選択してください。`);
                    }
                }
            }
        } catch (err) {
            console.error("Failed to parse JSON", err);
            alert("プロジェクトファイルの読み込みに失敗しました。");
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
                <h2 className="text-2xl font-bold mb-4">プロジェクトを開く</h2>
                <div className="flex gap-4">
                    <label className="cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-md font-medium shadow-sm">
                        画像のみ開く
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                    <label className="cursor-pointer bg-secondary text-secondary-foreground hover:bg-secondary/90 px-6 py-3 rounded-md font-medium shadow-sm">
                        プロジェクト読込 (JSON+画像)
                        <input type="file" accept=".json,image/*" multiple className="hidden" onChange={handleProjectUpload} />
                    </label>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                    ※ 保存済みプロジェクトを開く際は、JSONファイルと画像ファイルを<br />
                    <strong>同時に選択</strong>してアップロードしてください。
                </p>
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
