import Below from "../Below";
import LandingPage from "../landingPage/LandingPage";
import { useResize, useCenter } from "./mainHooks";
import "./ActualMain.scss";

function ActualMain() {

    const [width, height, offset] = useResize();
    useCenter(document.body, offset);

    return (
        <div className="main-container" 
            id="main-container"
            style={{
                width: width,
            }}
        >
            {
                console.log(document.body.style.left)
            }
            <LandingPage width={width}/>
            <Below />
        </div>
    );
};

export default ActualMain;