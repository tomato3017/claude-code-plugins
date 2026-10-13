# radio-multi

A [Claude Code](https://claude.com/claude-code) mod. `/radio-multi` opens a pane of radio stations; pick one and it opens in your default browser.

## Install

```
/plugin install radio-multi --marketplace tomato3017/tomato-claude-mods
```

Answer `y` to add the marketplace, then choose a scope.

## Usage

Run `/radio-multi`.

- Press a station's button, or its number key (1-9), to open it in your browser and close the pane.
- **delete** removes a station.
- Fill in **Name** and **URL** and press **Add** to add one. A URL without a scheme gets `https://`. Duplicate URLs are rejected.
- `Esc` closes the pane.

Stations are saved across sessions. Defaults: SomaFM Groove Salad, Radio Paradise, NTS Radio.

## Requirements

A browser opener on the machine running Claude Code: `xdg-open` (Linux), `open` (macOS) or `rundll32` (Windows). If none works, the pane shows an error. Adding stations needs a surface with a text input, so it isn't offered on the mobile surface.

## Development

```
claude plugin validate .
claude --plugin-dir .      # then /radio-multi
tsc -p .                   # needs .claude-plugin/types/, generated once the plugin has loaded
```

## License

MIT
