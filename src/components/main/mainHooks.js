import { useEffect, useState } from "react";

export const useResize = () => {
    const [width, setWidth] = useState(1920);
    const [height, setHeight] = useState(1080);
    const [offset, setOffset] = useState(0);

    useEffect(() => {
        window.addEventListener("resize", () => {
            setWidth(window.innerWidth);
            setHeight(window.innerHeight);
            setOffset(-1 * (1920 - window.innerWidth) / 2);     
        });
    },
        []
    );
    return [width, height, offset];
};

export const useCenter = (element, offset) => {
    useEffect(() => {
        if(element){
            element.style.left = offset + "px";
        }
    },
        [offset]
    )
};