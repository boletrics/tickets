import { create } from "zustand";

export type Region =
	| "mexico-city"
	| "monterrey"
	| "guadalajara"
	| "cancun"
	| "all";

interface RegionStore {
	region: Region;
	setRegion: (region: Region) => void;
}

export const useRegionStore = create<RegionStore>((set) => ({
	region:
		((typeof window !== "undefined"
			? localStorage.getItem("region")
			: null) as Region) || "mexico-city",
	setRegion: (region) => {
		if (typeof window !== "undefined") {
			localStorage.setItem("region", region);
		}
		set({ region });
	},
}));

export const regionNames = {
	"mexico-city": { en: "Mexico City", es: "Ciudad de México" },
	monterrey: { en: "Monterrey", es: "Monterrey" },
	guadalajara: { en: "Guadalajara", es: "Guadalajara" },
	cancun: { en: "Cancún", es: "Cancún" },
	all: { en: "All Regions", es: "Todas las Regiones" },
};
