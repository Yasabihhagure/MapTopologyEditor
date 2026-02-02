import React from 'react';
import { useMapStore } from '../../store/useMapStore';
import { Button } from '../ui/button';
import { MousePointer2, Eye, Ruler, Hand } from 'lucide-react';

export const ModeSwitcher: React.FC = () => {
    const { mode, setMode } = useMapStore();

    return (
        <div className="flex flex-col gap-1 p-2 bg-muted rounded-md mb-4 bg-slate-100 dark:bg-slate-800">
            <div className="flex gap-1">
                <Button
                    variant={mode === 'view' ? 'default' : 'ghost'}
                    size="sm"
                    className="flex-1"
                    onClick={() => setMode('view')}
                >
                    <Eye className="w-4 h-4 mr-2" />
                    閲覧
                </Button>
                <Button
                    variant={mode === 'edit' ? 'default' : 'ghost'}
                    size="sm"
                    className="flex-1"
                    onClick={() => setMode('edit')}
                >
                    <MousePointer2 className="w-4 h-4 mr-2" />
                    編集
                </Button>
            </div>
            <div className="flex gap-1 mt-1">
                <Button
                    variant={mode === 'measure' ? 'default' : 'ghost'}
                    size="sm"
                    className="flex-1"
                    onClick={() => setMode('measure')}
                >
                    <Ruler className="w-4 h-4 mr-2" />
                    計測
                </Button>
                <Button
                    variant={mode === 'pan' ? 'default' : 'ghost'}
                    size="sm"
                    className="flex-1"
                    onClick={() => setMode('pan')}
                >
                    <Hand className="w-4 h-4 mr-2" />
                    パン
                </Button>
            </div>
        </div>
    );
};
