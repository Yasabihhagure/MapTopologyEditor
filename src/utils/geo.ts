import type { ScaleConfig, Unit } from '../types/schema';

export const convertUnitToMeters = (value: number, unit: Unit): number => {
    switch (unit.toLowerCase()) {
        case 'm': return value;
        case 'km': return value * 1000;
        case 'mile': return value * 1609.344;
        default: return value;
    }
};

export const convertMetersToUnit = (valueInMeters: number, unit: Unit): number => {
    switch (unit.toLowerCase()) {
        case 'm': return valueInMeters;
        case 'km': return valueInMeters / 1000;
        case 'mile': return valueInMeters / 1609.344;
        default: return valueInMeters;
    }
};

export const getNormalizedDistance = (p1: { x: number, y: number }, p2: { x: number, y: number }, aspectRatio: number): number => {
    const dx = p1.x - p2.x;
    const dy = (p1.y - p2.y) / aspectRatio;
    return Math.sqrt(dx * dx + dy * dy);
};

export const calculateDistance = (
    p1: { x: number, y: number },
    p2: { x: number, y: number },
    scale: ScaleConfig,
    imageWidth: number,
    imageHeight: number
): number => {
    const p1Px = { x: p1.x * imageWidth, y: p1.y * imageHeight };
    const p2Px = { x: p2.x * imageWidth, y: p2.y * imageHeight };

    const targetDistPx = Math.sqrt(Math.pow(p1Px.x - p2Px.x, 2) + Math.pow(p1Px.y - p2Px.y, 2));

    const s1Px = { x: scale.p1.x * imageWidth, y: scale.p1.y * imageHeight };
    const s2Px = { x: scale.p2.x * imageWidth, y: scale.p2.y * imageHeight };

    const refDistPx = Math.sqrt(Math.pow(s1Px.x - s2Px.x, 2) + Math.pow(s1Px.y - s2Px.y, 2));

    if (refDistPx === 0) return 0;

    return (targetDistPx / refDistPx) * scale.actualDistance;
};

export const formatDistance = (distance: number, unit: Unit): string => {
    if (!['m', 'km', 'mile'].includes(unit.toLowerCase())) {
        return `${distance.toFixed(2)} ${unit}`;
    }
    return `${distance.toFixed(2)} ${unit}`;
};
