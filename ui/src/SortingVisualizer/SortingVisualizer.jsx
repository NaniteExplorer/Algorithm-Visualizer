import React from 'react';
import { getMergeSortAnimations } from '../sortingAlgorithms/sortingAlgorithms.';
import { getQuickSortAnimations } from '../sortingAlgorithms/getQuickSortAnimations';
import { getHeapSortAnimations } from '../sortingAlgorithms/getHeapSortAnimations';
import { getBubbleSortAnimations } from '../sortingAlgorithms/getBubbleSortAnimations';
import { getInsertionSortAnimations } from '../sortingAlgorithms/getInsertionSortAnimations';
import './SortingVisualizer.css';


const ANIMATION_SPEED_MS = 20;

const NUMBER_OF_ARRAY_BARS = 50;

const PRIMARY_COLOR = 'turquoise';

const SECONDARY_COLOR = 'turquoise';

const TERTIARY_COLOR = 'red';

export default class SortingVisualizer extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            array: [],
            isSorting: false,
            timeouts: [],
        };
    }

    componentDidMount() {
        this.resetArray();
    }

    resetArray() {

        this.clearAllTimeouts();

        const array = [];
        for (let i = 0; i < NUMBER_OF_ARRAY_BARS; i++) {
            array.push(randomIntFromInterval(5, 620));
        }
        this.setState({ array, isSorting: false });
    }

    clearAllTimeouts() {

        this.state.timeouts.forEach((timeout) => clearTimeout(timeout));
        this.setState({ timeouts: [] });
    }

    mergeSort() {
        const animations = getMergeSortAnimations(this.state.array);
        const timeouts = [];

        this.setState({ isSorting: true });

        for (let i = 0; i < animations.length; i++) {
            const arrayBars = document.getElementsByClassName('array-bar');
            const isColorChange = i % 3 !== 2;
            if (isColorChange) {
                const [barOneIdx, barTwoIdx] = animations[i];
                const barOneStyle = arrayBars[barOneIdx].style;
                const barTwoStyle = arrayBars[barTwoIdx].style;
                const color = i % 3 === 0 ? TERTIARY_COLOR : PRIMARY_COLOR;
                const timeout = setTimeout(() => {
                    barOneStyle.backgroundColor = color;
                    barTwoStyle.backgroundColor = color;
                }, i * ANIMATION_SPEED_MS);
                timeouts.push(timeout);
            }

            else {
                const timeout = setTimeout(() => {
                    const [barOneIdx, newHeight] = animations[i];
                    const barOneStyle = arrayBars[barOneIdx].style;
                    barOneStyle.height = `${newHeight}px`;
                }, i * ANIMATION_SPEED_MS);
                timeouts.push(timeout);
            }
        }

        this.setState({ timeouts });
    }

    quickSort() {
        const animations = getQuickSortAnimations(this.state.array);
        const timeouts = [];

        this.setState({ isSorting: true, timeouts: [] });

        for (let i = 0; i < animations.length; i++) {
            const arrayBars = document.getElementsByClassName("array-bar");

            const isColorChange =
                animations[i][0] === "comparison1" ||
                animations[i][0] === "comparison2";

            const pivot = animations[i][0] === "pivot";
            const pivotChange = animations[i][0] == "pivotchange";

            if (isColorChange) {
                const [comparison, barOneIdx, barTwoIdx] = animations[i];
                const barOneStyle = arrayBars[barOneIdx].style;
                const barTwoStyle = arrayBars[barTwoIdx].style;

                const color =
                    comparison === "comparison1" ? SECONDARY_COLOR : PRIMARY_COLOR;

                const timeout = setTimeout(() => {
                    barOneStyle.backgroundColor = color;
                    barTwoStyle.backgroundColor = color;
                }, i * ANIMATION_SPEED_MS);
                timeouts.push(timeout);
            }
            else if (pivot || pivotChange) {
                const timeout = setTimeout(() => {
                    const [swap, barOneIdx, newHeight] = animations[i];
                    const clr = swap === "pivot" ? TERTIARY_COLOR : PRIMARY_COLOR
                    const barOneStyle = arrayBars[barOneIdx].style;
                    barOneStyle.backgroundColor = clr;

                }, i * ANIMATION_SPEED_MS);
                timeouts.push(timeout);

            }
            else {
                const timeout = setTimeout(() => {
                    const [swap, barOneIdx, newHeight] = animations[i];
                    const barOneStyle = arrayBars[barOneIdx].style;
                    barOneStyle.height = `${newHeight}px`;
                }, i * ANIMATION_SPEED_MS);
                timeouts.push(timeout);
            }
        }

        this.setState({ timeouts });
    }

    // heapSort() {
    //     const animations = getHeapSortAnimations(this.state.array);
    //     const timeouts = [];

    //     for (let i = 0; i < animations.length; i++) {
    //         const arrayBars = document.getElementsByClassName("array-bar");

    //         const isColorChange =
    //             animations[i][0] === "comparison1" ||
    //             animations[i][0] === "comparison2";

    //         if (isColorChange) {
    //             const [comparison, barOneIdx, barTwoIdx] = animations[i];
    //             const barOneStyle = arrayBars[barOneIdx].style;
    //             const barTwoStyle = arrayBars[barTwoIdx].style;

    //             const color =
    //                 comparison === "comparison1" ? SECONDARY_COLOR : PRIMARY_COLOR;

    //             const timeout = setTimeout(() => {
    //                 barOneStyle.backgroundColor = color;
    //                 barTwoStyle.backgroundColor = color;
    //             }, i * ANIMATION_SPEED_MS);
    //             timeouts.push(timeout);
    //         } else {
    //             const timeout = setTimeout(() => {
    //                 const [swap, barOneIdx, newHeight] = animations[i];
    //                 const barOneStyle = arrayBars[barOneIdx].style;
    //                 barOneStyle.height = `${newHeight}px`;
    //             }, i * ANIMATION_SPEED_MS);
    //             timeouts.push(timeout);
    //         }
    //     }

    //     this.setState({ timeouts });
    // }

    bubbleSort() {
        const animations = getBubbleSortAnimations(this.state.array);
        const timeouts = [];

        for (let i = 0; i < animations.length; i++) {
            const arrayBars = document.getElementsByClassName("array-bar");

            const isColorChange =
                animations[i][0] === "comparison1" ||
                animations[i][0] === "comparison2";

            if (isColorChange) {
                const [comparison, barOneIdx, barTwoIdx] = animations[i];
                const barOneStyle = arrayBars[barOneIdx].style;
                const barTwoStyle = arrayBars[barTwoIdx].style;

                const color =
                    comparison === "comparison1" ? TERTIARY_COLOR : PRIMARY_COLOR;

                const timeout = setTimeout(() => {
                    barOneStyle.backgroundColor = color;
                    barTwoStyle.backgroundColor = color;
                }, i * ANIMATION_SPEED_MS);
                timeouts.push(timeout);
            } else {
                const timeout = setTimeout(() => {
                    const [swap, barOneIdx, newHeight] = animations[i];
                    const barOneStyle = arrayBars[barOneIdx].style;
                    barOneStyle.height = `${newHeight}px`;
                }, i * ANIMATION_SPEED_MS);
                timeouts.push(timeout);
            }
        }


        this.setState({ timeouts });
    }

    insertionSort() {
        const animations = getInsertionSortAnimations(this.state.array);
        const timeouts = [];

        for (let i = 0; i < animations.length; i++) {
            const arrayBars = document.getElementsByClassName("array-bar");

            const isColorChange =
                animations[i][0] === "comparison1" ||
                animations[i][0] === "comparison2";

            if (isColorChange) {
                const [comparison, barOneIdx, barTwoIdx] = animations[i];
                const barOneStyle = arrayBars[barOneIdx].style;
                const barTwoStyle = arrayBars[barTwoIdx].style;

                const color =
                    comparison === "comparison1" ? SECONDARY_COLOR : PRIMARY_COLOR;

                const timeout = setTimeout(() => {
                    barOneStyle.backgroundColor = color;
                    barTwoStyle.backgroundColor = color;
                }, i * ANIMATION_SPEED_MS);
                timeouts.push(timeout);
            } else {
                const timeout = setTimeout(() => {
                    const [swap, barOneIdx, newHeight] = animations[i];
                    const barOneStyle = arrayBars[barOneIdx].style;
                    barOneStyle.height = `${newHeight}px`;
                }, i * ANIMATION_SPEED_MS);
                timeouts.push(timeout);
            }
        }


        this.setState({ timeouts });
    }

    render() {
        const { array } = this.state;

        return (
            <div className="min-h-screen bg-gradient-to-r from-blue-100 to-blue-200 flex flex-col items-center justify-start p-5">
                <div className="w-full fixed top-0 bg-gray-800 flex justify-center py-4 shadow-lg z-10">
                    <div className="flex space-x-4">
                        <button
                            onClick={() => this.resetArray()}
                            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded cursor-pointer transition duration-200"
                        >
                            Generate New Array
                        </button>
                        <button
                            onClick={() => this.mergeSort()}
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded cursor-pointer transition duration-200"
                        >
                            Merge Sort
                        </button>
                        <button
                            onClick={() => this.quickSort()}
                            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded cursor-pointer transition duration-200"
                        >
                            Quick Sort
                        </button>
                        {/* <button
                            onClick={() => this.heapSort()}
                            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded cursor-pointer transition duration-200"
                        >
                            Heap Sort
                        </button> */}
                        <button
                            onClick={() => this.bubbleSort()}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded cursor-pointer transition duration-200"
                        >
                            Bubble Sort
                        </button>
                        <button
                            onClick={() => this.insertionSort()}
                            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded cursor-pointer transition duration-200"
                        >
                            Insertion Sort
                        </button>
                    </div>
                </div>


                <div className="array-container flex justify-center items-end mt-24">
                    {array.map((value, idx) => (
                        <div
                            className="array-bar mx-1"
                            key={idx}
                            style={{
                                backgroundColor: PRIMARY_COLOR,
                                height: `${value}px`,
                                width: `${Math.floor(600 / NUMBER_OF_ARRAY_BARS)}px`,
                            }}></div>
                    ))}
                </div>
            </div>
        );
    }
}


function randomIntFromInterval(min, max) {

    return Math.floor(Math.random() * (max - min + 1) + min);
}

function arraysAreEqual(arrayOne, arrayTwo) {
    if (arrayOne.length !== arrayTwo.length) return false;
    for (let i = 0; i < arrayOne.length; i++) {
        if (arrayOne[i] !== arrayTwo[i]) {
            return false;
        }
    }
    return true;
}
