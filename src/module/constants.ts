export const MODULE_ID = 'character-actions-list-sw5e';
export const MODULE_ABBREV = 'CAL5E';

export enum MySettings {
  includeConsumables = 'include-consumables',
  includeOneMinutePowers = 'include-one-minute-powers',
  includePowersWithEffects = 'include-powers-with-effects',
  injectCharacters = 'inject-characters',
  injectNPCs = 'inject-npcs',
  injectVehicles = 'inject-vehicles',
  limitActionsToAtWills = 'limit-actions-to-at-wills',
}

export enum MyFlags {
  filterOverride = 'filter-override',
}

export const TEMPLATES = {
  actionList: `modules/${MODULE_ID}/templates/actor-actions-list.hbs`,
};
