
document.addEventListener( 'DOMContentLoaded', init );

function init(){
    const canvasElement = document.getElementById("canvas");

    const app = new PIXI.Application({width: 720, height: 480, view: canvasElement});
    document.body.appendChild(app.view);

    const destination = makeVideoSprite("video-3.mp4", app);
    const source = makeVideoSprite("video-2.mp4", app);

    const point = new PIXI.Point(0, 0);
    getMousePos(app.view, point);

    const shader = new PIXI.Filter(getVert(), getFrag(), getUniforms(source.texture, point, 0.3, -3.0)); 

    destination.filters = [
        shader
    ];

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

const getUniforms = (tex, mousePos, circleRad, distortion) => {
    return {
        sourceTex: tex,
        point: mousePos,
        radius: circleRad,
        distortion: distortion
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

    // get the right pixel for the current position
    float x = f*(uv.x - point.x) + point.x;
    float y = f*(uv.y - point.y) + point.y;

    vec2 finUv = uv;
    if(dist < radius) finUv = vec2(x, y);

    vec4 col = texture2D(uSampler, finUv);///////// vec2(x, y)); ///////////  vTextureCoord);
    vec4 src = texture2D(sourceTex, finUv); //////// vec2(x, y)); ////////////  vTextureCoord);

    vec4 both = mix(col, src, expAlpha);

    gl_FragColor = both;//////col;
}
    `;
}



