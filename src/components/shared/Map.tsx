import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { LocateFixed, Navigation } from 'lucide-react';

// Fix for default marker icons in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapProps {
  lat: number;
  lng: number;
  title: string;
  address?: string;
  className?: string;
  showDirections?: boolean;
}

interface RouteStep {
  instruction: string;
  distance: string;
}

interface RouteSummary {
  coordinates: [number, number][];
  distanceKm: string;
  durationMin: string;
  accuracy: string | null;
  steps: RouteStep[];
}

function MapUpdater({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 15);
  }, [lat, lng, map]);
  return null;
}

export function Map({ lat, lng, title, address, className, showDirections = true }: MapProps) {
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);
  const [route, setRoute] = useState<RouteSummary | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState('');

  const bounds = useMemo(() => {
    if (!route?.coordinates.length) return null;
    return L.latLngBounds(route.coordinates);
  }, [route]);

  const handleDirections = () => {
    setRouteError('');

    if (!navigator.geolocation) {
      setRouteError('Your browser does not support location access.');
      return;
    }

    setRouteLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setUserPosition([position.coords.latitude, position.coords.longitude]);

        try {
          const response = await fetch(
            `https://router.project-osrm.org/route/v1/driving/${position.coords.longitude},${position.coords.latitude};${lng},${lat}?overview=full&geometries=geojson&steps=true`
          );

          if (!response.ok) throw new Error('Route service unavailable.');

          const data = await response.json();
          const foundRoute = data.routes?.[0];
          if (!foundRoute) throw new Error('No route found.');

          setRoute({
            coordinates: foundRoute.geometry.coordinates.map(([routeLng, routeLat]: [number, number]) => [routeLat, routeLng]),
            distanceKm: (foundRoute.distance / 1000).toFixed(1),
            durationMin: Math.max(1, Math.round(foundRoute.duration / 60)).toString(),
            accuracy: position.coords.accuracy ? `${Math.round(position.coords.accuracy)} m` : null,
            steps: buildRouteSteps(foundRoute.legs?.[0]?.steps || []),
          });
        } catch (error: any) {
          setRouteError(error.message || 'Could not load directions.');
        } finally {
          setRouteLoading(false);
        }
      },
      () => {
        setRouteLoading(false);
        setRouteError('Location permission is needed to show directions from where you are.');
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
    );
  };

  return (
    <div className={`relative z-10 w-full max-w-full overflow-hidden rounded-xl ${className}`}>
      <MapContainer center={[lat, lng]} zoom={15} className="w-full h-full min-h-[300px]">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {!bounds && <MapUpdater lat={lat} lng={lng} />}
        {bounds && <RouteBounds bounds={bounds} />}
        {route && (
          <Polyline
            positions={route.coordinates}
            pathOptions={{ color: '#DC2626', weight: 5, opacity: 0.9 }}
          />
        )}
        {userPosition && (
          <Marker position={userPosition}>
            <Popup>
              <div className="font-sans text-one-black">Your location</div>
            </Popup>
          </Marker>
        )}
        <Marker position={[lat, lng]}>
          <Popup>
            <div className="font-sans text-one-black space-y-2 p-1">
              <p className="font-bold">{title}</p>
              {address && <p className="text-sm">{address}</p>}
              {showDirections && (
                <Button size="sm" className="w-full h-8 text-xs mt-2" onClick={handleDirections}>
                  <Navigation className="h-3 w-3 mr-1" /> Route from Me
                </Button>
              )}
            </div>
          </Popup>
        </Marker>
      </MapContainer>
      {showDirections && (
        <div className="absolute bottom-3 left-3 right-3 z-[500] max-h-[55%] max-w-[calc(100%-1.5rem)] overflow-y-auto rounded-lg border border-white/10 bg-one-black/90 p-3 text-white shadow-xl backdrop-blur sm:left-auto sm:w-80">
          <Button size="sm" className="w-full gap-2" onClick={handleDirections} disabled={routeLoading}>
            <LocateFixed className="h-4 w-4" />
            {routeLoading ? 'Getting your route...' : 'Use My Location for Directions'}
          </Button>
          {route && (
            <>
              <div className="mt-3 grid grid-cols-2 gap-2 text-center text-sm">
                <div className="rounded-md bg-white/5 p-2">
                  <p className="text-xs text-gray-400">Distance</p>
                  <p className="font-semibold">{route.distanceKm} km</p>
                </div>
                <div className="rounded-md bg-white/5 p-2">
                  <p className="text-xs text-gray-400">Drive Time</p>
                  <p className="font-semibold">{route.durationMin} min</p>
                </div>
              </div>
              {route.accuracy && (
                <p className="mt-2 text-xs text-gray-400">Location accuracy: about {route.accuracy}</p>
              )}
              {route.steps.length > 0 && (
                <ol className="mt-3 space-y-2 text-sm">
                  {route.steps.map((step, index) => (
                    <li key={`${step.instruction}-${index}`} className="flex gap-2 rounded-md bg-white/5 p-2">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-one-red text-[11px] font-bold text-white">
                        {index + 1}
                      </span>
                      <span className="min-w-0 flex-1 text-gray-200">{step.instruction}</span>
                      <span className="shrink-0 text-xs text-gray-400">{step.distance}</span>
                    </li>
                  ))}
                </ol>
              )}
            </>
          )}
          {routeError && <p className="mt-2 text-xs text-yellow-300">{routeError}</p>}
        </div>
      )}
    </div>
  );
}

function buildRouteSteps(steps: any[]): RouteStep[] {
  return steps
    .map((step) => ({
      instruction: getStepInstruction(step),
      distance: formatStepDistance(step.distance || 0),
    }))
    .filter((step) => step.instruction);
}

function getStepInstruction(step: any): string {
  const maneuver = step.maneuver || {};
  const road = step.name ? ` onto ${step.name}` : '';
  const modifier = maneuver.modifier ? maneuver.modifier.replace(/_/g, ' ') : '';

  switch (maneuver.type) {
    case 'depart':
      return step.name ? `Start on ${step.name}` : 'Start from your current location';
    case 'arrive':
      return 'Arrive at the showroom';
    case 'turn':
      return `Turn ${modifier}${road}`.trim();
    case 'new name':
      return step.name ? `Continue onto ${step.name}` : 'Continue straight';
    case 'continue':
      return step.name ? `Continue on ${step.name}` : 'Continue straight';
    case 'merge':
      return `Merge ${modifier}${road}`.trim();
    case 'on ramp':
      return `Take the ramp${road}`.trim();
    case 'off ramp':
      return `Take the exit${road}`.trim();
    case 'fork':
      return `Keep ${modifier}${road}`.trim();
    case 'end of road':
      return `At the end of the road, turn ${modifier}${road}`.trim();
    case 'roundabout':
    case 'rotary': {
      const exit = maneuver.exit ? ` and take exit ${maneuver.exit}` : '';
      return `Enter the roundabout${exit}${road}`.trim();
    }
    default:
      if (modifier) return `Go ${modifier}${road}`.trim();
      return step.name ? `Continue on ${step.name}` : 'Continue';
  }
}

function formatStepDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }

  return `${Math.max(1, Math.round(meters))} m`;
}

function RouteBounds({ bounds }: { bounds: L.LatLngBounds }) {
  const map = useMap();

  useEffect(() => {
    map.fitBounds(bounds, { padding: [32, 32] });
  }, [bounds, map]);

  return null;
}
