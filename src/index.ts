import { Elysia, t } from "elysia";
import { cors } from "@elysiajs/cors";
import { staticPlugin } from "@elysiajs/static";
import {
  getProvinces,
  getSortedProvincesByName,
  getCities,
  getCitiesByProvinceId,
  getDistricts,
  getDistrictsByCityId,
  getVillages,
  getVillagesByDistrictId,
} from "./lib/data";

const app = new Elysia()
  .use(cors())
  // Melayani file statis hasil build dari Svelte SPA di folder public
  .use(staticPlugin({ assets: "public", prefix: "/" }))
  // Fallback ke index.html untuk Svelte SPA routing (misal jika ada halaman /docs)
  .get("/", () => Bun.file("public/index.html"))
  
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
  )
  .listen(3000);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
