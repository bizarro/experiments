#pragma glslify: curl = require(glsl-curl-noise)

uniform float time;

void main() {
    vec3 positionRadom = curl(position + time) * -10.0;
    vec4 positionMv = modelViewMatrix * vec4(positionRadom, 1.0);

    gl_PointSize = 2.5;
    gl_Position = projectionMatrix * positionMv;
}
