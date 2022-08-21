import { useOverlayAndGrainFilter } from "./pixiHooks";
import "./LandingPage.scss";

function LandingPage(props) {

    useOverlayAndGrainFilter(
        "src/assets/video-2.mp4",
        "src/assets/video-5.mp4",
        "landing-page-canvas",
        1920
    );

    return (
        <div className="landing-page-container" >
            <canvas id="landing-page-canvas" width={1920} height={"100%"/* window.innerHeight *//* 1080 */}></canvas>
            {/* <button id="button+">+</button>
            <button id="button-">-</button> */}
        </div>
    );
};

export default LandingPage;