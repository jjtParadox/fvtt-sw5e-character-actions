import { registerSettings } from './settings';
import { MODULE_ABBREV, MODULE_ID, MySettings, TEMPLATES } from './constants';
import { getGame, isItemInActionList, log } from './helpers';
import { getActorActionsData } from './getActorActionsData';
import { addFavoriteControls } from './handleFavoriteControls';

Handlebars.registerHelper(`${MODULE_ABBREV}-isEmpty`, (input: Object | Array<any> | Set<any>) => {
  if (input instanceof Array) {
    return input.length < 1;
  }
  if (input instanceof Set) {
    return input.size < 1;
  }
  return isObjectEmpty(input);
});

Handlebars.registerHelper(`${MODULE_ABBREV}-isItemInActionList`, isItemInActionList);

Handlebars.registerHelper(`${MODULE_ABBREV}-isLocalized`, (input: string) => {
  return !input.startsWith('SW5E.');
});

/**
 * Add the Actions Tab to Sheet HTML. Returns early if the character-actions-sw5e element already exists
 */
async function addActionsTab(
  app: ActorSheet5e,
  html,
  data: ReturnType<ActorSheet5e['getData']> extends Promise<infer T> ? T : ReturnType<ActorSheet5e['getData']>,
) {
  if (data instanceof Promise) {
    log(true, 'data was unexpectedly a Promise, you might be using an unsupported sheet');
    return;
  }

  const existingActionsList = $(html).find('.character-actions-sw5e');

  // check if what is rendering this is an Application and if our Actions List exists within it already
  if ((!!app.appId && !!existingActionsList.length) || app.options.blockActionsTab) {
    return;
  }

  // Update the nav menu
  const actionsTabButton = $(
    '<button class="item" data-tab="actions">' + getGame().i18n.localize(`SW5E.ActionPl`) + '</button>',
  );
  const tabs = html.find('.root-tabs[data-group="primary"]');
  tabs.prepend(actionsTabButton);

  // Create the tab
  const sheetBody = html.find('.sheet-body');
  const actionsTab = $(`<section class="tab actions flexcol" data-group="primary" data-tab="actions"></section>`);
  sheetBody.prepend(actionsTab);

  // add the list to the tab
  const actionsTabHtml = $(await renderActionsList(app.actor));
  actionsTab.append(actionsTabHtml);

  // @ts-ignore
  actionsTabHtml.find('.item .item-name.rollable h4').click((event) => app._onItemSummary(event));

  // owner only listeners
  if (data.owner) {
    // @ts-ignore
    actionsTabHtml.find('.item .item-image').click((event) => app._onItemRoll(event));
    // @ts-ignore
    actionsTabHtml.find('.item .item-recharge').click((event) => app._onItemRecharge(event));
  } else {
    actionsTabHtml.find('.rollable').each((i, el) => el.classList.remove('rollable'));
  }
}

async function renderActionsList(
  actorData: Actor5e,
  options?: {
    rollIcon?: string;
  },
) {
  const actionData = getActorActionsData(actorData);

  log(false, 'renderActionsList', {
    actorData,
    data: actionData,
  });

  return renderTemplate(`modules/${MODULE_ID}/templates/actor-actions-list.hbs`, {
    actionData,
    // @ts-ignore
    abilities: getGame().sw5e.config.abilityAbbreviations,
    activationTypes: {
      // @ts-ignore
      ...getGame().sw5e.config.abilityActivationTypes,
      other: getGame().i18n.localize(`SW5E.ActionOther`),
    },
    // @ts-ignore
    damageTypes: getGame().sw5e.config.damageTypes,
    rollIcon: options?.rollIcon,
    isOwner: actorData.isOwner,
  });
}

/* ------------------------------------ */
/* Initialize module					*/
/* ------------------------------------ */
Hooks.once('init', async function () {
  log(true, `Initializing ${MODULE_ID}`);

  // Register custom module settings
  registerSettings();

  // Preload Handlebars templates
  await loadTemplates(Object.values(flattenObject(TEMPLATES)));

  const characterActionsModuleData = getGame().modules.get(MODULE_ID);

  if (characterActionsModuleData) {
    characterActionsModuleData.api = {
      getActorActionsData,
      isItemInActionList,
      renderActionsList,
    };
  }

  globalThis[MODULE_ABBREV] = {
    renderActionsList: async function (...args) {
      log(false, {
        api: characterActionsModuleData?.api,
      });

      console.warn(
        MODULE_ID,
        '|',
        'accessing the module api on globalThis is deprecated and will be removed in a future update, check if there is an update to your sheet module',
      );
      return characterActionsModuleData?.api?.renderActionsList(...args);
    },
    isItemInActionList: function (...args) {
      console.warn(
        MODULE_ID,
        '|',
        'accessing the module api on globalThis is deprecated and will be removed in a future update, check if there is an update to your sheet module',
      );
      return characterActionsModuleData?.api?.isItemInActionList(...args);
    },
  };

  Hooks.call(`CharacterActions5eReady`, characterActionsModuleData?.api);
});

// default sheet injection if this hasn't yet been injected
Hooks.on('renderActorSheet5e', async (app, html, data) => {
  // short circut if the user has overwritten these settings
  switch (app.actor.type) {
    case 'npc':
      const injectNPCSheet = getGame().settings.get(MODULE_ID, MySettings.injectNPCs) as boolean;
      if (!injectNPCSheet) return;
    case 'vehicle':
      const injectVehicleSheet = getGame().settings.get(MODULE_ID, MySettings.injectVehicles) as boolean;
      if (!injectVehicleSheet) return;
    case 'character':
      const injectCharacterSheet = getGame().settings.get(MODULE_ID, MySettings.injectCharacters) as boolean;
      if (!injectCharacterSheet) return;
  }

  log(false, 'default sheet open hook firing', {
    app,
    html,
    data,
  });

  const actionsList = $(html).find('.character-actions-sw5e');

  log(false, 'actionsListExists', { actionsListExists: actionsList.length });

  if (!actionsList.length) {
    await addActionsTab(app, html, data);
  }

  addFavoriteControls(app, html);
});

Hooks.once('devModeReady', ({ registerPackageDebugFlag }) => {
  registerPackageDebugFlag(MODULE_ID);
});
