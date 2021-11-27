#define PI 3.141592653589
uniform float uTime;
uniform float random;
uniform float playhead;
uniform float offset;
uniform vec3 color;
varying vec2 vUv;

float qinticOut(float t) {
    return 1.0 - (pow(t - 1.0, 5.0));
}

void main() {
    float alpha = 1.0 - step(0.5, length(gl_PointCoord - vec2(0.5)));
    float localProgress = mod(uTime* playhead*2.0 + offset*2.0, 2.0);
//    localProgress = qinticOut(localProgress/2.0);
    if (vUv.x > localProgress || vUv.x + 1.0 < localProgress) discard;

    gl_FragColor = vec4(color, 1.0);
}