import type { MapPoint } from "@/types"

interface Props {
  selectedPoint: MapPoint
  setSelectedPoint: React.Dispatch<React.SetStateAction<MapPoint | null>>
}

export default function Card({ selectedPoint, setSelectedPoint }: Props) {
  return (
    <div className="card">
      {JSON.stringify(selectedPoint)}
      <h1>{selectedPoint.title}</h1>
      <p>{selectedPoint.description}</p>
    </div>
  )
}
