import { useOverlayAndGrainFilter } from "./pixiHooks";
import "./LandingPage.scss";

function LandingPage() {

    useOverlayAndGrainFilter(
        /* "../../assets/ */"src/assets/video-2.mp4",
        /* "../../assets/ */"src/assets/video-5.mp4",
        "landing-page-canvas"
    );

    return (
        <div className="landing-page-container">
            <canvas id="landing-page-canvas" width={854} height={480}></canvas>
            {/* <button id="button+">+</button>
            <button id="button-">-</button> */}
        </div>
    );
};

export default LandingPage;