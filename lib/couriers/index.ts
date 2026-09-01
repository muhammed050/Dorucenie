import { registerCourier } from "./registry";
import { dhlAdapter } from "./dhl";
import { dpdAdapter } from "./dpd";

registerCourier(dhlAdapter);
registerCourier(dpdAdapter);

export * from "./types";
export * from "./registry";
