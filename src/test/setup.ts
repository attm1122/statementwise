import '@testing-library/jest-dom/vitest'

/* ── matchMedia mock ── */
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

/* ── IntersectionObserver mock ── */
class IntersectionObserverMock {
  callback: IntersectionObserverCallback
  elements: Element[] = []

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback
  }

  observe = vi.fn((element: Element) => {
    this.elements.push(element)
    this.callback(
      [
        {
          isIntersecting: true,
          intersectionRatio: 1,
          boundingClientRect: {} as DOMRectReadOnly,
          intersectionRect: {} as DOMRectReadOnly,
          rootBounds: null,
          target: element,
          time: Date.now(),
        },
      ],
      this as unknown as IntersectionObserver
    )
  })

  unobserve = vi.fn((element: Element) => {
    this.elements = this.elements.filter((el) => el !== element)
  })

  disconnect = vi.fn(() => {
    this.elements = []
  })

  takeRecords = vi.fn(() => [])

  root = null
  rootMargin = ''
  thresholds = []
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: IntersectionObserverMock,
})

/* ── ResizeObserver mock ── */
class ResizeObserverMock {
  callback: ResizeObserverCallback

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback
  }

  observe = vi.fn((target: Element) => {
    this.callback(
      [
        {
          target,
          contentRect: {} as DOMRectReadOnly,
          borderBoxSize: [],
          contentBoxSize: [],
          devicePixelContentBoxSize: [],
        } as unknown as ResizeObserverEntry,
      ],
      this
    )
  })

  unobserve = vi.fn()
  disconnect = vi.fn()
}

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  configurable: true,
  value: ResizeObserverMock,
})

/* ── window.scrollTo mock ── */
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: vi.fn(),
})

/* ── scrollIntoView mock ── */
Element.prototype.scrollIntoView = vi.fn()

/* ── navigator.clipboard mock ── */
Object.defineProperty(navigator, 'clipboard', {
  writable: true,
  configurable: true,
  value: {
    writeText: vi.fn().mockResolvedValue(undefined),
    readText: vi.fn().mockResolvedValue(''),
  },
})

/* ── canvas mock ── */
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  clearRect: vi.fn(),
  beginPath: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
  fillStyle: '',
  strokeStyle: '',
  lineWidth: 0,
})) as unknown as typeof HTMLCanvasElement.prototype.getContext

/* ── SVG getBoundingClientRect mock ── */
SVGSVGElement.prototype.getBoundingClientRect = vi.fn(() => ({
  width: 100,
  height: 100,
  top: 0,
  left: 0,
  right: 100,
  bottom: 100,
  x: 0,
  y: 0,
  toJSON: () => '{}',
})) as unknown as typeof SVGSVGElement.prototype.getBoundingClientRect
