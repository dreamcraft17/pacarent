import raw from './jabodetabek-cities.json';
import type { FilterOption } from '../components/FilterMenu';

export type JabodetabekCity = { id: string; name: string };

export const jabodetabekRegion = raw.region as string;
export const jabodetabekCities: JabodetabekCity[] = raw.cities;

export function jabodetabekFilterOptions(allLabel = 'Semua kota'): FilterOption[] {
  return [
    { value: '', label: allLabel },
    ...jabodetabekCities.map((c) => ({ value: c.name, label: c.name })),
  ];
}

export function jabodetabekRegisterOptions(): FilterOption[] {
  return jabodetabekCities.map((c) => ({ value: c.name, label: c.name }));
}
