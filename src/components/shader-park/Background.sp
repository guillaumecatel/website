setMaxIterations(1)

displace(mouse.x * -0.2, mouse.y * -0.2, 0)

let s = getSpace()
let r = getRayDirection()
let n1 = noise(r * 1 + vec3(0, 0.3, time * 0.1))
let n = noise(s + vec3(0, 0, time * 0.1) + n1)

metal(n * 0.1 + 0.1)
shine(n * 0.5 + 0.5)

// color(normal * 0.08 + vec3(0.0, 0.9, 0.4))
// color(normal * 0.08 + vec3(1.2, 0.0, 0.0))
color(normal * 0.08 + vec3(1.2, 0.09, 0.06))
//color(normal * 0.08 + vec3(0.0, 0.08, 30.0))

boxFrame(vec3(0), 0.1)
mixGeo(0)
sphere(n * 0.1)
