/**
 * LeafletMap.web.tsx — web-only, client-side-only interactive map.
 *
 * Leaflet and react-leaflet both access `window` at module-load time,
 * which crashes Expo's SSR/pre-render pass. The fix: never statically
 * import them. Instead, `require()` them lazily inside useEffect (after
 * the browser environment is confirmed), then trigger a re-render.
 */
import React, { useEffect, useRef, useState } from 'react';

// ─── Gatwick POI data ─────────────────────────────────────────────────────────
const GATWICK_CENTER: [number, number] = [51.1537, -0.1821];

const POI_MARKERS: { pos: [number, number]; title: string; detail: string }[] = [
    { pos: [51.1537, -0.1821], title: '✈ Terminal South',         detail: 'Gates 1–99 · Check-in & Arrivals' },
    { pos: [51.1512, -0.1635], title: '✈ Terminal North',         detail: 'Gates 101–195 · EasyJet Hub' },
    { pos: [51.1541, -0.1798], title: '🚂 Gatwick Express',       detail: 'South Terminal Railway Station' },
    { pos: [51.1528, -0.1842], title: '🅿 Short Stay Car Park S', detail: 'Terminal South · Level 1–5' },
    { pos: [51.1549, -0.1808], title: '🛍️ World Duty Free',       detail: 'Airside · Terminal South' },
    { pos: [51.1523, -0.1652], title: '🅿 Long Stay Car Park N',  detail: 'Terminal North Shuttle Stop' },
];

export interface LeafletMapProps {
    center?: [number, number];
    zoom?: number;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function LeafletMap({ center = GATWICK_CENTER, zoom = 15 }: LeafletMapProps) {
    const [isMounted, setIsMounted] = useState(false);
    const MapComponents = useRef<any>(null);

    useEffect(() => {
        // Only runs in the browser — never during SSR/pre-render
        if (typeof window === 'undefined') return;

        // 1. Inject Leaflet CSS from CDN
        if (!document.querySelector('link[data-leaflet-css]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
            link.setAttribute('data-leaflet-css', 'true');
            document.head.appendChild(link);
        }

        // 2. Lazily require leaflet + react-leaflet (safe — window exists here)
        const L = require('leaflet');
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
            iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
            shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        });

        MapComponents.current = require('react-leaflet');

        // 3. Trigger render now that components are loaded
        setIsMounted(true);
    }, []);

    // ── Loading state ─────────────────────────────────────────────────────────
    if (!isMounted || !MapComponents.current) {
        return (
            <div style={{
                height: 380,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(255,255,255,0.03)',
                borderRadius: 16,
                color: 'rgba(255,255,255,0.4)',
                fontSize: 13,
                gap: 8,
            }}>
                <span style={{ fontSize: 32 }}>🛰️</span>
                <span>Initialising Radar...</span>
            </div>
        );
    }

    // ── Live map ──────────────────────────────────────────────────────────────
    const { MapContainer, TileLayer, Marker, Popup } = MapComponents.current;

    return (
        <MapContainer
            center={center}
            zoom={zoom}
            style={{
                height: '380px',
                width: '100%',
                borderRadius: '16px',
                outline: 'none',
                background: '#1a1a1a',
            }}
            zoomControl
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors'
                maxZoom={19}
            />
            {POI_MARKERS.map(({ pos, title, detail }) => (
                <Marker key={title} position={pos}>
                    <Popup>
                        <div style={{ fontFamily: 'system-ui', lineHeight: '1.4', minWidth: 160 }}>
                            <strong style={{ fontSize: 13 }}>{title}</strong>
                            <br />
                            <span style={{ fontSize: 11, color: '#555' }}>{detail}</span>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}
