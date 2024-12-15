// Datos de ejemplo
const fakeData = [
  {
    id: 1,
    lngLat: [-58.2189936, -34.7626968],
    title: "New York",
    slug: "new-york",
    description: "The Big Apple",
    address: "Moreno 1154, Caba",
    contacto: [
      { whatsapp: "1167635792" },
      { telegram: "1167635792" },
      { facebook: "https://www.facebook.com/lala" },
      { instagram: "https://www.instagram.com/lala" },
    ],
  },
  {
    id: 2,
    lngLat: [-58.8189936, -36.7626968],
    title: "Los Angeles",
    slug: "los-angeles",
    description: "City of Angels",
    address: "Moreno 1154, Caba",
    contacto: [
      { whatsapp: "1167635792" },
      { telegram: "1167635792" },
      { facebook: "https://www.facebook.com/lala" },
      { instagram: "https://www.instagram.com/lala" },
    ],
  },
  {
    id: 3,
    lngLat: [-58.57713524483238, -34.55612251528223],
    title: "Chicago",
    slug: "chicago",
    description: "The Windy City",
    address: "Moreno 1154, Caba",
    contacto: [
      { whatsapp: "1167635792" },
      { telegram: "1167635792" },
      { facebook: "https://www.facebook.com/lala" },
      { instagram: "https://www.instagram.com/lala" },
    ],
  },
]

// Función para simular una API con latencia de 1 segundo
export default function fetchFakeData() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(fakeData)
    }, 1000) // Latencia de 1 segundo
  })
}
