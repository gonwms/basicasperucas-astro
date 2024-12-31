import * as Popover from '@radix-ui/react-popover';
import { useState, useRef, useEffect } from 'react';
import type { MapPoint, Address, Markers } from '@/types';
import maplibregl from 'maplibre-gl';
import styles from './style.module.css';
import { useDebounce } from '@/utils/useDebounce';

interface IsProps {
  map: React.MutableRefObject<maplibregl.Map | null>;
  center: [number, number];
  zoom: number;
  speed: number;
  curve: number;
  setSelectedPoint?: React.Dispatch<React.SetStateAction<MapPoint | null>>;
}
const API = import.meta.env.PUBLIC_GEOAPIFY_API;

export default function LocationSearchBar({ map, center, zoom, speed, curve }: IsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 600); // 300ms delay
  const [searchState, setSearchState] = useState<'idle' | 'loading' | 'success' | 'empty'>('success');
  const userMarkers = useRef<maplibregl.Marker[]>([]);

  // FETCH SUGGESTIONS
  useEffect(() => {
    async function fetchSuggestions() {
      const config = {
        text: debouncedSearchQuery,
        lang: 'es',
        size: 10,
        focusPointLon: center[0],
        focusPointLat: center[1]
      };
      console.log(center);
      const res = await fetch(
        `https://api.geoapify.com/v1/geocode/autocomplete?text=${config.text}&apiKey=${API}&limit=${config.size}&lang=${config.lang}&bias=proximity:${config.focusPointLat},${config.focusPointLon}`
      );
      const data = await res.json();

      // FORMAT SUGGESTIONS
      const labels = data.features.map((item: Address) => {
        // console.log(item.properties.formatted);
        return item.properties.formatted;
      });

      const uniqueLabels = Array.from(new Set(labels)) as string[];
      setSuggestions(uniqueLabels);
    }
    fetchSuggestions();
  }, [debouncedSearchQuery]);

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
      const response = await fetch(`https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(searchQuery)}&apiKey=${API}`);
      const data = await response.json();
      console.log(data);
      if (data && data.features.length > 0) {
        setSearchState('success');
        // console.log(data.features[0].geometry.coordinates);

        map.current?.flyTo({
          center: data.features[0].geometry.coordinates,
          zoom: zoom,
          speed: speed,
          curve: curve
        });
        //

        const marker = new maplibregl.Marker({
          color: '#ffffff'
        })
          .setLngLat(data.features[0].geometry.coordinates)
          .addTo(map.current!);

        userMarkers.current.push(marker);
      } else {
        setSearchState('empty');
      }
    } catch (error) {
      console.error('Error searching for location:', error);
    }
  };

  // HANDLE RESET
  const handleResetView = () => {
    userMarkers.current.forEach((marker: any) => {
      console.log(marker);
      marker.remove();
    });
    // markers.current = [];
    map.current?.flyTo({
      center: center,
      zoom: 4,
      speed: speed,
      curve: curve
    });
  };

  // HANDLE SUGGESTION SELECTION
  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);

    inputRef.current!.focus();

    handleSearch();
    setOpen(false);
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
