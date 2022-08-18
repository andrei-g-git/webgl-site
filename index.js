
document.addEventListener( 'DOMContentLoaded', init );

function init(){
    const canvasElement = document.getElementById("canvas");

    const app = new PIXI.Application({width: 720, height: 480, view: canvasElement});
    document.body.appendChild(app.view);

    const destination = makeVideoSprite(/* "video-5.mp4" */"video-2.mp4", app);
    const source = makeVideoSprite(/* "video-2.mp4" */"video-5.mp4", app);


    const point = new PIXI.Point(0, 0);
    getMousePos(app.view, point);

    const shader = new PIXI.Filter(getVert(), getFrag(), getUniforms(source.texture, point, 0.2, -3.0, 480/854)); 
    const grainFilter = new PIXI.Filter(
        getVert(), 
        getGrainFrag(), 
        {
            time: 1.0
        }
    );

    // //
    // source.filters = [
    //     grainFilter
    // ];

    //
    destination.filters = [
        grainFilter,        
        shader,

        // new PIXI.filters.OldFilmFilter({
        //     sepia: 0.0,
        //     noise: 0.08,
        //     noiseSize: 1.0,
        //     scratch: 0.0,
        //     scratchDensity: 0.0, 
        //     scratchWidth: 0.0,
        //     vignetting: 0.4,
        //     vignettingAlpha: 0.5,
        //     vignettingBlur: 0.3
        // }, 
        //     123
        // )
    ];

    setInterval(() => {
        destination.filters[0].uniforms.time = new Date().getMilliseconds();//Math.random();
        //source.filters[0].uniforms.time = new Date().getMilliseconds();
        //destination.filters[0].uniforms.sourceTex = source.texture;
        app.stage.removeChildAt(0);
        app.stage.addChildAt(destination, 0);
    }, 
        50
    );


    app.stage.addChild(destination);   

    document.body.appendChild(makeButton("+", +0.3, shader.uniforms));
    document.body.appendChild(makeButton("-", -0.3, shader.uniforms));
}


const handleClick = (increment, uniforms) =>{
    console.log("clicked");
    uniforms.distortion = Math.min(Math.max(uniforms.distortion + increment, -3.0), 3.0);
    console.log(uniforms.distortion);
    
    
}

const makeVideoSprite = (video, app) => {
    const videoElement = document.createElement("video"); 
    videoElement.id = "video-1";
    videoElement.src = video;
    videoElement.autoplay = true;//false; //browser security shit
    videoElement.muted = true;
    videoElement.loop = true;

    const videoTexture = PIXI.Texture.from(videoElement);
    const videoSprite = new PIXI.Sprite(videoTexture);
    videoSprite.width = app.screen.width;
    videoSprite.height = app.screen.height;    
    return videoSprite;
};

const makeButton = (name, increment, uniforms) => {
    const button = document.createElement("button");
    button.appendChild(document.createTextNode(name));
    button.onclick = () => handleClick(increment, uniforms);

    return button;
}


const getMousePos = (element, pixiPoint) => {
    element?.addEventListener("mousemove", (event) => {
        var rect = event.target.getBoundingClientRect();
        pixiPoint.x = (event.clientX - rect.left) / element.width; 
        pixiPoint.y = (event.clientY - rect.top) / element.height;  
        console.log("Left? : " + pixiPoint.x + " ; Top? : " + pixiPoint.y + ".");     
    });
    return pixiPoint;
}

const getUniforms = (tex, mousePos, circleRad, distortion, aspectRatio) => {
    return {
        sourceTex: tex,
        point: mousePos,
        radius: circleRad,
        distortion: distortion,
        aspectRatio: aspectRatio
    }
}

const getVert = () => {
    return `
attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}    
    `;
}





const getFrag = () => {
    return`
varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform sampler2D sourceTex;
uniform vec2 point;
uniform float radius;    
//uniform vec2 resolution;
uniform float aspectRatio;

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

    float alpha = getRatio(blendRatio, 6.0);

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


const getGrainFrag = () => {
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
}







const getFrag_doesnt_work = () => {
    return`
varying vec2 vTextureCoord;
uniform sampler2D uSampler;
//uniform sampler2D sourceTex;
uniform vec2 point;
uniform float radius;   
uniform vec2 resolution;   
    
void main(){
    
    float effectRadius = .5;
    float effectAngle = 2. * 3.14;
    
    vec2 center = point.xy / resolution.xy;
    center = center == vec2(0., 0.) ? vec2(.5, .5) : center; 

    vec2 uv = vTextureCoord.xy;/////////   / resolution.xy - center;
    
    float len = length(uv);//, * vec2(resolution.x / resolution.y, 1.));
    float angle = atan(uv.y, uv.x) + effectAngle * smoothstep(effectRadius, 0., len);
    float rad = length(uv);



    vec4 col = texture2D(uSampler, vec2(radius * cos(angle), radius * sin(angle)) + center);
    //vec4 src = texture2D(sourceTex, result); 


    gl_FragColor = col;

    //gl_FragColor = mix(col, src, alpha);
    //fragColor = texture(iChannel0, );    
}
    `;



}





const getFrag_fisheye = () => {
    return`
varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform sampler2D sourceTex;
uniform vec2 point;
uniform float radius;
uniform float distortion;

float uvDistFromPoint(vec2 uv){
    vec2 relative = uv - point;
    float pointDist = length(relative);
    return pointDist;
}

void main(){
    vec2 uv = vTextureCoord;

    float dist = uvDistFromPoint(uv);

    float blendDistanceAlpha = dist/radius; 
    float expAlpha = pow(blendDistanceAlpha, 3.0);
    expAlpha = clamp(expAlpha, 0.0, 1.0);


    float k = -0.15;

    float f = 0.0;
    /////// float distortion = -2.8;     //<--------------------------------------------------

    //only compute the cubic distortion if necessary
    if (distortion == 0.0)
    {
        f = 1.0 + dist * k;
    }
    else 
    {
        f = 1.0 + dist * (k + distortion * sqrt(dist));
    };

    //mine
    float f2 = sin(f);


    // get the right pixel for the current position
    float x = f * (uv.x - point.x) + point.x;
    float y = f * (uv.y - point.y) + point.y;

    // x = sin(x);
    // y = sin(y);

    //let's try this then   ---- nope
    // vec2 rel = uv - point;
    // float ang = atan(rel.y, rel.x); 
    // vec2 smoother = vec2(x, y) * vec2(cos(ang), sin(ang));


    //or this -- nope
    // float effectAngle = 2. * 3.14;
    // float angle = atan(/* uv. */y, /* uv. */x) + effectAngle * smoothstep(radius, 0., dist);
    // float radius = length(vec2(x, y));    
    // vec2 finUv = vec2(radius * cos(angle), radius * sin(angle)) + point;

    vec2 finUv = uv;
    if(dist < radius) finUv = vec2(x, y);

    vec4 col = texture2D(uSampler, finUv);///////// vec2(x, y)); ///////////  vTextureCoord);
    vec4 src = texture2D(sourceTex, finUv); //////// vec2(x, y)); ////////////  vTextureCoord);

    vec4 both = mix(col, src, expAlpha);

    gl_FragColor = both;//////col;
}
    `;
}







