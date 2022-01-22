import { MySettings, MODULE_ID, MODULE_ABBREV } from './constants';
import { getGame } from './helpers';

export const registerSettings = function () {
  // Register any custom module settings here
  getGame().settings.register(MODULE_ID, MySettings.limitActionsToAtWills, {
    name: `${MODULE_ABBREV}.settings.limitActionsToAtWills.Label`,
    default: false,
    type: Boolean,
    scope: 'client',
    config: true,
    hint: `${MODULE_ABBREV}.settings.limitActionsToAtWills.Hint`,
  });

  getGame().settings.register(MODULE_ID, MySettings.includeOneMinutePowers, {
    name: `${MODULE_ABBREV}.settings.includeOneMinutePowers.Label`,
    default: true,
    type: Boolean,
    scope: 'client',
    config: true,
    hint: `${MODULE_ABBREV}.settings.includeOneMinutePowers.Hint`,
  });

  getGame().settings.register(MODULE_ID, MySettings.includePowersWithEffects, {
    name: `${MODULE_ABBREV}.settings.includePowersWithEffects.Label`,
    default: true,
    type: Boolean,
    scope: 'client',
    config: true,
    hint: `${MODULE_ABBREV}.settings.includePowersWithEffects.Hint`,
  });

  getGame().settings.register(MODULE_ID, MySettings.includeConsumables, {
    name: `${MODULE_ABBREV}.settings.includeConsumables.Label`,
    default: true,
    type: Boolean,
    scope: 'client',
    config: true,
    hint: `${MODULE_ABBREV}.settings.includeConsumables.Hint`,
  });

  getGame().settings.register(MODULE_ID, MySettings.injectCharacters, {
    name: `${MODULE_ABBREV}.settings.injectCharacters.Label`,
    default: true,
    type: Boolean,
    scope: 'client',
    config: true,
    hint: `${MODULE_ABBREV}.settings.injectCharacters.Hint`,
  });

  getGame().settings.register(MODULE_ID, MySettings.injectNPCs, {
    name: `${MODULE_ABBREV}.settings.injectNPCs.Label`,
    default: true,
    type: Boolean,
    scope: 'world',
    config: true,
    hint: `${MODULE_ABBREV}.settings.injectNPCs.Hint`,
  });

  getGame().settings.register(MODULE_ID, MySettings.injectVehicles, {
    name: `${MODULE_ABBREV}.settings.injectVehicles.Label`,
    default: true,
    type: Boolean,
    scope: 'world',
    config: true,
    hint: `${MODULE_ABBREV}.settings.injectVehicles.Hint`,
  });
};
