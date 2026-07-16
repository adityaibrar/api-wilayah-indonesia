import fs from "fs"
import path from "path"
import { parse } from "csv-parse/sync"

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Province {
  code: string
  name: string
}

export interface City {
  code: string
  province_code: string
  name: string
}

export interface District {
  code: string
  city_code: string
  name: string
}

export interface Village {
  code: string
  district_code: string
  name: string
}

// ─── CSV Reader ───────────────────────────────────────────────────────────────

function readCSV<T>(filePath: string): T[] {
  let fullPath = path.join(process.cwd(), filePath)

  // Vercel Serverless Fallback
  if (!fs.existsSync(fullPath)) {
    const parentPath = path.join(process.cwd(), "..", filePath)
    if (fs.existsSync(parentPath)) {
      fullPath = parentPath
    }
  }

  const fileContent = fs.readFileSync(fullPath, "utf8")
  return parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
  }) as T[]
}

// ─── Cache ────────────────────────────────────────────────────────────────────

let provincesCache: Province[] | null = null
let citiesCache: City[] | null = null
let districtsCache: District[] | null = null
let villagesCache: Village[] | null = null

// ─── Provinces ────────────────────────────────────────────────────────────────

export function getProvinces(): Province[] {
  if (!provincesCache) {
    provincesCache = readCSV<Province>("data/provinces.csv")
  }
  return provincesCache
}

export function getSortedProvincesByName(): Province[] {
  return [...getProvinces()].sort((a, b) =>
    a.name.toLowerCase().localeCompare(b.name.toLowerCase(), "id")
  )
}

export function getProvinceByCode(code: string): Province | undefined {
  return getProvinces().find((p) => p.code === code)
}

// ─── Cities ───────────────────────────────────────────────────────────────────

export function getCities(): City[] {
  if (!citiesCache) {
    citiesCache = readCSV<City>("data/cities.csv")
  }
  return citiesCache
}

export function getCitiesByProvinceCode(province_code: string): City[] {
  return getCities().filter((c) => c.province_code === province_code)
}

export function getCityByCode(code: string): City | undefined {
  return getCities().find((c) => c.code === code)
}

// ─── Districts ────────────────────────────────────────────────────────────────

export function getDistricts(): District[] {
  if (!districtsCache) {
    districtsCache = readCSV<District>("data/districts.csv")
  }
  return districtsCache
}

export function getDistrictsByCityCode(city_code: string): District[] {
  return getDistricts().filter((d) => d.city_code === city_code)
}

export function getDistrictByCode(code: string): District | undefined {
  return getDistricts().find((d) => d.code === code)
}

// ─── Villages ─────────────────────────────────────────────────────────────────

export function getVillages(): Village[] {
  if (!villagesCache) {
    villagesCache = readCSV<Village>("data/villages.csv")
  }
  return villagesCache
}

export function getVillagesByDistrictCode(district_code: string): Village[] {
  return getVillages().filter((v) => v.district_code === district_code)
}

export function getVillageByCode(code: string): Village | undefined {
  return getVillages().find((v) => v.code === code)
}
