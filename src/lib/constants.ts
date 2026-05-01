export const COLORS = {
  black: "#111111",
  white: "#ffffff",
  gray: {
    50: "#f9fafb",
    100: "#f3f4f6",
    300: "#d1d5db",
    500: "#6b7280",
    700: "#374151",
    900: "#111111",
  },
}

export const ROOMS_PER_PAGE = 12

export const AMENITIES = [
  "WiFi",
  "Kitchen",
  "AC",
  "Heating",
  "Parking",
  "Washer/Dryer",
  "Pool",
  "Gym",
  "Pet Friendly",
  "Balcony",
]

export const BEDROOM_OPTIONS = [1, 2, 3, 4, 5]

export const PRICE_RANGES = [
  { min: 0, max: 500, label: "Under $500" },
  { min: 500, max: 1000, label: "$500 - $1000" },
  { min: 1000, max: 1500, label: "$1000 - $1500" },
  { min: 1500, max: 2000, label: "$1500 - $2000" },
  { min: 2000, max: Number.POSITIVE_INFINITY, label: "$2000+" },
]