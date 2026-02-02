import { create } from 'zustand';
import type { ProjectData, MapNode, MapWay, ScaleConfig, ViewBox } from '../types/schema';
import { v4 as uuidv4 } from 'uuid';

const generateId = () => uuidv4();

interface MapState extends ProjectData {
    // Actions
    setMapImage: (url: string, width: number, height: number) => void;
    updateViewBox: (viewBox: Partial<ViewBox>) => void;
    setScale: (scale: ScaleConfig) => void;

    addNode: (x: number, y: number, tags?: MapNode['tags']) => string;
    updateNode: (id: string, updates: Partial<MapNode>) => void;
    removeNode: (id: string) => void;

    addWay: (nodeIds: string[], tags?: MapWay['tags']) => string;
    updateWay: (id: string, updates: Partial<MapWay>) => void;
    removeWay: (id: string) => void;

    loadProject: (data: ProjectData) => void;

    // Editor State
    mode: 'view' | 'edit';
    setMode: (mode: 'view' | 'edit') => void;
    selectedElement: { type: 'node' | 'way', id: string } | null;
    selectElement: (type: 'node' | 'way' | null, id?: string) => void;

    // Interaction State (for tools like Scale Setting)
    interactionMode: 'idle' | 'scale_p1' | 'scale_p2';
    setInteractionMode: (mode: 'idle' | 'scale_p1' | 'scale_p2') => void;
    tempScalePoints: { p1: { x: number, y: number } | null, p2: { x: number, y: number } | null };
    setTempScalePoint: (point: 'p1' | 'p2', x: number, y: number) => void;
}

export const useMapStore = create<MapState>((set) => ({
    project: {
        mapImage: null,
        viewBox: { zoom: 1, panX: 0, panY: 0 },
        scale: null,
    },
    nodes: [],
    ways: [],
    mode: 'view',
    selectedElement: null,

    interactionMode: 'idle',
    tempScalePoints: { p1: null, p2: null },


    setMapImage: (url: string, width: number, height: number) => set((state) => ({
        project: {
            ...state.project,
            mapImage: url,
            mapImageSize: { width, height }
        }
    })),

    updateViewBox: (updates: Partial<ViewBox>) => set((state) => ({
        project: {
            ...state.project,
            viewBox: { ...state.project.viewBox, ...updates }
        }
    })),

    setScale: (scale: ScaleConfig) => set((state) => ({
        project: { ...state.project, scale }
    })),

    addNode: (x: number, y: number, tags: MapNode['tags'] = {}) => {
        const id = generateId();
        set((state) => ({
            nodes: [...state.nodes, { id, x, y, tags, visible: true }]
        }));
        return id;
    },

    updateNode: (id: string, updates: Partial<MapNode>) => set((state) => ({
        nodes: state.nodes.map((n: MapNode) => n.id === id ? { ...n, ...updates } : n)
    })),

    removeNode: (id: string) => set((state) => {
        const newWays = state.ways.map((w: MapWay) => ({
            ...w,
            nodes: w.nodes.filter((nid: string) => nid !== id)
        })).filter((w: MapWay) => w.nodes.length >= 2);

        return {
            nodes: state.nodes.filter((n: MapNode) => n.id !== id),
            ways: newWays
        };
    }),

    addWay: (nodeIds: string[], tags: MapWay['tags'] = {}) => {
        const id = generateId();
        set((state) => ({
            ways: [...state.ways, { id, nodes: nodeIds, tags, visible: true }]
        }));
        return id;
    },

    updateWay: (id: string, updates: Partial<MapWay>) => set((state) => ({
        ways: state.ways.map((w: MapWay) => w.id === id ? { ...w, ...updates } : w)
    })),

    removeWay: (id: string) => set((state) => ({
        ways: state.ways.filter((w: MapWay) => w.id !== id)
    })),

    loadProject: (data: ProjectData) => set({
        project: data.project,
        nodes: data.nodes,
        ways: data.ways
    }),

    setMode: (mode: 'view' | 'edit') => set({ mode }),

    selectElement: (type: 'node' | 'way' | null, id?: string) => set({
        selectedElement: type && id ? { type, id } : null
    }),

    setInteractionMode: (mode) => set({ interactionMode: mode }),
    setTempScalePoint: (point, x, y) => set((state) => ({
        tempScalePoints: { ...state.tempScalePoints, [point]: { x, y } }
    }))

}));
