import styles from "./Map.module.css";
import geoJson from "../../assets/export.geojson";

export const ID_ATTRIBUTE_NAME = "@id";

const STYLE_DEFAULT = {
    strokeColor: "green",
    strokeWeight: 2.0,
    strokeOpacity: 1.0,
    fillColor: "green",
    fillOpacity: 0.3,
};

const RENTOKIL_RED = "#ed1c24";
const AMBER = "#FFBF00";
const STYLE_NON_CUSTOMER = {
    ...STYLE_DEFAULT,
    strokeColor: AMBER,
    fillColor: AMBER,
};

const STYLE_CLICKED = {
    ...STYLE_DEFAULT,
    strokeColor: RENTOKIL_RED,
    fillColor: RENTOKIL_RED,
    fillOpacity: 0.5,
};

const STYLE_MOUSE_MOVE = {
    ...STYLE_DEFAULT,
    strokeWeight: 4.0,
    strokeColor: RENTOKIL_RED,
};

const DEFAULT_HEATMAP_RADIUS = 30;

const psudoRandomNumberGenerator = (seed: number): (() => number) => {
    // https://stackoverflow.com/a/47593316/498463
    return function () {
        seed |= 0;
        seed = (seed + 0x9e3779b9) | 0;
        let t = seed ^ (seed >>> 16);
        t = Math.imul(t, 0x21f0aaad);
        t = t ^ (t >>> 15);
        t = Math.imul(t, 0x735a2d97);
        return ((t = t ^ (t >>> 15)) >>> 0) / 4294967296;
    };
};

const getRandomIntInclusive = (min: number, max: number): number => {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled); // The maximum is inclusive and the minimum is inclusive
};

const getHeatMapData = (
    rndSeed: number,
): Array<{ location: google.maps.LatLng; weight: number }> => {
    const consistentRndGenerator = psudoRandomNumberGenerator(0);
    const locations: google.maps.LatLng[] = [];
    const weights: number[] = [];

    for (let i = 0; i < geoJson.features.length; i++) {
        const f = geoJson.features[i];
        const corner = getRandomIntInclusive(0, 3);
        const location =
            f.geometry.coordinates[0][
                corner <= f.geometry.coordinates[0].length - 1 ? corner : 0
            ];
        if (location) {
            locations.push(
                new google.maps.LatLng({
                    lat: location[1],
                    lng: location[0],
                }),
            );
        }

        const weight = consistentRndGenerator();
        if (Number(weight.toString().slice(-1)) % 7 === 0) {
            weights.push(consistentRndGenerator());
        }
    }
    return weights.map((weight, i) => {
        let offset = rndSeed * 100;
        let index = offset + i;
        if (index >= locations.length) {
            offset = (79 - (rndSeed - 79)) * 100;
            index = offset + i;
        }
        const location = locations[index];
        return { weight, location };
    });
};

