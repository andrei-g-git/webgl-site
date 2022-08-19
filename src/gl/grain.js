export const setGrainUniforms = (time) => {
    return {
        time: time
    };
};


export const getGrainFrag = () => {
    return `
varying vec2 vTextureCoord;
uniform sampler2D uSampler;
//uniform sampler2D sourceTex;
uniform float time;

void main(){
    float aspectRatio = 480./854.;
	vec2 uv = vTextureCoord.xy;// / vec2(854., 480.);
    
    vec4 color = texture2D(uSampler, uv);

    float strength = 16.0;
    
    float x = (uv.x + 4.0 ) * (uv.y + 4.0 ) * (time * 10.0);
	vec4 grain = vec4(mod((mod(x, 13.0) + 1.0) * (mod(x, 123.0) + 1.0), 0.01)-0.005) * strength;
    
    // if(abs(uv.x - 0.5) < 0.002)
    //     color = vec4(0.0);
    
    // if(uv.x > 0.5)
    // {
    // 	grain = 1.0 - grain;
	// 	color *= grain;
    // }
    // else
    // {
	// 	color += grain;
    // } 
    
    grain = 1.0 - grain;
    color *= grain;

    gl_FragColor = color;
}

   
    `;
};