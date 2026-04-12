// Import mutators/orchestrators to register them with satcheljs dispatcher
import "@/stores/market/marketMutators";
import "@/stores/market/marketOrchestrators";
import "@/stores/settings/settingsMutators";
import "@/stores/settings/settingsOrchestrators";

export { getMarketStore } from "./market/marketStore";
export { getSettingsStore } from "./settings/settingsStore";
