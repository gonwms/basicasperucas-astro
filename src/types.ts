type Contacto = { [key: string]: string }
// type Contacto = Record<string, string>

export interface MapPoint {
  id: number
  lngLat: [number, number]
  title: string
  description: string
  address: string
  contacto: Contacto
  color: string
}
