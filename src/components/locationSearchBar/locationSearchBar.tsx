import * as Popover from "@radix-ui/react-popover"
import { useState } from "react"
import type { MapPoint } from "@/types"
import maplibregl from "maplibre-gl"
import { GeocodingApi } from "@stadiamaps/api"
import styles from "./style.module.css"
// https://docs.stadiamaps.com/sdks/javascript-typescript/

interface IsProps {
  map: React.MutableRefObject<maplibregl.Map | null>
  center: [number, number]
  zoom: number
  speed: number
  curve: number
  setSelectedPoint: React.Dispatch<React.SetStateAction<MapPoint | null>>
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>
  searchQuery: string
}

export default function LocationSearchBar({
  setSelectedPoint,
  setSearchQuery,
  map,
  center,
  zoom,
  speed,
  curve,
  searchQuery,
}: IsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([])

  // HANDLE AUTOCOMPLETE
  async function handleAutocomplete(e: React.ChangeEvent<HTMLInputElement>) {
    setSearchQuery(e.currentTarget.value)

    if (e.target.value.length > 5) {
      const api = new GeocodingApi()
      const res = await api.search({
        text: e.currentTarget.value,
        lang: "es-AR",
        size: 10,
        layers: ["street", "county", "region"],
        focusPointLon: center[0],
        focusPointLat: center[1],
        boundaryCountry: ["AR"],
      })

      const number = e.currentTarget?.value?.match(/\d+/)
      console.log(number)
      const labels = res.features
        .map((item) => {
          const street = item?.properties?.street

          const housenumber =
            e.currentTarget?.value?.match(/\d+/) !== undefined
              ? e.target?.value?.match(/\d+/)
              : ""
          const county = item?.properties?.county
            ? ", " + item?.properties?.county
            : ""
          const region = item?.properties?.region
            ? ", " + item?.properties?.region
            : ""

          if (street === undefined) return
          if (region === undefined) return

          return `${street} ${housenumber}${county} ${region}`
        })
        .filter((label) => label !== undefined)

      setSuggestions(labels)

      console.log(JSON.stringify(res.features[0], null, 2))
    }
  }
  // HANDLE SEARCH ANYWHERE
  const handleSearchAnywhere = async () => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}`
      )
      const data = await response.json()

      if (data && data.length > 0) {
        const [lng, lat] = [parseFloat(data[0].lon), parseFloat(data[0].lat)]
        map.current?.flyTo({
          center: [lng, lat],
          zoom: zoom,
          speed: speed,
          curve: curve,
        })
        new maplibregl.Marker({
          color: "#ffffff",
          // draggable: true,
        })
          .setLngLat([lng, lat])
          .addTo(map.current!)
      }
    } catch (error) {
      console.error("Error searching for location:", error)
    }
  }

  // HANDLE RESET
  const handleResetView = () => {
    console.log(map.current)
    map.current?.flyTo({
      center: center,
      zoom: zoom,
      speed: speed,
      curve: curve,
    })
    setSelectedPoint(null)
  }

  //  RENDER ------------------------------------------------------------------------

  return (
    <nav className={styles.nav}>
      <Popover.Root open={suggestions.length > 0}>
        <Popover.Trigger>
          <input
            name="search"
            type="text"
            placeholder="Buscar"
            value={searchQuery}
            onChange={(e) => handleAutocomplete(e)}
          />
        </Popover.Trigger>
        <Popover.Content
          sideOffset={0}
          autoFocus={false}
          className={styles.popoverContent}
        >
          {suggestions.map((label, index) => (
            <button
              key={index}
              onClick={() => {
                setSearchQuery(label)
                setSuggestions([])
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  setSearchQuery(label)
                  setSuggestions([])
                }
              }}
            >
              {label}
            </button>
          ))}
        </Popover.Content>
      </Popover.Root>

      <button onClick={handleSearchAnywhere}>Buscar</button>
      <button onClick={handleResetView}>Reset View</button>
    </nav>
  )
}
