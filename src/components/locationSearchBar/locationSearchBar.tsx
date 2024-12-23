import * as Popover from '@radix-ui/react-popover';
import { useState, useRef, useEffect } from 'react';
import type { MapPoint } from '@/types';
import maplibregl from 'maplibre-gl';
import { GeocodingApi, Configuration } from '@stadiamaps/api';
import styles from './style.module.css';
import { useDebounce } from '@/utils/useDebounce';

interface IsProps {
  map: React.MutableRefObject<maplibregl.Map | null>;
  center: [number, number];
  zoom: number;
  speed: number;
  curve: number;
  setSelectedPoint?: React.Dispatch<React.SetStateAction<MapPoint | null>>;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  searchQuery: string;
}

export default function LocationSearchBar({ setSelectedPoint, setSearchQuery, map, center, zoom, speed, curve, searchQuery }: IsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedSearchQuery = useDebounce(searchQuery, 300); // 300ms delay
  const [searchState, setSearchState] = useState<'idle' | 'loading' | 'success' | 'empty'>('success');

  // FETCH SUGGESTIONS
  useEffect(() => {
    async function fetchSuggestions() {
      const config = new Configuration({
        apiKey: '02a8b5af-47cd-43d3-8f83-869801b880cd',
        headers: {
          Origin: 'https://basicasperucas.pages.dev',
          Referer: 'https://basicasperucas.pages.dev/'
        }
      });
      const api = new GeocodingApi(config);
      const res = await api.search({
        text: debouncedSearchQuery,
        lang: 'es-AR',
        size: 10,
        layers: ['street', 'county', 'region', 'country'],
        focusPointLon: center[0],
        focusPointLat: center[1]
        // boundaryCountry: ["AR"],
      });
      // console.log(res.features);
      // FORMAT SUGGESTIONS
      const number = debouncedSearchQuery.match(/\d+/);
      const labels = res.features.map((item) => {
        const addr = {
          street: item?.properties?.street ? item.properties.street : '',
          number: number ? ` ${number[0]}` : '',
          county: item?.properties?.county ? `, ${item.properties.county}` : '',
          region: item?.properties?.region ? `, ${item.properties.region}` : '',
          country: item?.properties?.country ? `, ${item.properties.country}` : ''
        };

        // if (addr.street === undefined || addr.region === undefined) return

        return `${addr.street}${addr.number}${addr.county}${addr.region}${addr.country}`;
      });

      setSuggestions(labels);
    }
    fetchSuggestions();
  }, [debouncedSearchQuery, center]);

  // OPEN POPOVER
  useEffect(() => {
    if (suggestions.length > 0) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [suggestions]);

  // HANDLE AUTOCOMPLETE
  async function handleAutocomplete(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.currentTarget.value;
    setSearchQuery(value);
  }

  // HANDLE SEARCH
  const handleSearch = async () => {
    setSearchState('loading');
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();

      if (data && data.length > 0) {
        setSearchState('success');
        const [lng, lat] = [parseFloat(data[0].lon), parseFloat(data[0].lat)];
        map.current?.flyTo({
          center: [lng, lat],
          zoom: zoom,
          speed: speed,
          curve: curve
        });
        //
        new maplibregl.Marker({
          color: '#ffffff'
        })
          .setLngLat([lng, lat])
          .addTo(map.current!);
      } else {
        setSearchState('empty');
      }
    } catch (error) {
      console.error('Error searching for location:', error);
    }
  };

  // HANDLE RESET
  const handleResetView = () => {
    map.current?.flyTo({
      center: center,
      zoom: zoom,
      speed: speed,
      curve: curve
    });
    // setSelectedPoint(null);
  };

  // HANDLE SUGGESTION SELECTION
  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setOpen(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className={styles.serchContainer}>
      <div className={styles.serchForm}>
        <Popover.Root open={open} onOpenChange={setOpen}>
          <Popover.Anchor className={styles.searchAnchor}>
            <input
              ref={inputRef}
              name="search"
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={handleAutocomplete}
              className={styles.searchInput}
            />
            <button onClick={handleSearch} className={styles.searchButton}>
              {searchState === 'loading' ? 'Loading...' : 'Search'}
            </button>
          </Popover.Anchor>
          <Popover.Portal>
            <Popover.Content className={styles.popoverContent} align="start" side="top" sideOffset={5} onOpenAutoFocus={(e) => e.preventDefault()}>
              {suggestions.map((label, index) => (
                <button key={index} onClick={() => handleSuggestionClick(label)} className={styles.suggestionItem}>
                  {label}
                </button>
              ))}
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>

        <button onClick={handleResetView} className={styles.resetButton}>
          Reset View
        </button>
      </div>
      {searchState === 'empty' && <small>No found</small>}
    </div>
  );
}
