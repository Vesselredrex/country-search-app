export interface RawCountry {
  name: string;
  flag?: string;
  capital?: string;
  region?: string;
  subregion?: string;
  population?: number;
  area?: number;
  borders?: string[];
  languages?: { name: string }[];
  currencies?: { code?: string; name: string }[];
}

export interface Country {
  name: string;
  flag: string | null;
  capital: string | null;
  region: string | null;
  subregion: string | null;
  population: number | null;
  area: number | null;
  borders: string[];
  languages: string[];
  currencies: string[];
}

export function mapCountryResponse(raw: RawCountry): Country {
  return {
    name: raw.name,
    flag: raw.flag ?? null,
    capital: raw.capital ?? null,
    region: raw.region ?? null,
    subregion: raw.subregion ?? null,
    population: raw.population ?? null,
    area: raw.area ?? null,
    borders: [...(raw.borders ?? [])],
    languages: raw.languages?.map((language) => language.name) ?? [],
    currencies: raw.currencies?.map((currency) => currency.name) ?? [],
  };
}
