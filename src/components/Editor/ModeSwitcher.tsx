import React from 'react';
import { useMapStore } from '../../store/useMapStore';
import { Button } from '../ui/button';
import { MousePointer2, Eye } from 'lucide-react';

export const ModeSwitcher: React.FC = () => {
    const { mode, setMode } = useMapStore();

    return (
        <div className="flex gap-1 p-2 bg-muted rounded-md mb-4 bg-slate-100 dark:bg-slate-800">
            <Button
                variant={mode === 'view' ? 'default' : 'ghost'}
                size="sm"
                className="flex-1"
                onClick={() => setMode('view')}
            >
                <Eye className="w-4 h-4 mr-2" />
                閲覧 (View)
            </Button>
            <Button
                variant={mode === 'edit' ? 'default' : 'ghost'}
                size="sm"
                className="flex-1"
                onClick={() => setMode('edit')}
            >
                <MousePointer2 className="w-4 h-4 mr-2" />
                編集 (Edit)
            </Button>
        </div>
    );
};
