---
name: Telemetry, IoT Data, & Spatial Routing
description: Manages FlightLabs/Aviation Edge APIs, Veovo IoT queue data, and GoodMaps/Mapbox LiDAR-based indoor navigation for the Oasis app.
---

## When to use this skill

Whenever fetching flight data, processing queue wait times, rendering indoor maps, implementing wayfinding routes, or building auditory navigation guidance.

## How to use it

### Flight Telemetry API Integration
- Use Aviation Edge or FlightLabs REST APIs for live flight data.
- Always filter by Gatwick: `&iataCode=LGW` parameter.
- Implement async polling with configurable intervals (default: 60 seconds).
- Parse critical JSON nodes:
  - `flight.status` → "en-route", "landed", "boarding", etc.
  - `departure.terminal` & `departure.gate` → Terminal North/South, gate number.
  - `arrival.baggage` → Carousel assignment.
  - `flight.delay` → Delay in minutes (null = on time).
- Store parsed data in Zustand `useFlightStore`.
- Handle API errors gracefully with retry logic (exponential backoff, max 3 retries).

### Veovo IoT Queue Metrics
- In the hackathon build, use a **mock service** that generates realistic queue times.
- Mock data shape must match expected Veovo API response:
  ```typescript
  interface QueueMetric {
    checkpoint: string;       // e.g., "Terminal North Security"
    waitTimeMinutes: number;  // e.g., 13
    trend: 'increasing' | 'decreasing' | 'stable';
    lastUpdated: string;      // ISO timestamp
  }
  ```
- Store in Zustand `useQueueStore`.
- Simulate real-time updates with `setInterval` (every 30 seconds).

### Mapbox Indoor Mapping (IMDF)
- Use `@rnmapbox/maps` for rendering indoor basemaps.
- Load IMDF (Indoor Mapping Data Format) GeoJSON for terminal floor plans.
- Support floor-level switching (Ground, Level 1, Level 2, etc.).
- Render POIs (gates, shops, restaurants, restrooms) as interactive markers.

### GoodMaps LiDAR CPS (Mock Layer for Hackathon)
- Implement a mock Camera Positioning System that:
  - Provides user position as `{ lat, lng, floor, heading, accuracy }`.
  - Simulates 3-foot accuracy updates at 10Hz.
  - Returns pre-computed route waypoints between any two POIs.
- Route computation must support accessibility variants:
  - **Standard**: Shortest path.
  - **Wheelchair**: Step-free only, elevator priority, wide corridors.
  - **Visually Impaired**: Tactile floor paths, minimal obstacle routes.

### Auditory Wayfinding (Text-to-Speech)
- Use `expo-speech` for turn-by-turn audio guidance.
- Instructions must be clear, single-action commands:
  - ✅ "Continue straight for 50 meters."
  - ✅ "Turn left toward Gate 45."
  - ❌ "Walk straight then turn left at the next intersection and look for Gate 45."
- Announce environmental context: "You are passing WHSmith on your right."
- Respect user preferences: speech rate, volume, language.
- Provide on-screen text alternatives for deaf/HoH users with high-contrast styling.
