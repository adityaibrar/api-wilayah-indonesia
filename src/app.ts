import { Elysia, t } from "elysia";
import { cors } from "@elysiajs/cors";
import { node } from "@elysiajs/node";
import {
  getProvinces,
  getSortedProvincesByName,
  getCities,
  getCitiesByProvinceId,
  getDistricts,
  getDistrictsByCityId,
  getVillages,
  getVillagesByDistrictId,
} from "./lib/data.js";

const isNode = typeof process !== "undefined" && process.versions != null && process.versions.node != null;

export const app = new Elysia({ adapter: isNode ? node() : undefined })
  .use(cors())
  .onError(({ code, error }) => {
    return {
      status: false,
      code,
      message: (error as Error).message || "Unknown error",
      stack: (error as Error).stack
    };
  })
  .group("/api", (app) =>
    app
      .get(
        "/provinces",
        ({ query: { sort } }) => {
          const data = sort === "name" ? getSortedProvincesByName() : getProvinces();
          return {
            status: true,
            statusCode: 200,
            message: "Provinces retrieved successfully",
            data,
          };
        },
        {
          query: t.Object({
            sort: t.Optional(t.String()),
          }),
        }
      )
      .get(
        "/cities",
        ({ query: { sort, provinceId } }) => {
          let data = provinceId ? getCitiesByProvinceId(provinceId) : getCities();
          if (sort === "name") {
             data = [...data].sort((a, b) => a.name.localeCompare(b.name, 'id'));
          }
          return {
            status: true,
            statusCode: 200,
            message: "Cities retrieved successfully",
            data,
          };
        },
        {
          query: t.Object({
            sort: t.Optional(t.String()),
            provinceId: t.Optional(t.String()),
          }),
        }
      )
      .get(
        "/districts",
        ({ query: { sort, cityId } }) => {
          let data = cityId ? getDistrictsByCityId(cityId) : getDistricts();
          if (sort === "name") {
             data = [...data].sort((a, b) => a.name.localeCompare(b.name, 'id'));
          }
          return {
            status: true,
            statusCode: 200,
            message: "Districts retrieved successfully",
            data,
          };
        },
        {
          query: t.Object({
            sort: t.Optional(t.String()),
            cityId: t.Optional(t.String()),
          }),
        }
      )
      .get(
        "/villages",
        ({ query: { sort, districtId } }) => {
          let data = districtId ? getVillagesByDistrictId(districtId) : getVillages();
          if (sort === "name") {
             data = [...data].sort((a, b) => a.name.localeCompare(b.name, 'id'));
          }
          return {
            status: true,
            statusCode: 200,
            message: "Villages retrieved successfully",
            data,
          };
        },
        {
          query: t.Object({
            sort: t.Optional(t.String()),
            districtId: t.Optional(t.String()),
          }),
        }
      )
  );
