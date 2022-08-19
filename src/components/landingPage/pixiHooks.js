import { useEffect } from "react";
import * as PIXI from "pixi.js";
import { getDefaultVert } from "../../gl/passthrough";
import { getTwirlFrag, setTwirlUniforms } from "../../gl/twirl";
import { getGrainFrag, setGrainUniforms } from "../../gl/grain";

export const useOverlayAndGrainFilter = (destinationPath, sourcePath, canvasId) => {

    useEffect(() => {    
        const canvasElement = document.getElementById(canvasId);
        if(canvasElement){

            const app = new PIXI.Application({width: 854, height: 480, view: canvasElement});
            document.body.appendChild(app.view);

            const destination = makeVideoSprite(destinationPath,  app);
            const source = makeVideoSprite(sourcePath, app);

            const point = new PIXI.Point(0, 0);
            updateMousePosition(app.view, point);

            const twirl = new PIXI.Filter(
                getDefaultVert(), 
                getTwirlFrag(), 
                setTwirlUniforms(
                    source.texture, 
                    point, 
                    0.2, 
                    6.0, 
                    480/854
                )
            ); 

            const grain = new PIXI.Filter(
                getDefaultVert(), 
                getGrainFrag(), 
                setGrainUniforms(1.0)
            );

            destination.filters = [
                grain,        
                twirl,
            ];

            setInterval(() => {
                destination.filters[0].uniforms.time = new Date().getMilliseconds();
                app.stage.removeChildAt(0);
                app.stage.addChildAt(destination, 0);
            }, 
                50
            );

            app.stage.addChild(destination);


        }



    }, 
        []
    );

};

const makeVideoSprite = (video, app) => {
    const videoElement = document.createElement("video"); 
    videoElement.src = video;
    videoElement.autoplay = true;
    videoElement.muted = true;
    videoElement.loop = true;

    const videoTexture = PIXI.Texture.from(videoElement);
    const videoSprite = new PIXI.Sprite(videoTexture);
    videoSprite.width = app.screen.width;
    videoSprite.height = app.screen.height;    
    return videoSprite;
};

const updateMousePosition = (element, pixiPoint) => {
    element?.addEventListener("mousemove", (event) => {
        var rect = event.target.getBoundingClientRect();
        pixiPoint.x = (event.clientX - rect.left) / element.width; 
        pixiPoint.y = (event.clientY - rect.top) / element.height;     
    });
};