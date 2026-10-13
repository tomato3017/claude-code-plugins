# tomato-claude-mods

A Claude Code plugin marketplace. Each plugin is a mod (hooks module) in `plugins/<name>/`.

## Layout

- `.claude-plugin/marketplace.json`: the marketplace; one entry per plugin, `source: "./plugins/<name>"`.
- `plugins/<name>/`: one plugin: `.claude-plugin/plugin.json`, `hooks/`, `types/`, README, CHANGELOG.
- `LICENSE`: MIT, covers every plugin.

Adding a plugin: create `plugins/<name>/`, add an entry to `marketplace.json`, add a row to the root README.

## radio-multi (`plugins/radio-multi`)

`/radio-multi` opens a pane of radio stations; the chosen one opens in the default browser via an opener chain (`xdg-open`, `open`, `rundll32`). Stations can be added and deleted from the pane and persist in `$.store`.

- `hooks/register.tsx`: the whole mod: command registration, `command.run`, and the `ui.render` hook for the `Pane`.
- `types/index.d.ts`: `PluginState` contract for every `$.state` key the module uses.

## Rules of this API

- Helpers that receive `$` must be top-level function declarations, not closures inside `register`; `claude plugin validate` rejects `$` passed anywhere else.
- State a drawing reads lives in `$.state` (via `atom`/`read`/`update`), never in module variables. Persist across sessions with `$.store`.
- `Input` and `Select` don't exist on the `mobile` surface: narrow before using them.

## Checking changes

- `claude plugin validate .` (the marketplace) and `claude plugin validate plugins/<name>` (a plugin)
- `tsc -p plugins/<name>` (needs the engine-generated `.claude-plugin/types/` and `tsconfig.json`, present once the plugin has loaded; both gitignored)
- To try one live: `claude --plugin-dir plugins/<name>`, then `/radio-multi`.
