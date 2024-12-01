const _debounce = function (
    callback,
    debounceDelay,
    immediate
) {
    let timeout;

    return function (...args) {
        const context = this;

        if (immediate && !timeout) {
            callback.apply(context, args)
        }
        if (typeof timeout === "number") {
            clearTimeout(timeout);
        }
        timeout = setTimeout(() => {
            timeout = null;
            if (!immediate) {
                callback.apply(context, args)
            }
        }, debounceDelay);
    }
}

const memory = new WebAssembly.Memory({
    initial: 10,
    maximum: 200,
});

WebAssembly.instantiateStreaming(fetch('/partial-json.wasm'), {
    js: { mem: memory },
}).then((wasmModule) => {
	const { parseJson, ptrLen, memory } = wasmModule.instance.exports;

	const parseIt = (input) => {
		const buffer = new Uint8Array(memory.buffer);
		const offset = 0;

        const startTime = performance.now();
		// put the input string into the wasm memory
		const uint8arr = new TextEncoder().encode(input);
        buffer.fill(0, 0, offset+1)
		buffer.set(uint8arr, offset);

		// run the wasm function and calculate length
		const pointer = parseJson(offset, uint8arr.length);
		const len = ptrLen(pointer);

		// read the string from the wasm memory
		let str = new TextDecoder().decode(new Uint8Array(memory.buffer, pointer, len));
        const timeTaken = performance.now() - startTime
        console.log("Time taken:", timeTaken, "ms")
        document.getElementById('timeTaken').innerText = `(${(timeTaken).toFixed(2)}ms)`;
        document.getElementById('result').innerText = str;
        
	};
    const debparse = _debounce(parseIt, 50, true);
    window.parseIt = parseIt;

    document.getElementById('jsonInput').addEventListener('input', e => debparse(e.target.value));
});

