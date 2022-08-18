import { useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'

import { useEffect } from 'react';
//import indexxxjs from "../indexxxxxxx";
//import {Helmet} from "react-helmet";

import {init} from "./mainPIXI";

function App() {
    const [count, setCount] = useState(0)

   
////////
    useEffect(() => {
        init(); //this somehow works despite not having the prerequisite libraries imported ... but they are loaded in script tags in the index. Not sure how that's supposed to work but it does
    },
        []
    )

    return (
        <>
            <canvas id="canvas-1" width={854} height={480}></canvas>
            <button id="button+">+</button>
            <button id="button-">-</button>

            <div className="App">
                <div>
                    <a href="https://vitejs.dev" target="_blank">
                        <img src="/vite.svg" className="logo" alt="Vite logo" />
                    </a>
                    <a href="https://reactjs.org" target="_blank">
                        <img src={reactLogo} className="logo react" alt="React logo" />
                    </a>
                </div>
                <h1>Vite + React</h1>
                <div className="card">
                    <button onClick={() => setCount((count) => count + 1)}>
                        count is {count}
                    </button>
                    <p>
                        Edit <code>src/App.jsx</code> and save to test HMR
                    </p>
                </div>
                <p className="read-the-docs">
                    Click on the Vite and React logos to learn more
                </p>
            </div>
        </>
    )
}

export default App
