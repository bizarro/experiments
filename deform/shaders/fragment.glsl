//
// Tiling Caustic.
// http://shaderfrog.com/app/view/329
//
#define TAU 6.28318530718
#define MAX_ITER 5

precision highp float;
precision highp int;

uniform vec2 u_resolution;
uniform vec3 u_background;
uniform vec3 u_color;
uniform float u_speed;
uniform float u_brightness;
uniform float u_time;

varying vec2 vUv;

void main() {
  vec2 uv = vUv * u_resolution;

  vec2 p = mod(uv * TAU, TAU) - 250.0;
  vec2 i = vec2(p);

  float c = 1.0;
  float inten = 0.005;

  for (int n = 0; n < MAX_ITER; n++)  {
    float t = u_time * u_speed * (1.0 - (3.5 / float(n + 1)));
    i = p + vec2(cos(t - i.x) + sin(t + i.y), sin(t - i.y) + cos(t + i.x));
    c += 1.0 / length(vec2(p.x / (sin(i.x + t) / inten), p.y / (cos(i.y + t) / inten)));
  }

  c /= float(MAX_ITER);
  c = 1.17 - pow(c, u_brightness);

  vec3 rgb = vec3(pow(abs(c), 8.0));

  gl_FragColor = vec4( rgb * u_color + u_background, 1.0 );
}
