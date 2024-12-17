import React, { useEffect, useRef, useState } from "react"
import maplibregl from "maplibre-gl"
import type { MapPoint } from "@/types"
import LocationSearchBar from "@/components/locationSearchBar/locationSearchBar"
import "maplibre-gl/dist/maplibre-gl.css"

import data from "@/data.json"
import mapStyle from "./mapStyle.json"
import fronteras from "./fronteras.json"

type Props = React.HTMLAttributes<HTMLDivElement>

import Card from "@/components/card/card"

/* CONSTS */
const mapPoints = data as unknown as MapPoint[]

const SPEED = 1.8
const CURVE = 1
const ZOOM_DEFAULT = 12
const DEFAULT_LNG_LAT: [number, number] = [-58.2189936, -34.7626968]

export default function Map(props: Props) {
  //
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maplibregl.Map | null>(null)
  // const defaultCordinates = useRef(DEFAULT_LNG_LAT)
  const center = useRef(DEFAULT_LNG_LAT)
  const [selectedPoint, setSelectedPoint] = useState<MapPoint | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  // const [searchResults, setSearchResults] = useState<any[]>([])

  // MAP SETUP
  useEffect(() => {
    if (!mapContainer.current) return
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      // style: "https://tiles.stadiamaps.com/styles/alidade_smooth_dark.json",
      style: mapStyle as maplibregl.MapOptions["style"], // https://maplibre.org/maputnik
      center: center.current,
      zoom: ZOOM_DEFAULT,
      minZoom: 2,
      maxZoom: 18,
      attributionControl: false,
    })

    if (!map.current) return
    // ADD CONTROLS -----------------------------------
    map.current.on("load", () => {
      map.current!.addControl(
        new maplibregl.NavigationControl({
          visualizePitch: true,
          showZoom: true,
          showCompass: true,
        })
      )
      map.current!.addControl(
        new maplibregl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true,
          },
          trackUserLocation: true,
        })
      )
      map.current!.addControl(
        new maplibregl.AttributionControl({
          compact: true,
        }),
        "bottom-left"
      )
    })
    // ADD ARGENTINA OUTLINE -----------------------------------
    map.current.on("load", () => {
      map.current!.addSource("argentina", {
        type: "geojson",
        data: fronteras as GeoJSON.FeatureCollection,
      })
      map.current!.addLayer({
        id: "argentina-outline",
        type: "line",
        source: "argentina",
        paint: {
          "line-color": "#3fb1cecc",
          "line-width": 1,
          // "line-gap-width": 2,
          "line-dasharray": [2, 2],
        },
      })
    })
    // ADD MARKERS ------------------------------------
    map.current.on("load", () => {
      mapPoints.forEach((point) => {
        const marker = new maplibregl.Marker({
          // color: "#0000ff55",
          // draggable: true,
        })
          .setLngLat(point.lngLat)
          .addTo(map.current!)

        // 2. HANDLE MARKERS CLICK
        const element = marker.getElement()
        element.addEventListener("click", () => {
          setSelectedPoint(point)
          map.current!.flyTo({
            center: point.lngLat,
            zoom: 14,
            speed: SPEED,
            curve: CURVE,
          })
        })
      })
    })
    // HANDLE MOVE
    map.current.on("moveend", (e: any) => {
      const mapcenter = map.current!.getCenter()
      center.current = [mapcenter.lng, mapcenter.lat]
      // console.log(mapcenter)
    })
    return () => {
      map.current?.remove()
    }
  }, [])

  //  RENDER ----------------------------------------------
  return (
    <>
      <div ref={mapContainer} style={{ width: "100%", height: "60vh" }}></div>

      <LocationSearchBar
        setSelectedPoint={setSelectedPoint}
        setSearchQuery={setSearchQuery}
        map={map}
        center={center.current}
        zoom={14}
        speed={SPEED}
        curve={CURVE}
        searchQuery={searchQuery}
      />
      {selectedPoint && (
        <>
          <Card
            setSelectedPoint={setSelectedPoint}
            selectedPoint={selectedPoint}
          />
        </>
      )}
    </>
  )
}
