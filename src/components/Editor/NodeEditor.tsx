import React, { useEffect, useState } from 'react';
import { useMapStore } from '../../store/useMapStore';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import type { MapNode } from '../../types/schema';

export const NodeEditor: React.FC = () => {
    const { selectedElement, nodes, updateNode, removeNode, selectElement } = useMapStore();
    const [formData, setFormData] = useState<{ id: string, name: string, nameEn: string, place: string }>({
        id: '', name: '', nameEn: '', place: ''
    });

    const node = selectedElement?.type === 'node'
        ? nodes.find((n: MapNode) => n.id === selectedElement.id)
        : null;

    useEffect(() => {
        if (node) {
            setFormData({
                id: node.id,
                name: node.tags.name || '',
                nameEn: node.tags['name:en'] || '',
                place: node.tags.place || ''
            });
        }
    }, [node]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        if (!node) return;
        updateNode(node.id, {
            tags: {
                ...node.tags,
                name: formData.name,
                "name:en": formData.nameEn,
                place: formData.place
            }
        });
    };

    const handleDelete = () => {
        if (!node) return;
        if (confirm("このノードを削除してもよろしいですか？")) {
            removeNode(node.id);
            selectElement(null);
        }
    };

    if (!node) return (
        <div className="p-4 text-sm text-muted-foreground text-center">
            編集するノードを選択してください
        </div>
    );

    return (
        <Card className="border-0 shadow-none">
            <CardHeader className="p-4">
                <CardTitle className="text-sm">ノード編集</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-4 pt-0">
                <div className="grid gap-2">
                    <Label htmlFor="name">名称 (日本語)</Label>
                    <Input id="name" name="name" value={formData.name} onChange={handleChange} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="nameEn">名称 (英語)</Label>
                    <Input id="nameEn" name="nameEn" value={formData.nameEn} onChange={handleChange} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="place">種類 (Place)</Label>
                    <Input
                        id="place"
                        name="place"
                        placeholder="town, village..."
                        value={formData.place}
                        onChange={handleChange}
                        list="place-options"
                    />
                    <datalist id="place-options">
                        {Array.from(new Set(nodes.map(n => n.tags.place).filter(Boolean))).sort().map(place => (
                            <option key={place} value={place} />
                        ))}
                    </datalist>
                </div>
                <div className="flex gap-2 justify-end pt-2">
                    <Button variant="destructive" size="sm" onClick={handleDelete}>削除</Button>
                    <Button variant="default" size="sm" onClick={handleSave}>保存</Button>
                </div>
            </CardContent>
        </Card>
    );
};
