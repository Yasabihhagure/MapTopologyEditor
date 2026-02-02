import React, { useEffect, useState } from 'react';
import { useMapStore } from '../../store/useMapStore';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import type { MapWay } from '../../types/schema';

export const WayEditor: React.FC = () => {
    const { selectedElement, ways, updateWay, removeWay, selectElement } = useMapStore();
    const [formData, setFormData] = useState<{ id: string, name: string, highway: string }>({
        id: '', name: '', highway: ''
    });

    const way = selectedElement?.type === 'way'
        ? ways.find((w: MapWay) => w.id === selectedElement.id)
        : null;

    useEffect(() => {
        if (way) {
            setFormData({
                id: way.id,
                name: way.tags.name || '',
                highway: way.tags.highway || ''
            });
        }
    }, [way]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        if (!way) return;
        updateWay(way.id, {
            tags: {
                ...way.tags,
                name: formData.name,
                highway: formData.highway
            }
        });
    };

    const handleDelete = () => {
        if (!way) return;
        if (confirm("この経路(Way)を削除してもよろしいですか？")) {
            removeWay(way.id);
            selectElement(null);
        }
    };

    if (!way) return (
        <div className="p-4 text-sm text-muted-foreground text-center">
            編集するWayを選択してください
        </div>
    );

    return (
        <Card className="border-0 shadow-none">
            <CardHeader className="p-4">
                <CardTitle className="text-sm">Way編集</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-4 pt-0">
                <div className="grid gap-2">
                    <Label htmlFor="name">名称</Label>
                    <Input id="name" name="name" value={formData.name} onChange={handleChange} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="highway">種類 (Highway)</Label>
                    <Input id="highway" name="highway" placeholder="footway, path..." value={formData.highway} onChange={handleChange} />
                </div>

                <div className="flex gap-2 justify-end pt-2">
                    <Button variant="destructive" size="sm" onClick={handleDelete}>削除</Button>
                    <Button variant="default" size="sm" onClick={handleSave}>保存</Button>
                </div>
            </CardContent>
        </Card>
    );
};
