import data from "@/data.json"
import mapStyle from "@/mapStyle.json"
import fronteras from "@/fronteras.json"

import React, { useEffect, useRef, useState } from "react"
import maplibregl from "maplibre-gl"
import Card from "../components/Card.astro"
import type { MapPoint } from "@/types"
import LocationSearchBar from "@/components/locationSearchBar"

/*
 * -------------------------------------
 * CONSTS
 * -------------------------------------
 */
const mapPointsData = data as MapPoint[]

const SPEED = 1.8
const CURVE = 1
const ZOOM_DEFAULT = 12
const DEFAULT_LNG_LAT: [number, number] = [-58.2189936, -34.7626968]

export default function Map() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maplibregl.Map | null>(null)
  const defaultCordinates = useRef(DEFAULT_LNG_LAT)
  const [selectedPoint, setSelectedPoint] = useState<MapPoint | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  // const [searchResults, setSearchResults] = useState<any[]>([])

  useEffect(() => {
    if (!mapContainer.current) return
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      // style: "https://tiles.stadiamaps.com/styles/alidade_smooth_dark.json",
      style: mapStyle as maplibregl.MapOptions["style"], // https://maplibre.org/maputnik
      center: defaultCordinates.current,
      zoom: ZOOM_DEFAULT,
      minZoom: 2,
      maxZoom: 16,
    })

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
      mapPointsData.forEach((point) => {
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
    // HANDLE MOUSEMOVE
    map.current.on("mousemove", (e: any) => {
      // console.log(e.lngLat)
    })

    return () => {
      map.current?.remove()
    }
  }, [])

  //  RETURN ----------------------------------------------
  return (
    <>
      <div
        ref={mapContainer}
        style={{ height: "800px", width: "100%", position: "relative" }}
      ></div>

      <LocationSearchBar
        setSelectedPoint={setSelectedPoint}
        setSearchQuery={setSearchQuery}
        map={map}
        center={defaultCordinates.current}
        zoom={ZOOM_DEFAULT}
        speed={SPEED}
        curve={CURVE}
        searchQuery={searchQuery}
      />
      {selectedPoint && (
        <Card
          selectedPoint={selectedPoint}
          setSelectedPoint={setSelectedPoint}
        />
      )}
    </>
  )
}
