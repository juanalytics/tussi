// Easing functions
export const easeOutQuad = (t: number): number => t * (2 - t)
export const easeInOutQuad = (t: number): number => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t)
export const easeOutCubic = (t: number): number => --t * t * t + 1

// Linear interpolation
export const lerp = (start: number, end: number, t: number): number => {
  return start * (1 - t) + end * t
}

// Clamp a value between min and max
export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max)
}

// Map a value from one range to another
export const map = (value: number, inMin: number, inMax: number, outMin: number, outMax: number): number => {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin
}

// Generate a random number between min and max
export const random = (min: number, max: number): number => {
  return Math.random() * (max - min) + min
}

// Generate a random integer between min and max (inclusive)
export const randomInt = (min: number, max: number): number => {
  return Math.floor(random(min, max + 1))
}

// Generate a random color in hex format
export const randomColor = (): string => {
  return `#${Math.floor(Math.random() * 16777215)
    .toString(16)
    .padStart(6, "0")}`
}
