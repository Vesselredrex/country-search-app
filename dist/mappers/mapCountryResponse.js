export function mapCountryResponse(raw) {
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
