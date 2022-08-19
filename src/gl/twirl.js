export const setTwirlUniforms = (tex, mousePos, circleRad, power, aspectRatio) => {
    return {
        sourceTex: tex,
        point: mousePos,
        radius: circleRad,
        power: power,
        aspectRatio: aspectRatio
    }
}

export const getTwirlFrag = () => {
    return`
varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform sampler2D sourceTex;
uniform vec2 point;
uniform float radius;    
//uniform vec2 resolution;
uniform float aspectRatio;
uniform float power;

float uvDistFromPoint(vec2 uv){
    vec2 relative = uv - point;

    float pointDist = length(relative);
    return pointDist;
}

vec2 finalFunction(float radius, float angle, vec2 point){
    return vec2(radius * cos(angle), radius * sin(angle));
}

float getRatio(float initialRatio, float power){
    float powered = pow(initialRatio, power);
    return clamp(powered, 0., 1.);
}

void main(){
    vec2 uv = vTextureCoord;

    float dist = uvDistFromPoint(uv);

    float blendRatio = dist/radius; 
    if(dist == 0.) blendRatio = 0.;

    float alpha = getRatio(blendRatio, power);//6.0);

    float effectAngle = 2. * 3.14 * alpha;


    float angle = atan(uv.y, uv.x) + effectAngle * smoothstep(radius, 0., dist);
    float newRadius = length(uv);

    vec2 result = finalFunction(newRadius, angle, point);

    // vec4 col = texture2D(uSampler, result);
    // vec4 src = texture2D(sourceTex, result); 
    
    vec4 col = texture2D(sourceTex, result);
    vec4 src = texture2D(uSampler, result); 

    alpha = getRatio(blendRatio, 2.0);

    gl_FragColor = mix(col, src, alpha);
}
    `;    
}