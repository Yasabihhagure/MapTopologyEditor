import React, { useState, useEffect } from 'react';
import { useMapStore } from '../../store/useMapStore';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '../ui/dialog';
import { Ruler } from 'lucide-react';
import type { ScaleConfig } from '../../types/schema';

export const ScaleSetting: React.FC = () => {
    const { project, setScale, interactionMode, setInteractionMode, tempScalePoints } = useMapStore();
    const [isOpen, setIsOpen] = useState(false);


    // Local state for form
    const [formData, setFormData] = useState<ScaleConfig>({
        p1: { x: 0, y: 0 },
        p2: { x: 1, y: 0 }, // Default to full width
        actualDistance: 100,
        unit: 'km'
    });

    useEffect(() => {
        if (!isOpen) return;

        // Start with existing project scale or defaults
        const baseConfig = project.scale ? { ...project.scale } : {
            p1: { x: 0, y: 0 },
            p2: { x: 1, y: 0 },
            actualDistance: 100,
            unit: 'km'
        };

        // If we have temp points from interaction, override
        if (tempScalePoints.p1) {
            baseConfig.p1 = tempScalePoints.p1;
        }
        if (tempScalePoints.p2) {
            baseConfig.p2 = tempScalePoints.p2;
        }

        setFormData(baseConfig);
    }, [isOpen, project.scale, tempScalePoints]);

    // Effect to sync temp points to form
    useEffect(() => {
        if (tempScalePoints.p1) {
            setFormData(prev => ({ ...prev, p1: tempScalePoints.p1! }));
        }
        if (tempScalePoints.p2) {
            setFormData(prev => ({ ...prev, p2: tempScalePoints.p2! }));
        }
    }, [tempScalePoints]);

    // Effect to auto-open dialog after p2 pick
    const prevInteractionMode = React.useRef(interactionMode);
    useEffect(() => {
        if (prevInteractionMode.current === 'scale_p2' && interactionMode === 'idle') {
            setIsOpen(true);
        }
        prevInteractionMode.current = interactionMode;
    }, [interactionMode]);


    const handleCoordChange = (point: 'p1' | 'p2', axis: 'x' | 'y', value: string) => {
        const num = parseFloat(value);
        if (isNaN(num)) return;
        setFormData(prev => ({
            ...prev,
            [point]: {
                ...prev[point],
                [axis]: num
            }
        }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'actualDistance') {
            setFormData(prev => ({ ...prev, actualDistance: parseFloat(value) || 0 }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSave = () => {
        setScale(formData);
        setIsOpen(false);
    };

    const startPickPoints = () => {
        setIsOpen(false);
        setInteractionMode('scale_p1');
        // Toast or simple alert would be nice here, for now rely on map hint (todo)
        // or just user knowing to click.
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full">
                    <Ruler className="w-4 h-4 mr-2" />
                    縮尺設定 (Scale)
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>縮尺の設定</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md border border-blue-200 dark:border-blue-800">
                        <p className="text-sm font-medium mb-2">インタラクティブ設定</p>
                        <Button size="sm" onClick={startPickPoints} className="w-full">
                            地図上の2点をクリックして設定
                        </Button>
                    </div>

                    <p className="text-sm text-muted-foreground">
                        または、手動で座標と距離を入力してください。
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs">点1 (P1)</Label>
                            <div className="flex gap-2">
                                <div className="grid items-center gap-1.5">
                                    <Label htmlFor="p1-x" className="text-[10px]">X</Label>
                                    <Input
                                        id="p1-x"
                                        type="number" step="0.01"
                                        value={formData.p1.x}
                                        onChange={(e) => handleCoordChange('p1', 'x', e.target.value)}
                                    />
                                </div>
                                <div className="grid items-center gap-1.5">
                                    <Label htmlFor="p1-y" className="text-[10px]">Y</Label>
                                    <Input
                                        id="p1-y"
                                        type="number" step="0.01"
                                        value={formData.p1.y}
                                        onChange={(e) => handleCoordChange('p1', 'y', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs">点2 (P2)</Label>
                            <div className="flex gap-2">
                                <div className="grid items-center gap-1.5">
                                    <Label htmlFor="p2-x" className="text-[10px]">X</Label>
                                    <Input
                                        id="p2-x"
                                        type="number" step="0.01"
                                        value={formData.p2.x}
                                        onChange={(e) => handleCoordChange('p2', 'x', e.target.value)}
                                    />
                                </div>
                                <div className="grid items-center gap-1.5">
                                    <Label htmlFor="p2-y" className="text-[10px]">Y</Label>
                                    <Input
                                        id="p2-y"
                                        type="number" step="0.01"
                                        value={formData.p2.y}
                                        onChange={(e) => handleCoordChange('p2', 'y', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid items-center gap-1.5">
                            <Label htmlFor="actualDistance">距離</Label>
                            <Input
                                id="actualDistance"
                                name="actualDistance"
                                type="number"
                                value={formData.actualDistance}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="grid items-center gap-1.5">
                            <Label htmlFor="unit">単位</Label>
                            <Input
                                id="unit"
                                name="unit"
                                placeholder="m, km, mile..."
                                value={formData.unit}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Live Preview */}
                    <div className="text-xs text-muted-foreground bg-muted p-2 rounded mt-2">
                        現在の設定:
                        {(() => {
                            const dx = (formData.p1.x - formData.p2.x);
                            const dy = (formData.p1.y - formData.p2.y);
                            const dist = Math.sqrt(dx * dx + dy * dy); // Normalized distance
                            if (dist === 0 || formData.actualDistance === 0) return " - ";
                            // We don't have Image Width here easily without store, but normalized is enough relative.
                            return ` 画像全体幅の ${(dist * 100).toFixed(1)}% = ${formData.actualDistance} ${formData.unit}`;
                        })()}
                    </div>

                </div>
                <DialogFooter>

                    <Button variant="secondary" onClick={() => setIsOpen(false)}>キャンセル</Button>
                    <Button onClick={handleSave}>保存</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
