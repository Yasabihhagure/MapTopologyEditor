import React, { useState, useEffect } from 'react';
import { useMapStore } from '../../store/useMapStore';

export const DistanceMeasurer: React.FC = () => {
    const { mode, project, measureStart, setMeasureStart, setMeasureDistance } = useMapStore();
    const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        if (mode !== 'measure' || !measureStart) {
            setMeasureDistance(null);
        }
    }, [mode, measureStart, setMeasureDistance]);

    if (mode !== 'measure' || !project.mapImageSize) return null;
    const { width, height } = project.mapImageSize;

    const handleMouseMove = (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left) / width;
        const y = (e.clientY - rect.top) / height;
        setCursorPos({ x, y });

        if (measureStart) {
            const dx = x - measureStart.x;
            const dy = y - measureStart.y;
            const distNorm = Math.sqrt(dx * dx + dy * dy);
            let distDisplay = 0;

            if (project.scale) {
                const scaleLen = Math.sqrt(
                    Math.pow(project.scale.p1.x - project.scale.p2.x, 2) +
                    Math.pow(project.scale.p1.y - project.scale.p2.y, 2)
                );
                distDisplay = (distNorm / scaleLen) * project.scale.actualDistance;
            } else {
                distDisplay = Math.sqrt(Math.pow(dx * width, 2) + Math.pow(dy * height, 2));
            }
            setMeasureDistance(distDisplay);
        }
    };

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!measureStart) {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = (e.clientX - rect.left) / width;
            const y = (e.clientY - rect.top) / height;
            setMeasureStart({ x, y });
        } else {
            setMeasureStart(null);
            setMeasureDistance(null);
        }
    };

    let distText = '';
    if (measureStart && useMapStore.getState().measureDistance !== null) {
        const dist = useMapStore.getState().measureDistance!;
        if (project.scale) {
            distText = `${dist.toFixed(2)} ${project.scale.unit}`;
        } else {
            distText = `${Math.round(dist)} px`;
        }
    }

    return (
        <div
            className="absolute inset-0 z-50 cursor-crosshair"
            onMouseMove={handleMouseMove}
            onClick={handleClick}
        >
            <svg width={width} height={height} className="overflow-visible pointer-events-none">
                {measureStart && (
                    <>
                        {/* Box behind text for readability */}
                        {distText && (
                            <rect
                                x={(measureStart.x * width + cursorPos.x * width) / 2 - 40}
                                y={(measureStart.y * height + cursorPos.y * height) / 2 - 20}
                                width="80"
                                height="20"
                                rx="4"
                                fill="rgba(0,0,0,0.7)"
                            />
                        )}
                        <line
                            x1={measureStart.x * width}
                            y1={measureStart.y * height}
                            x2={cursorPos.x * width}
                            y2={cursorPos.y * height}
                            stroke="#ef4444"
                            strokeWidth="2"
                            strokeDasharray="4 2"
                        />
                        <text
                            x={(measureStart.x * width + cursorPos.x * width) / 2}
                            y={(measureStart.y * height + cursorPos.y * height) / 2 - 6}
                            fill="white"
                            fontSize="12"
                            fontWeight="bold"
                            textAnchor="middle"
                        >
                            {distText}
                        </text>
                        <circle cx={measureStart.x * width} cy={measureStart.y * height} r="4" fill="#ef4444" />
                        <circle cx={cursorPos.x * width} cy={cursorPos.y * height} r="4" fill="#ef4444" />
                    </>
                )}
            </svg>
        </div>
    );
};
