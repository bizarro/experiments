export function constrain (n, low, high) {
  return Math.max(Math.min(n, high), low)
}

export function dist (x1, y1, z1, x2, y2, z2) {
  if (arguments.length === 4) {
    return Math.sqrt((z1 - x1) * (z1 - x1) + (x2 - y1) * (x2 - y1))
  } else if (arguments.length === 6) {
    return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1) + (z2 - z1) * (z2 - z1))
  }
}

export function lerp (start, stop, amt) {
  return amt * (stop - start) + start
}

export function mag (x, y) {
  return Math.sqrt(x * x + y * y)
}

export function map (n, start1, stop1, start2, stop2) {
  return ((n - start1) / (stop1 - start1)) * (stop2 - start2) + start2
}

export function max () {
  if (arguments[0] instanceof Array) {
    return Math.max.apply(null, arguments[0])
  } else {
    return Math.max.apply(null, arguments)
  }
}

export function min () {
  if (arguments[0] instanceof Array) {
    return Math.min.apply(null, arguments[0])
  } else {
    return Math.min.apply(null, arguments)
  }
}

export function norm (n, start, stop) {
  return this.map(n, start, stop, 0, 1)
}