export const Map = ({
    setLastClickedFeatureIds,
}: {
    setLastClickedFeatureIds: React.Dispatch<React.SetStateAction<string[]>>;
}) => {
    let map: google.maps.Map;
    let heatmap: google.maps.visualization.HeatmapLayer;
    let lastInteractedFeatureIds: string[] = [];
    let lastClickedFeatureIds: string[] = [];
    let datasetLayer: google.maps.FeatureLayer;

    function handleClick(e: google.maps.FeatureMouseEvent) {
        if (e.features) {
            e.stop();
            lastClickedFeatureIds = e.features.map((f) => {
                return (f as google.maps.DatasetFeature).datasetAttributes[
                    ID_ATTRIBUTE_NAME
                ];
            });
        }
        setLastClickedFeatureIds(lastClickedFeatureIds);

        datasetLayer.style = applyStyle;
    }

    function handleMouseMove(e: google.maps.FeatureMouseEvent) {
        if (e.features) {
            lastInteractedFeatureIds = e.features.map(
                (f) =>
                    (f as google.maps.DatasetFeature).datasetAttributes[
                        ID_ATTRIBUTE_NAME
                    ],
            );
        }
        datasetLayer.style = applyStyle;
    }

    const handleTimeChange = () => {
        heatmap.setData(
            getHeatMapData(
                (document.getElementById("timeSlider") as HTMLInputElement)
                    .value as unknown as number,
            ),
        );
    };

    async function initMap() {
        // Request needed libraries.
        const { Map } = (await google.maps.importLibrary(
            "maps",
        )) as google.maps.MapsLibrary;
        const { Autocomplete } = (await google.maps.importLibrary(
            "places",
        )) as google.maps.PlacesLibrary;
        const { HeatmapLayer } = (await google.maps.importLibrary(
            "visualization",
        )) as google.maps.VisualizationLibrary;

        const position = { lat: 40.735657, lng: -74.172363 }; // Newark, NJ
        map = new Map(
            document.getElementById("map") as HTMLElement,
            {
                zoom: 16,
                center: position,
                mapId: "dbcf606e93ab5291",
                mapTypeControl: true,
                streetViewControl: false,
                clickableIcons: false,
                rotateControl: true,
            } as google.maps.MapOptions,
        );

        // Dataset ID for Newark found by jazim, shown here .
        const datasetId = "21db36cf-e6c2-4367-b1f4-7fb5857053db";

        datasetLayer = map.getDatasetFeatureLayer(datasetId);
        datasetLayer.style = applyStyle;

        heatmap = new HeatmapLayer({
            data: getHeatMapData(0),
        });
        heatmap.set("radius", DEFAULT_HEATMAP_RADIUS);
        heatmap.setMap(map);

        datasetLayer.addListener("click", handleClick);
        datasetLayer.addListener("mousemove", handleMouseMove);

        // Map event listener.
        map.addListener("click", () => {
            if (lastClickedFeatureIds?.length) {
                lastClickedFeatureIds = [];
                setLastClickedFeatureIds([]);
                datasetLayer.style = applyStyle;
            }
        });
        map.addListener("mousemove", () => {
            // If the map gets a mousemove, that means there are no feature layers
            // with listeners registered under the mouse, so we clear the last
            // interacted feature ids.
            if (lastInteractedFeatureIds?.length) {
                lastInteractedFeatureIds = [];
                datasetLayer.style = applyStyle;
            }
        });
        map.addListener("zoom_changed", () => {
            const zoom = map.getZoom();
            switch (zoom) {
                case 16:
                case 17:
                case 18:
                case 19:
                    heatmap.set("radius", DEFAULT_HEATMAP_RADIUS + 30);
                    break;
                case 20:
                case 21:
                case 22:
                    heatmap.set("radius", DEFAULT_HEATMAP_RADIUS + 60);
                    break;
                default:
                    heatmap.set("radius", DEFAULT_HEATMAP_RADIUS);
                    break;
            }
        });

        const inputField = document.getElementById(
            "pac-input",
        ) as HTMLInputElement; // Replace with your input element ID
        const autocomplete = new Autocomplete(inputField);

        autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace();
            if (place?.geometry?.location) {
                map.panTo(place.geometry.location);
            }
        });

        // createAttribution(map, "Data source: NYC Open Data"); // not for this current dataset
        createAttribution(
            map,
            "The data included in this document is from www.openstreetmap.org. The data is made available under ODbL.",
        );
    }

    function applyStyle(params: google.maps.FeatureStyleFunctionOptions) {
        const datasetFeature = params.feature as google.maps.DatasetFeature;
        if (
            lastClickedFeatureIds.includes(
                datasetFeature.datasetAttributes[ID_ATTRIBUTE_NAME],
            )
        ) {
            return STYLE_CLICKED;
        }
        if (
            lastInteractedFeatureIds.includes(
                datasetFeature.datasetAttributes[ID_ATTRIBUTE_NAME],
            )
        ) {
            return STYLE_MOUSE_MOVE;
        }
        return Number(
            datasetFeature.datasetAttributes[ID_ATTRIBUTE_NAME].slice(-1),
        ) %
            3 ===
            0
            ? STYLE_DEFAULT
            : STYLE_NON_CUSTOMER;
    }

    function createAttribution(map: google.maps.Map, label: string) {
        const attributionDiv = document.createElement("div");
        const attributionLabel = document.createElement("div");

        // Define CSS styles.
        attributionLabel.style.backgroundColor = "#fff";
        attributionLabel.style.color = "#000";
        attributionLabel.style.opacity = "0.7";
        attributionLabel.style.fontFamily = "Roboto,Arial,sans-serif";
        attributionLabel.style.fontSize = "10px";
        attributionLabel.style.padding = "2px";
        attributionLabel.style.margin = "2px";
        attributionLabel.textContent = label;
        attributionDiv.appendChild(attributionLabel);

        map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(
            attributionDiv,
        );
    }

    void initMap();

    return (
        <>
            <label htmlFor="timeSlider">Date / Time</label>
            <div>
                <input
                    type="range"
                    id="timeSlider"
                    name="timeSlider"
                    min={0}
                    max={100}
                    defaultValue={0}
                    step={1}
                    list="markers"
                    onFocus={() => {
                        datasetLayer.style = null;
                    }}
                    onChange={handleTimeChange}
                    onBlur={() => {
                        datasetLayer.style = applyStyle;
                    }}
                />
                <datalist id="markers">
                    <option value="0"></option>
                    <option value="25"></option>
                    <option value="50"></option>
                    <option value="75"></option>
                    <option value="100"></option>
                </datalist>
            </div>
            <div id="map" className={styles.map}></div>
        </>
    );
};
