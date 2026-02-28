// Mock Wayfinding Service (GoodMaps CPS Mock Layer)
import { GateInfo, NavigationRoute, RouteWaypoint } from './types';

// Mock POIs within Gatwick terminals
export const MOCK_POIS: GateInfo[] = [
    { id: 'gate-1', name: 'Gate 1', terminal: 'North', floor: 1, lat: 51.1537, lng: -0.1821, type: 'gate' },
    { id: 'gate-21', name: 'Gate 21', terminal: 'North', floor: 1, lat: 51.1542, lng: -0.1835, type: 'gate' },
    { id: 'gate-45', name: 'Gate 45', terminal: 'South', floor: 1, lat: 51.1485, lng: -0.1790, type: 'gate' },
    { id: 'gate-101', name: 'Gate 101', terminal: 'South', floor: 2, lat: 51.1490, lng: -0.1810, type: 'gate' },
    { id: 'security-north', name: 'North Security', terminal: 'North', floor: 0, lat: 51.1530, lng: -0.1825, type: 'security' },
    { id: 'security-south', name: 'South Security', terminal: 'South', floor: 0, lat: 51.1480, lng: -0.1795, type: 'security' },
    { id: 'whsmith-north', name: 'WHSmith', terminal: 'North', floor: 1, lat: 51.1535, lng: -0.1828, type: 'shop' },
    { id: 'worldduty-south', name: 'World Duty Free', terminal: 'South', floor: 1, lat: 51.1483, lng: -0.1798, type: 'shop' },
    { id: 'nandos-north', name: "Nando's", terminal: 'North', floor: 1, lat: 51.1539, lng: -0.1830, type: 'restaurant' },
    { id: 'lounge-no1', name: 'No1 Lounge', terminal: 'North', floor: 1, lat: 51.1541, lng: -0.1832, type: 'lounge' },
    { id: 'restroom-n1', name: 'Restroom N1', terminal: 'North', floor: 1, lat: 51.1536, lng: -0.1826, type: 'restroom' },
];

function generateWaypoints(from: GateInfo, to: GateInfo, accessibility: NavigationRoute['accessibility']): RouteWaypoint[] {
    const steps: RouteWaypoint[] = [];
    const numSteps = Math.floor(3 + Math.random() * 4);
    const isWheelchair = accessibility === 'wheelchair';
    const isVisuallyImpaired = accessibility === 'visually-impaired';

    // Start
    steps.push({
        lat: from.lat,
        lng: from.lng,
        floor: from.floor,
        instruction: `Starting from ${from.name}.`,
        distance: 0,
        landmark: from.name,
    });

    // Intermediate steps
    for (let i = 1; i < numSteps - 1; i++) {
        const progress = i / (numSteps - 1);
        const lat = from.lat + (to.lat - from.lat) * progress + (Math.random() - 0.5) * 0.0003;
        const lng = from.lng + (to.lng - from.lng) * progress + (Math.random() - 0.5) * 0.0003;
        const dist = Math.floor(20 + Math.random() * 80);
        const directions = ['Continue straight', 'Turn left', 'Turn right', 'Bear left', 'Bear right'];
        const dir = directions[Math.floor(Math.random() * directions.length)];

        let instruction = `${dir} for ${dist} metres.`;
        if (isWheelchair && i === 1) {
            instruction = `Take the elevator to Level ${to.floor}. ${instruction}`;
        }
        if (isVisuallyImpaired) {
            const landmarks = ['WHSmith on your right', 'information desk on your left', 'moving walkway ahead'];
            instruction += ` ${landmarks[i % landmarks.length]}.`;
        }

        steps.push({ lat, lng, floor: to.floor, instruction, distance: dist });
    }

    // End
    steps.push({
        lat: to.lat,
        lng: to.lng,
        floor: to.floor,
        instruction: `You have arrived at ${to.name}.`,
        distance: 0,
        landmark: to.name,
    });

    return steps;
}

export function getRoute(
    fromId: string,
    toId: string,
    accessibility: NavigationRoute['accessibility'] = 'standard'
): NavigationRoute {
    const from = MOCK_POIS.find((p) => p.id === fromId) ?? MOCK_POIS[0];
    const to = MOCK_POIS.find((p) => p.id === toId) ?? MOCK_POIS[2];
    const waypoints = generateWaypoints(from, to, accessibility);
    const totalDistance = waypoints.reduce((sum, w) => sum + w.distance, 0) + Math.floor(50 + Math.random() * 200);
    const walkSpeed = accessibility === 'wheelchair' ? 40 : 60; // meters per minute
    const estimatedTime = Math.ceil(totalDistance / walkSpeed);

    return { waypoints, totalDistance, estimatedTime, accessibility };
}

export function getNearbyPOIs(terminal: 'North' | 'South', type?: GateInfo['type']): GateInfo[] {
    return MOCK_POIS.filter((p) => p.terminal === terminal && (!type || p.type === type));
}
