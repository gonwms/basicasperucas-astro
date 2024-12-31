type Contacto = { [key: string]: string };
// type Contacto = Record<string, string>

export interface MapPoint {
  id: number;
  lngLat: [number, number];
  title: string;
  description: string;
  address: string;
  contacto: Contacto;
  color: string;
}

export interface Markers {
  id: number;
  type: string;
  marker: maplibregl.Marker;
}

export type Address = {
  geometry: Geometry;
  properties: Properties;
};

type Geometry = {
  coordinates: [number, number];
  type: 'Point';
};

type Properties = {
  city: string;
  country: string;
  country_code: string;
  county: string;
  district: string;
  housenumber: string;
  locality: string;
  osm_id: number;
  osm_key: string;
  osm_type: string;
  osm_value: string;
  postcode: string;
  state: string;
  street: string;
  type: string;
  result_type: string;
  address_line1: string;
  address_line2: string;
  formatted: string;
};
