import React, { useCallback, useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { MapPoint } from '@/types';

import data from '@/data/data.json';
import mapStyle from './mapStyle.json';
import fronteras from './fronteras.json';
import LocationSearchBar from '@/components/locationSearchBar/locationSearchBar';
import CardStack from '@/components/card/cardStack';
import useUrlParameters from '@/utils/useUrlParameters';
import { debouncer } from '@/utils/debouncer';

/* CONSTS */
const mapPoints = data as unknown as MapPoint[];
const SPEED = 3;
const CURVE = 0.5;
const ZOOM_DEFAULT = 4;
const DEFAULT_LNG_LAT: [number, number] = [-64.85, -41.05];

export default function Map() {
  //
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const center = useRef(DEFAULT_LNG_LAT);
  const [searchQuery, setSearchQuery] = useState('');
  const { search, searchParams } = useUrlParameters();

  // MAP SETUP
  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      // style: "https://tiles.stadiamaps.com/styles/alidade_smooth_dark.json",
      style: mapStyle as maplibregl.MapOptions['style'], // https://maplibre.org/maputnik
      center: center.current,
      zoom: ZOOM_DEFAULT,
      minZoom: 2,
      maxZoom: 18,
      attributionControl: false
    });

    if (!map.current) return;

    // ADD CONTROLS
    map.current.on('load', () => {
      map.current!.addControl(
        new maplibregl.NavigationControl({
          visualizePitch: true,
          showZoom: true,
          showCompass: true
        })
      );
      map.current!.addControl(
        new maplibregl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true
          },
          trackUserLocation: true
        })
      );
    });
    // ADD ARGENTINA GeoJSON OUTLINE
    map.current.on('load', () => {
      map.current!.addSource('argentina', {
        type: 'geojson',
        data: fronteras as GeoJSON.FeatureCollection
      });
      map.current!.addLayer({
        id: 'argentina-outline',
        type: 'line',
        source: 'argentina',
        paint: {
          'line-color': '#3fb1cecc',
          'line-width': 1,
          'line-dasharray': [2, 2]
        }
      });
    });
    // ADD MARKERS
    map.current.on('load', () => {
      mapPoints.forEach((point) => {
        const marker = new maplibregl.Marker({
          // color: "#3fb1cecc", draggable: true,
        })
          .setLngLat(point.lngLat)
          .addTo(map.current!);

        // 2. HANDLE MARKERS CLICK
        const element = marker.getElement();
        element.addEventListener('click', () => {
          const url = new URL(window.location.href);
          url.searchParams.set('basica', point.id.toString());
          window.history.pushState({}, '', url);
        });
      });
    });
    // HANDLE MOVE
    map.current.on('moveend', (e: any) => {
      const mapcenter = map.current!.getCenter();
      center.current = [mapcenter.lng, mapcenter.lat];
      // console.log('center', center.current);
    });
    return () => {
      map.current?.remove();
    };
  }, []);

  // LISTEN SEARCHPARAMS CHANGES
  const flyTo = useCallback((point: MapPoint) => {
    if (map.current) {
      const offsetLatitud = 0.0045; // para centrar el punto en la pantalla
      const lngLat = [point.lngLat[0], point.lngLat[1] - offsetLatitud] as [number, number];
      map.current.flyTo({
        center: lngLat,
        zoom: 13,
        speed: SPEED,
        curve: CURVE
      });
    }
  }, []);
  const debouncedFlyTo = useRef(debouncer(flyTo, 300));

  useEffect(() => {
    const basica = searchParams?.get('basica');
    if (basica) {
      const [point] = mapPoints?.filter((point) => point.id.toString() === basica);
      debouncedFlyTo.current(point);
    }
  }, [search]);

  //  RENDER
  return (
    <>
      {<CardStack />}
      <div ref={mapContainer} style={{ width: '100%', height: '100dvh' }}></div>
      <LocationSearchBar
        map={map}
        center={center.current}
        zoom={14}
        speed={SPEED}
        curve={CURVE}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
    </>
  );
}
