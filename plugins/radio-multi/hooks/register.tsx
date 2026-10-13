import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Station } from '../types'

const PANE = 'radio-multi'
const STORE_KEY = 'stations'

const DEFAULTS: Station[] = [
  { name: 'SomaFM Groove Salad', url: 'https://somafm.com/groovesalad/' },
  { name: 'Radio Paradise', url: 'https://radioparadise.com/' },
  { name: 'NTS Radio', url: 'https://www.nts.live/' },
]

const stations = atom({ plugin: 'radio-multi', key: 'stations' } as const, DEFAULTS)
const name = atom({ plugin: 'radio-multi', key: 'name' } as const, '')
const url = atom({ plugin: 'radio-multi', key: 'url' } as const, '')
const error = atom({ plugin: 'radio-multi', key: 'error' } as const, '')

// Openers by platform: Linux, macOS, Windows. None goes through a shell. The first
// that starts and exits 0 wins; one that cannot start or fails hands over to the next.
const OPENERS: string[][] = [['xdg-open'], ['open'], ['rundll32', 'url.dll,FileProtocolHandler']]

async function openUrl($: EngineInterface, target: string): Promise<boolean> {
  for (const argv of OPENERS) {
    try {
      const { exitCode } = await $.process.run([...argv, target])
      if (exitCode === 0) return true
    } catch {
      // opener not installed; try the next
    }
  }
  return false
}

// Stations live in $.store so they survive across sessions.
async function load($: EngineInterface) {
  const saved = await $.store.get(STORE_KEY)
  if (Array.isArray(saved)) await update($, stations, () => saved as Station[])
}

async function save($: EngineInterface, list: Station[]) {
  await update($, stations, () => list)
  await $.store.set(STORE_KEY, list)
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'radio-multi',
      description: 'Pick, add or delete radio stations; opens the pick in your browser',
    })
    await load($)

    return next(e)
  })

  on('command.run', { command: 'radio-multi' }, async $ => {
    await load($)
    await update($, error, () => '')
    await $.ui.open({ id: PANE, title: 'Radio', focus: true, closeOnEscape: true })

    return { text: 'Radio menu opened.' }
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const els = $.ui.resolve(e)
    const { Box, Button, Text } = els
    const list = await read($, stations)
    const draftName = await read($, name)
    const draftUrl = await read($, url)
    const message = await read($, error)

    const add = async () => {
      const n = (await read($, name)).trim()
      let u = (await read($, url)).trim()
      if (!n || !u) return update($, error, () => 'Name and URL are both required.')
      if (!/^https?:\/\//i.test(u)) u = `https://${u}`
      if (!/^https?:\/\/[^\s/?#]+(?:[/?#]\S*)?$/i.test(u)) {
        return update($, error, () => 'That is not a valid http(s) URL.')
      }
      const existing = await read($, stations)
      if (existing.some(s => s.url.toLowerCase() === u.toLowerCase())) {
        return update($, error, () => 'That URL is already in the list.')
      }
      await save($, [...existing, { name: n, url: u }])
      await update($, name, () => '')
      await update($, url, () => '')
      await update($, error, () => '')
    }

    // The mobile surface draws no Input, so adding is offered where it does.
    const Input = 'Input' in els ? els.Input : undefined
    const form =
      Input ? (
        <Box flexDirection="column">
          <Text bold>Add a station</Text>
          <Input
            key="name"
            label="Name"
            placeholder="My station"
            value={draftName}
            onInput={v => update($, name, () => v)}
            onSubmit={add}
          />
          <Input
            key="url"
            label="URL "
            placeholder="https://..."
            value={draftUrl}
            submitLabel="add"
            onInput={v => update($, url, () => v)}
            onSubmit={add}
          />
        </Box>
      ) : (
        <Text dimColor>Adding stations needs a text field this surface lacks.</Text>
      )

    return (
      <Box flexDirection="column">
        {list.length === 0 && <Text dimColor>No stations. Add one below.</Text>}
        {list.map((s, i) => (
          <Box key={`row-${i}`}>
            <Button
              key={`open-${i}`}
              label={s.name}
              hotkey={i < 9 ? String(i + 1) : undefined}
              onPress={async () => {
                if (await openUrl($, s.url)) {
                  await update($, error, () => '')
                  await $.ui.close({ id: PANE })
                } else {
                  await update($, error, () => `Could not open ${s.url} in a browser.`)
                }
              }}
            />
            <Text> </Text>
            <Button
              key={`del-${i}`}
              label="delete"
              onPress={async () =>
                save($, (await read($, stations)).filter((_, j) => j !== i))
              }
            />
          </Box>
        ))}
        <Text> </Text>
        {form}
        <Button key="add" label="Add" onPress={add} />
        {message !== '' && <Text color="red">{message}</Text>}
      </Box>
    )
  })
}
