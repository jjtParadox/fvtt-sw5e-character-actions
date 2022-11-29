# Character Actions sw5e

![Foundry Core Compatible Version](https://img.shields.io/badge/dynamic/json.svg?url=https%3A%2F%2Fraw.githubusercontent.com%2FjjtParadox%2Ffvtt-sw5e-character-actions%2Fmain%2Fsrc%2Fmodule.json&label=Foundry%20Version&query=$.compatibility.minimum&colorB=orange)
![Manifest+ Version](https://img.shields.io/badge/dynamic/json.svg?url=https%3A%2F%2Fraw.githubusercontent.com%2FjjtParadox%2Ffvtt-sw5e-character-actions%2Fmain%2Fsrc%2Fmodule.json&label=Manifest%2B%20Version&query=$.manifestPlusVersion&colorB=blue)

This is a modification of [ElfFriend's Character Actions 5e](https://github.com/ElfFriend-DnD/foundryvtt-dnd5eCharacterActions) to work with the SW5E system.

This module provides a placable reusable "component" which details all of the actions a given Character Actor can take, intending to replicate the list in the Actions Tab of a D&DBeyond character sheet. The module has two ways in which it can be used: it will either inject the actions tab itself, or another module can leverage the API it provides and use that to inject the proper HTML wherever it desires.

## List Features

By default the list will attempt to narrow down your active abilities, items, and powers into the ones most likely to be useful in Combat. The full logic for the filter is in `isItemInActionList` inside `src/modules/helpers.ts`. Here are the basics:

For Weapons:

- Is it equipped?

For Equipment:

- Does it have an activation cost (excluding anything that takes longer than a minute or none) and is it equipped?

For Consumables:

- If the "Include Consumables" setting is set, does it have an activation cost (excluding anything that takes longer than a minute or none)?

For Powers:

- If the power needs to be prepared but isn't, exclude it.
- Does it do damage (or healing)?
- Does it have an activation cost of 1 reaction or 1 bonus action?
- If the "Include Minute-long Powers" setting is set, does it have a duration of up to 1 minute (1 round - 1 minute)?
- If the "Include Powers With Effects" setting is set, does the power have any active effects?

For Features:

- Does it have an activation cost (excluding anything that takes longer than a minute or none)?

Additionally, you can override the default list by selectively including or excluding items by toggling the little Fist in item controls.

## Installation

Module JSON:

```
https://github.com/jjtParadox/fvtt-sw5e-character-actions/releases/latest/download/module.json
```

## Options

| **Name**                                          | Description                                                                                                                                                                                          |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Limit Actions to At-Wills**                     | Instead of showing all powers that deal damage in the Actions list, limit it to only at-wills. This is equivalent to the default D&DBeyond behavior.                                                               |
| **Include Minute-long Powers as Actions**         | Include powers with a duration of one minute or less (e.g. 1 round) and an activation time of 1 Action or 1 Bonus Action in the Actions tab/panel by default.            |
| **Include Powers with Active Effects as Actions** | Include powers with active effects attached in the Actions tab/panel by default.                                                                                                     |
| **Include Consumables as Actions**                | Include consumables which have an activation cost (Action, Bonus Action, etc) in the Actions list by default.                                                                                        |
| **Inject Character Actions List**                 | Should this module inject an Actions List into the default character sheet? Note that if you are using a sheet module which integrates the actions list on its own, this will not affect that sheet. |
| **Inject NPC Actions List**                       | Should this module inject an Actions List into the default npc sheet? Note that if you are using a sheet module which integrates the actions list on its own, this will not affect that sheet.       |
| **Inject Vehicle Actions List**                   | Should this module inject an Actions List into the default vehicle sheet? Note that if you are using a sheet module which integrates the actions list on its own, this will not affect that sheet.   |

## API

After the hook `CharacterActions5eReady` is fired, the following api methods are expected to be available in the `game.modules` entry for this module: `game.modules.get('character-actions-list-sw5e').api`:

### `async renderActionsList(actorData: Actor5eCharacter, appId: number): HTMLElement`

Returns the output of `renderTemplate` (an `HTMLElement`) after getting the provided actor's action data. This can then be injected wherever in your own DOM.

### Example

```ts

class MyCoolCharacterSheet extends ActorSheet5e {

  // other stuff your sheet module does...

  async _renderInner(...args) {
    const html = await super._renderInner(...args);
    const actionsListApi = game.modules.get('character-actions-list-sw5e').api;

    try {
      const actionsTab = html.find('.actions');

      const actionsTabHtml = $(await actionsListApi.renderActionsList(this.actor));
      actionsTab.html(actionsTabHtml);
    } catch (e) {
      log(true, e);
    }

    return html;
  }
}
```

### `isItemInActionList(item: Item5e): boolean`

A handlebars helper is provided as well in case any sheet wants an easy way to check if an Item being rendered is expected to be part of the Actions List. `CAL5E-isItemInActionList` is a simple wrapper around `isItemInActionList`, it expects the same argument of an `item` instance.

#### Example

```ts

class MyCoolItemSheet extends ItemSheet5e {

  // other stuff your sheet module does...

  getData() {
    // const data = { someOtherStuff };
    const actionsListApi = game.modules.get('character-actions-list-sw5e').api;

    try {
      data.isInActionList = actionsListApi.isItemInActionList(this.item);
    } catch (e) {
      log(true, e);
    }

    return data;
  }
}
```

### `getActorActionsData(actor: Actor5e): ActorActionsList`

```ts
type ActorActionsList = Record<
  'action' | 'bonus' | 'crew' | 'lair' | 'legendary' | 'reaction' | 'other',
  Set<Partial<Item5e>>
>
```

When passed an actor, returns the actor's 'actions list' items organized by activation type. I'm not sure why but it seems some of the information is missing from the Item5e in this list, be wary of that if you are looking to use this in another module.

### Handlebars Helper: `CAL5E-isItemInActionList`

A handlebars helper is provided as well in case any sheet wants an easy way to check if an Item being rendered is expected to be part of the Actions List. `CAL5E-isItemInActionList` is a simple wrapper around `isItemInActionList`, it expects the same argument of an `item` instance.

#### Example

```hbs
{{#each items as |item|}}
  {{!-- other stuff --}}
  {{#if (CAL5E-isItemInActionList item)}}Action{{/if}}
{{/each}}
```

### Blocking the default Injection

If a sheet module wants to specifically block the injection of the actions tab without implementing the actions list itself, add `blockActionsTab` to the options being passed to the FormApplication class.

Note that by default, the actions tab will only inject itself if no DOM element with the class `.character-actions-sw5e` exists in the Application being rendered.

#### Example

```js
// class SomeAwesomeSheet extends SomeActorSheetClass {
  // ...
  // get defaultOptions() {
    // return mergeObject(super.defaultOptions, {
      blockActionsTab: true,
    // ...
```

This will cause the Actions Tab's auto injection to stop before any DOM is injected.

## Acknowledgements

This wouldn't be possible without [ElfFriend's Character Actions 5e](https://github.com/ElfFriend-DnD/foundryvtt-dnd5eCharacterActions). Buy them a coke if you run into them!
