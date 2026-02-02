export type Unit = 'm' | 'km' | 'mile' | string;

export interface ScalePoint {
    x: number;
    y: number;
}

export interface ScaleConfig {
    p1: ScalePoint;
    p2: ScalePoint;
    actualDistance: number;
    unit: Unit;
}

export interface ViewBox {
    zoom: number;
    panX: number;
    panY: number;
}

export interface ProjectSettings {
    mapImage: string | null;
    mapImageSize?: { width: number; height: number }; // Original image dimensions in pixels
    viewBox: ViewBox;
    scale: ScaleConfig | null;
}

export interface NodeTags {
    name?: string;
    "name:en"?: string;
    place?: string; // town, village, city, etc.
    [key: string]: string | undefined;
}

export interface MapNode {
    id: string;
    x: number; // Normalized (0-1)
    y: number; // Normalized (0-1)
    tags: NodeTags;
    visible?: boolean;
}

export interface WayTags {
    name?: string;
    highway?: string; // footway, primary, etc.
    [key: string]: string | undefined;
}

export interface MapWay {
    id: string;
    nodes: string[]; // List of Node IDs
    tags: WayTags;
    visible?: boolean;
}

export interface ProjectData {
    project: ProjectSettings;
    nodes: MapNode[];
    ways: MapWay[];
}
