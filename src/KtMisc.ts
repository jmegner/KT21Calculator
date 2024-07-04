import { range } from "lodash";

export const MaxWounds = 24;
export const WoundRange = range(1, MaxWounds + 1);
export const SaveRange = range(2, 7);
export const MinCritDmgAfterDurable = 3; // not including crit dmg that starts lower than this