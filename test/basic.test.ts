import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils'

describe('basic', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/basic', import.meta.url)),
  })

  it('renders the unity canvas', async () => {
    const html = await $fetch('/')
    expect(html).toMatch(/provider-id=".*"/)
    expect(html).toMatch(/id="unity-container-.*"/)
    expect(html).toMatch(/id="unity-canvas-.*"/)
    expect(html).toContain('class="unity-container"')
    expect(html).toContain('class="unity-canvas"')
    expect(html).toContain('style="width:600px;height:600px;display:block;"')
    expect(html).toContain('<div class="unity-extra-content"></div>')
    expect(html).toMatch(/unityProviderId:".*"/)
  })
})
