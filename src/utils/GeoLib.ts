import axios from "axios";

import { GEOCODING_API_KEY } from "../env.js";

const api = axios.create({
  baseURL: "https://geocode.maps.co",
});

type GeoCodeReverseResponse = {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  lat: string;
  lon: string;
  display_name: string;
  address: {
    road: string;
    suburb: string;
    city: string;
    municipality: string;
    region: string;
    state: string;
    "ISO3166-2-lvl4": string;
    postcode: string;
    country: string;
    country_code: string;
  };
  boundingbox: string[];
};

export async function getAddressFromCoordinates(
  coordinates: [number, number] | { lat: number; lng: number },
): Promise<string> {
  let lat, lng;

  if (Array.isArray(coordinates)) {
    [lat, lng] = coordinates;
  } else {
    ({ lat, lng } = coordinates);
  }

  const { data } = await api.get<GeoCodeReverseResponse>(
    `/reverse?lat=${lat}&lon=${lng}&api_key=${GEOCODING_API_KEY}`,
  );

  return data.display_name;
}

type GeoCodeSearchResponse = {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  boundingbox: string[];
  lat: string;
  lon: string;
  display_name: string;
  class: string;
  type: string;
  importance: number;
};

export async function getCoordinatesFromAddress(
  address: string,
): Promise<{ lat: number; lng: number }> {
  const {
    data: [resultMatch],
  } = await api.get<GeoCodeSearchResponse[]>(
    `/search?q=${address}&api_key=${GEOCODING_API_KEY}`,
  );

  return (
    resultMatch && {
      lat: +resultMatch.lat,
      lng: +resultMatch.lon,
    }
  );
}

export * as GeoLib from "./GeoLib.js";