// EXAMPLE DATA:
const weatherData = `{
    "current_condition": [
        {
            "FeelsLikeC": "2",
            "FeelsLikeF": "35",
            "cloudcover": "100",
            "humidity": "75",
            "localObsDateTime": "2024-11-30 11:00 PM",
            "observation_time": "10:00 PM",
            "precipInches": "0.0",
            "precipMM": "0.0",
            "pressure": "1018",
            "pressureInches": "30",
            "temp_C": "5",
            "temp_F": "42",
            "uvIndex": "0",
            "visibility": "10",
            "visibilityMiles": "6",
            "weatherCode": "122",
            "weatherDesc": [
                {
                    "value": "Overcast"
                }
            ],
            "weatherIconUrl": [
                {
                    "value": ""
                }
            ],
            "winddir16Point": "SW",
            "winddirDegree": "235",
            "windspeedKmph": "18",
            "windspeedMiles": "11"
        }
    ],
    "nearest_area": [
        {
            "areaName": [
                {
                    "value": "Stockholm"
                }
            ],
            "country": [
                {
                    "value": "Sweden"
                }
            ],
            "latitude": "59.333",
            "longitude": "18.050",
            "population": "1253309",
            "region": [
                {
                    "value": "Stockholms Lan"
                }
            ],
            "weatherUrl": [
                {
                    "value": ""
                }
            ]
        }
    ],
    "request": [
        {
            "query": "Lat 59.33 and Lon 18.07",
            "type": "LatLon"
        }
    ],
    "weather": [
        {
            "astronomy": [
                {
                    "moon_illumination": "2",
                    "moon_phase": "Waning Crescent",
                    "moonrise": "07:57 AM",
                    "moonset": "01:37 PM",
                    "sunrise": "08:16 AM",
                    "sunset": "02:57 PM"
                }
            ],
            "avgtempC": "5",
            "avgtempF": "40",
            "date": "2024-11-30",
            "hourly": [
                {
                    "DewPointC": "3",
                    "DewPointF": "37",
                    "FeelsLikeC": "0",
                    "FeelsLikeF": "32",
                    "HeatIndexC": "4",
                    "HeatIndexF": "39",
                    "WindChillC": "0",
                    "WindChillF": "32",
                    "WindGustKmph": "25",
                    "WindGustMiles": "16",
                    "chanceoffog": "0",
                    "chanceoffrost": "0",
                    "chanceofhightemp": "0",
                    "chanceofovercast": "88",
                    "chanceofrain": "0",
                    "chanceofremdry": "88",
                    "chanceofsnow": "0",
                    "chanceofsunshine": "19",
                    "chanceofthunder": "0",
                    "chanceofwindy": "0",
                    "cloudcover": "100",
                    "diffRad": "0.0",
                    "humidity": "93",
                    "precipInches": "0.0",
                    "precipMM": "0.0",
                    "pressure": "1024",
                    "pressureInches": "30",
                    "shortRad": "0.0",
                    "tempC": "4",
                    "tempF": "39",
                    "time": "0",
                    "uvIndex": "0",
                    "visibility": "10",
                    "visibilityMiles": "6",
                    "weatherCode": "122",
                    "weatherDesc": [
                        {
                            "value": "Overcast "
                        }
                    ],
                    "weatherIconUrl": [
                        {
                            "value": ""
                        }
                    ],
                    "winddir16Point": "SW",
                    "winddirDegree": "229",
                    "windspeedKmph": "16",
                    "windspeedMiles": "10"
                },
                {
                    "DewPointC": "3",
                    "DewPointF": "38",
                    "FeelsLikeC": "1",
                    "FeelsLikeF": "33",
                    "HeatIndexC": "4",
                    "HeatIndexF": "40",
                    "WindChillC": "1",
                    "WindChillF": "33",
                    "WindGustKmph": "26",
                    "WindGustMiles": "16",
                    "chanceoffog": "0",
                    "chanceoffrost": "0",
                    "chanceofhightemp": "0",
                    "chanceofovercast": "94",
                    "chanceofrain": "0",
                    "chanceofremdry": "86",
                    "chanceofsnow": "0",
                    "chanceofsunshine": "15",
                    "chanceofthunder": "0",
                    "chanceofwindy": "0",
                    "cloudcover": "100",
                    "diffRad": "0.0",
                    "humidity": "93",
                    "precipInches": "0.0",
                    "precipMM": "0.0",
                    "pressure": "1023",
                    "pressureInches": "30",
                    "shortRad": "0.0",
                    "tempC": "4",
                    "tempF": "40",
                    "time": "300",
                    "uvIndex": "0",
                    "visibility": "10",
                    "visibilityMiles": "6",
                    "weatherCode": "122",
                    "weatherDesc": [
                        {
                            "value": "Overcast "
                        }
                    ],
                    "weatherIconUrl": [
                        {
                            "value": ""
                        }
                    ],
                    "winddir16Point": "SW",
                    "winddirDegree": "224",
                    "windspeedKmph": "17",
                    "windspeedMiles": "11"
                },
                {
                    "DewPointC": "4",
                    "DewPointF": "38",
                    "FeelsLikeC": "1",
                    "FeelsLikeF": "34",
                    "HeatIndexC": "5",
                    "HeatIndexF": "40",
                    "WindChillC": "1",
                    "WindChillF": "34",
                    "WindGustKmph": "25",
                    "WindGustMiles": "16",
                    "chanceoffog": "0",
                    "chanceoffrost": "0",
                    "chanceofhightemp": "0",
                    "chanceofovercast": "85",
                    "chanceofrain": "0",
                    "chanceofremdry": "87",
                    "chanceofsnow": "0",
                    "chanceofsunshine": "14",
                    "chanceofthunder": "0",
                    "chanceofwindy": "0",
                    "cloudcover": "100",
                    "diffRad": "0.0",
                    "humidity": "93",
                    "precipInches": "0.0",
                    "precipMM": "0.0",
                    "pressure": "1023",
                    "pressureInches": "30",
                    "shortRad": "0.0",
                    "tempC": "5",
                    "tempF": "40",
                    "time": "600",
                    "uvIndex": "0",
                    "visibility": "10",
                    "visibilityMiles": "6",
                    "weatherCode": "122",
                    "weatherDesc": [
                        {
                            "value": "Overcast "
                        }
                    ],
                    "weatherIconUrl": [
                        {
                            "value": ""
                        }
                    ],
                    "winddir16Point": "SSW",
                    "winddirDegree": "208",
                    "windspeedKmph": "17",
                    "windspeedMiles": "10"
                },
                {
                    "DewPointC": "3",
                    "DewPointF": "38",
                    "FeelsLikeC": "1",
                    "FeelsLikeF": "34",
                    "HeatIndexC": "5",
                    "HeatIndexF": "41",
                    "WindChillC": "1",
                    "WindChillF": "34",
                    "WindGustKmph": "31",
                    "WindGustMiles": "19",
                    "chanceoffog": "0",
                    "chanceoffrost": "0",
                    "chanceofhightemp": "0",
                    "chanceofovercast": "84",
                    "chanceofrain": "0",
                    "chanceofremdry": "82",
                    "chanceofsnow": "0",
                    "chanceofsunshine": "15",
                    "chanceofthunder": "0",
                    "chanceofwindy": "0",
                    "cloudcover": "100",
                    "diffRad": "0.3",
                    "humidity": "88",
                    "precipInches": "0.0",
                    "precipMM": "0.0",
                    "pressure": "1022",
                    "pressureInches": "30",
                    "shortRad": "0.6",
                    "tempC": "5",
                    "tempF": "41",
                    "time": "900",
                    "uvIndex": "0",
                    "visibility": "10",
                    "visibilityMiles": "6",
                    "weatherCode": "122",
                    "weatherDesc": [
                        {
                            "value": "Overcast "
                        }
                    ],
                    "weatherIconUrl": [
                        {
                            "value": ""
                        }
                    ],
                    "winddir16Point": "SW",
                    "winddirDegree": "221",
                    "windspeedKmph": "21",
                    "windspeedMiles": "13"
                },
                {
                    "DewPointC": "2",
                    "DewPointF": "35",
                    "FeelsLikeC": "1",
                    "FeelsLikeF": "34",
                    "HeatIndexC": "5",
                    "HeatIndexF": "42",
                    "WindChillC": "1",
                    "WindChillF": "34",
                    "WindGustKmph": "32",
                    "WindGustMiles": "20",
                    "chanceoffog": "0",
                    "chanceoffrost": "0",
                    "chanceofhightemp": "0",
                    "chanceofovercast": "45",
                    "chanceofrain": "0",
                    "chanceofremdry": "83",
                    "chanceofsnow": "0",
                    "chanceofsunshine": "70",
                    "chanceofthunder": "0",
                    "chanceofwindy": "0",
                    "cloudcover": "33",
                    "diffRad": "17.8",
                    "humidity": "77",
                    "precipInches": "0.0",
                    "precipMM": "0.0",
                    "pressure": "1021",
                    "pressureInches": "30",
                    "shortRad": "35.7",
                    "tempC": "5",
                    "tempF": "42",
                    "time": "1200",
                    "uvIndex": "0",
                    "visibility": "10",
                    "visibilityMiles": "6",
                    "weatherCode": "116",
                    "weatherDesc": [
                        {
                            "value": "Partly Cloudy "
                        }
                    ],
                    "weatherIconUrl": [
                        {
                            "value": ""
                        }
                    ],
                    "winddir16Point": "SW",
                    "winddirDegree": "229",
                    "windspeedKmph": "22",
                    "windspeedMiles": "13"
                },
                {
                    "DewPointC": "0",
                    "DewPointF": "33",
                    "FeelsLikeC": "0",
                    "FeelsLikeF": "33",
                    "HeatIndexC": "5",
                    "HeatIndexF": "41",
                    "WindChillC": "0",
                    "WindChillF": "33",
                    "WindGustKmph": "36",
                    "WindGustMiles": "22",
                    "chanceoffog": "0",
                    "chanceoffrost": "0",
                    "chanceofhightemp": "0",
                    "chanceofovercast": "0",
                    "chanceofrain": "0",
                    "chanceofremdry": "92",
                    "chanceofsnow": "0",
                    "chanceofsunshine": "93",
                    "chanceofthunder": "0",
                    "chanceofwindy": "0",
                    "cloudcover": "12",
                    "diffRad": "14.2",
                    "humidity": "73",
                    "precipInches": "0.0",
                    "precipMM": "0.0",
                    "pressure": "1020",
                    "pressureInches": "30",
                    "shortRad": "30.2",
                    "tempC": "5",
                    "tempF": "41",
                    "time": "1500",
                    "uvIndex": "0",
                    "visibility": "10",
                    "visibilityMiles": "6",
                    "weatherCode": "113",
                    "weatherDesc": [
                        {
                            "value": "Clear "
                        }
                    ],
                    "weatherIconUrl": [
                        {
                            "value": ""
                        }
                    ],
                    "winddir16Point": "SW",
                    "winddirDegree": "232",
                    "windspeedKmph": "23",
                    "windspeedMiles": "14"
                },
                {
                    "DewPointC": "-0",
                    "DewPointF": "31",
                    "FeelsLikeC": "-0",
                    "FeelsLikeF": "32",
                    "HeatIndexC": "4",
                    "HeatIndexF": "40",
                    "WindChillC": "-0",
                    "WindChillF": "32",
                    "WindGustKmph": "36",
                    "WindGustMiles": "22",
                    "chanceoffog": "0",
                    "chanceoffrost": "0",
                    "chanceofhightemp": "0",
                    "chanceofovercast": "49",
                    "chanceofrain": "0",
                    "chanceofremdry": "89",
                    "chanceofsnow": "0",
                    "chanceofsunshine": "85",
                    "chanceofthunder": "0",
                    "chanceofwindy": "0",
                    "cloudcover": "60",
                    "diffRad": "5.7",
                    "humidity": "71",
                    "precipInches": "0.0",
                    "precipMM": "0.0",
                    "pressure": "1019",
                    "pressureInches": "30",
                    "shortRad": "12.1",
                    "tempC": "4",
                    "tempF": "40",
                    "time": "1800",
                    "uvIndex": "0",
                    "visibility": "10",
                    "visibilityMiles": "6",
                    "weatherCode": "116",
                    "weatherDesc": [
                        {
                            "value": "Partly Cloudy "
                        }
                    ],
                    "weatherIconUrl": [
                        {
                            "value": ""
                        }
                    ],
                    "winddir16Point": "SW",
                    "winddirDegree": "229",
                    "windspeedKmph": "23",
                    "windspeedMiles": "15"
                },
                {
                    "DewPointC": "1",
                    "DewPointF": "33",
                    "FeelsLikeC": "0",
                    "FeelsLikeF": "32",
                    "HeatIndexC": "4",
                    "HeatIndexF": "40",
                    "WindChillC": "0",
                    "WindChillF": "32",
                    "WindGustKmph": "33",
                    "WindGustMiles": "20",
                    "chanceoffog": "0",
                    "chanceoffrost": "0",
                    "chanceofhightemp": "0",
                    "chanceofovercast": "49",
                    "chanceofrain": "0",
                    "chanceofremdry": "89",
                    "chanceofsnow": "0",
                    "chanceofsunshine": "78",
                    "chanceofthunder": "0",
                    "chanceofwindy": "0",
                    "cloudcover": "29",
                    "diffRad": "0.0",
                    "humidity": "76",
                    "precipInches": "0.0",
                    "precipMM": "0.0",
                    "pressure": "1019",
                    "pressureInches": "30",
                    "shortRad": "0.0",
                    "tempC": "4",
                    "tempF": "40",
                    "time": "2100",
                    "uvIndex": "0",
                    "visibility": "10",
                    "visibilityMiles": "6",
                    "weatherCode": "116",
                    "weatherDesc": [
                        {
                            "value": "Partly Cloudy "
                        }
                    ],
                    "weatherIconUrl": [
                        {
                            "value": ""
                        }
                    ],
                    "winddir16Point": "SW",
                    "winddirDegree": "227",
                    "windspeedKmph": "21",
                    "windspeedMiles": "13"
                }
            ],
            "maxtempC": "5",
            "maxtempF": "42",
            "mintempC": "4",
            "mintempF": "39",
            "sunHour": "5.5",
            "totalSnow_cm": "0.0",
            "uvIndex": "0"
        },
        {
            "astronomy": [
                {
                    "moon_illumination": "0",
                    "moon_phase": "New Moon",
                    "moonrise": "09:32 AM",
                    "moonset": "01:48 PM",
                    "sunrise": "08:18 AM",
                    "sunset": "02:55 PM"
                }
            ],
            "avgtempC": "7",
            "avgtempF": "44",
            "date": "2024-12-01",
            "hourly": [
                {
`

document.getElementById('wttr').addEventListener('click', () => {
    if (document.getElementById('jsonInput').value === weatherData) {
        return
    }
    document.getElementById('jsonInput').value = weatherData;
    setTimeout(() => parseIt(weatherData), 0);
});