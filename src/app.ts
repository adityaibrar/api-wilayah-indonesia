import { Elysia, t } from "elysia";
import { cors } from "@elysiajs/cors";
import { node } from "@elysiajs/node";
import {
  getProvinces,
  getSortedProvincesByName,
  getCities,
  getCitiesByProvinceCode,
  getDistricts,
  getDistrictsByCityCode,
  getVillages,
  getVillagesByDistrictCode,
} from "./lib/data.js";

const isNode =
  typeof process !== "undefined" &&
  process.versions != null &&
  process.versions.node != null;

export const app = new Elysia({ adapter: isNode ? node() : undefined })
  .use(cors())
  .onError(({ code, error }) => {
    return {
      status: false,
      code,
      message: (error as Error).message || "Unknown error",
      stack: (error as Error).stack,
    };
  })
  .group("/api", (app) =>
    app
      // ─── Provinces ───────────────────────────────────────────────
      .get(
        "/provinces",
        ({ query: { sort } }) => {
          const data =
            sort === "name" ? getSortedProvincesByName() : getProvinces();
          return {
            status: true,
            status_code: 200,
            message: "Provinces retrieved successfully",
            total: data.length,
            data,
          };
        },
        {
          query: t.Object({
            sort: t.Optional(t.String()),
          }),
        }
      )

      // ─── Cities ──────────────────────────────────────────────────
      .get(
        "/cities",
        ({ query: { sort, province_code } }) => {
          let data = province_code
            ? getCitiesByProvinceCode(province_code)
            : getCities();
          if (sort === "name") {
            data = [...data].sort((a, b) =>
              a.name.localeCompare(b.name, "id")
            );
          }
          return {
            status: true,
            status_code: 200,
            message: "Cities retrieved successfully",
            total: data.length,
            data,
          };
        },
        {
          query: t.Object({
            sort: t.Optional(t.String()),
            province_code: t.Optional(t.String()),
          }),
        }
      )

      // ─── Districts ───────────────────────────────────────────────
      .get(
        "/districts",
        ({ query: { sort, city_code } }) => {
          let data = city_code
            ? getDistrictsByCityCode(city_code)
            : getDistricts();
          if (sort === "name") {
            data = [...data].sort((a, b) =>
              a.name.localeCompare(b.name, "id")
            );
          }
          return {
            status: true,
            status_code: 200,
            message: "Districts retrieved successfully",
            total: data.length,
            data,
          };
        },
        {
          query: t.Object({
            sort: t.Optional(t.String()),
            city_code: t.Optional(t.String()),
          }),
        }
      )

      // ─── Villages ────────────────────────────────────────────────
      .get(
        "/villages",
        ({ query: { sort, district_code } }) => {
          let data = district_code
            ? getVillagesByDistrictCode(district_code)
            : getVillages();
          if (sort === "name") {
            data = [...data].sort((a, b) =>
              a.name.localeCompare(b.name, "id")
            );
          }
          return {
            status: true,
            status_code: 200,
            message: "Villages retrieved successfully",
            total: data.length,
            data,
          };
        },
        {
          query: t.Object({
            sort: t.Optional(t.String()),
            district_code: t.Optional(t.String()),
          }),
        }
      )
  );
