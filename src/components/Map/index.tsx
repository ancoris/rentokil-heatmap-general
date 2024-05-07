import { useState, useEffect } from "react";
import styles from "./Map.module.css";
import geoJson from "../../assets/export.geojson";
import { DateSlider } from "../DateSlider";
import {
    ID_ATTRIBUTE_NAME,
    featureIdIsRentokilCustomer,
} from "../geoJsonUtils";
import {
    DEFAULT_HEATMAP_RADIUS,
    START_POSITION,
    STYLE_CLICKED,
    STYLE_CUSTOMER,
    STYLE_MOUSE_MOVE,
    STYLE_NON_CUSTOMER,
} from "../mapUtils";
import {
    getRandomIntInclusive,
    psudoRandomNumberGenerator,
} from "../../numberUtils";
const { Map: GMap } = (await google.maps.importLibrary(
    "maps",
)) as google.maps.MapsLibrary;
const { Autocomplete } = (await google.maps.importLibrary(
    "places",
)) as google.maps.PlacesLibrary;
const { HeatmapLayer } = (await google.maps.importLibrary(
    "visualization",
)) as google.maps.VisualizationLibrary;

const getHeatMapData = (
    rndSeed: number,
): Array<{ location: google.maps.LatLng; weight: number }> => {
    const consistentRndGenerator = psudoRandomNumberGenerator(0);
    const locations: google.maps.LatLng[] = [];
    const weights: number[] = [];

    for (let i = 0; i < geoJson.features.length; i++) {
        const f = geoJson.features[i];
        // avoid using south east corner of every building for heat map, mix it up to make it more interesting
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
            offset = (75 - (rndSeed - 75)) * 100;
            index = offset + i;
        }
        const location = locations[index];
        return { weight, location };
    });
};

export const Map = ({
    lastClickedFeatureIds,
    setLastClickedFeatureIds,
    handleAtRiskButton,
    setMap,
}: {
    lastClickedFeatureIds: string[];
    setLastClickedFeatureIds: React.Dispatch<React.SetStateAction<string[]>>;
    handleAtRiskButton: () => void;
    setMap: React.Dispatch<React.SetStateAction<google.maps.Map | null>>;
}) => {
    let map: google.maps.Map;

    const [timeSliderValue, setTimeSliderValue] = useState<number>(90);
    const [datasetLayer, setDatasetLayer] =
        useState<google.maps.FeatureLayer | null>(null);
    const [datasetLayerVisible, setDatasetLayerVisible] =
        useState<boolean>(true);
    const [heatmap, setHeatmap] =
        useState<google.maps.visualization.HeatmapLayer | null>(null);
    const [heatmapVisible, setHeatmapVisible] = useState<boolean>(false);
    const [lastInteractedFeatureIds, setLastInteractedFeatureIds] = useState<
        string[]
    >([]);

    useEffect(() => {
        if (datasetLayer) {
            datasetLayer.style = applyStyle;
        }
    }, [datasetLayerVisible, lastInteractedFeatureIds, lastClickedFeatureIds]);

    useEffect(() => {
        if (
            datasetLayer &&
            heatmap &&
            (timeSliderValue !== null || timeSliderValue !== undefined)
        ) {
            try {
                heatmap.setData(getHeatMapData(timeSliderValue));
            } catch (e) {
                console.error(e, timeSliderValue);
            }
        }
    }, [timeSliderValue]);

    const handleClick = (e: google.maps.FeatureMouseEvent): void => {
        if (e.features) {
            e.stop();
            setLastClickedFeatureIds(
                e.features.map((f) => {
                    return (f as google.maps.DatasetFeature).datasetAttributes[
                        ID_ATTRIBUTE_NAME
                    ];
                }),
            );
        }
    };

    const handleMouseMove = (e: google.maps.FeatureMouseEvent): void => {
        if (e.features) {
            e.stop();
            setLastInteractedFeatureIds(
                e.features.map(
                    (f) =>
                        (f as google.maps.DatasetFeature).datasetAttributes[
                            ID_ATTRIBUTE_NAME
                        ],
                ),
            );
        }
    };

    const createCenterControl = (): HTMLInputElement => {
        const controlInput = document.createElement("input");

        // Set CSS for the control.
        controlInput.style.backgroundColor = "#fff";
        controlInput.style.border = "2px solid #fff";
        controlInput.style.borderRadius = "3px";
        controlInput.style.boxShadow = "0 2px 6px rgba(0,0,0,.3)";
        controlInput.style.color = "rgb(25,25,25)";
        controlInput.style.cursor = "pointer";
        controlInput.style.fontFamily = "Roboto,Arial,sans-serif";
        controlInput.style.fontSize = "16px";
        controlInput.style.lineHeight = "38px";
        controlInput.style.margin = "8px 16px";
        controlInput.style.padding = "0 5px";
        controlInput.style.width = "260px";

        controlInput.id = "pac-input2";
        controlInput.type = "text";
        controlInput.setAttribute("data-lpignore", "true");
        controlInput.autocomplete = "off";
        controlInput.placeholder = "Search by location or zip code...";

        return controlInput;
    };

    const initMap = async (): Promise<void> => {
        const mapElem = document.getElementById("map") as HTMLDivElement;
        map = new GMap(mapElem, {
            zoom: 15,
            center: START_POSITION,
            mapId: "dbcf606e93ab5291",
            mapTypeControl: true,
            mapTypeControlOptions: {
                style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
                position: google.maps.ControlPosition.TOP_RIGHT,
            },
            streetViewControl: false,
            clickableIcons: false,
            rotateControl: true,
        } as google.maps.MapOptions);

        // Dataset ID for Newark found by jazim, shown here .
        const datasetId = "21db36cf-e6c2-4367-b1f4-7fb5857053db";

        const localDatasetLayer = map.getDatasetFeatureLayer(datasetId);

        localDatasetLayer.style = applyStyle;

        const localHeatmapLayer = new HeatmapLayer({
            data: getHeatMapData(90),
        });
        localHeatmapLayer.set("radius", DEFAULT_HEATMAP_RADIUS);
        setHeatmap(localHeatmapLayer);

        localDatasetLayer.addListener("click", handleClick);
        localDatasetLayer.addListener("mousemove", handleMouseMove);
        setDatasetLayer(localDatasetLayer);

        // Map event listener.
        map.addListener("click", () => {
            setLastClickedFeatureIds([]);
        });
        map.addListener("mousemove", () => {
            // If the map gets a mousemove, that means there are no feature layers
            // with listeners registered under the mouse, so we clear the last
            // interacted feature ids.
            setLastInteractedFeatureIds([]);
        });
        map.addListener("zoom_changed", () => {
            if (heatmap) {
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
            }
        });

        // Create the DIV to hold the control.
        const centerControlDiv = document.createElement("div");
        // Create the control.
        const searchControl = createCenterControl();
        // Append the control to the DIV.
        centerControlDiv.appendChild(searchControl);

        map.controls[google.maps.ControlPosition.TOP_LEFT].push(
            centerControlDiv,
        );
        map.controls[google.maps.ControlPosition.RIGHT_TOP].push(
            getHeatmapControl(localHeatmapLayer),
        );
        map.controls[google.maps.ControlPosition.RIGHT_TOP].push(
            getAtRiskControl(),
        );

        const autocomplete = new Autocomplete(searchControl);

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

        if (setMap) {
            setMap(map);
        }
    };

    const getHeatmapControl = (
        localHeatmapLayer: google.maps.visualization.HeatmapLayer,
    ): HTMLDivElement => {
        const heatmapControlDiv = document.createElement("div");
        const heatmapControlButton = document.createElement("button");
        heatmapControlButton.textContent = "Migration Map";
        heatmapControlButton.classList.add(styles.toggleHeatMap);
        heatmapControlButton.addEventListener("click", () => {
            const hm = heatmap ?? localHeatmapLayer;
            if (hm) {
                const mapVal = hm.getMap() ? null : map;
                hm.setMap(mapVal);
                setHeatmapVisible(mapVal !== null);
            }
        });
        heatmapControlDiv.appendChild(heatmapControlButton);
        return heatmapControlDiv;
    };

    const getAtRiskControl = (): HTMLDivElement => {
        const atRiskControlDiv = document.createElement("div");
        const atRiskControlButton = document.createElement("button");
        atRiskControlButton.textContent = "Buildings at risk";
        atRiskControlButton.classList.add(styles.toggleHeatMap);
        atRiskControlButton.addEventListener("click", handleAtRiskButton);
        atRiskControlDiv.appendChild(atRiskControlButton);
        return atRiskControlDiv;
    };

    const applyStyle: google.maps.FeatureStyleFunction = (params) => {
        if (!datasetLayerVisible) {
            return null;
        }
        const datasetFeature = params.feature as google.maps.DatasetFeature;
        const featureId = datasetFeature.datasetAttributes[ID_ATTRIBUTE_NAME];
        const baseStyle = featureIdIsRentokilCustomer(featureId)
            ? STYLE_CUSTOMER
            : STYLE_NON_CUSTOMER;
        let style = baseStyle;
        if (lastClickedFeatureIds.includes(featureId)) {
            style = { ...baseStyle, ...STYLE_CLICKED };
        } else if (lastInteractedFeatureIds.includes(featureId)) {
            style = { ...baseStyle, ...STYLE_MOUSE_MOVE };
        }
        return style;
    };

    const createAttribution = (map: google.maps.Map, label: string): void => {
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
    };

    useEffect(() => {
        void initMap();
    }, []);

    return (
        <div className={styles.mapWrapper}>
            <DateSlider
                {...{
                    setDatasetLayerVisible,
                    setTimeSliderValue,
                    heatmapVisible,
                }}
            />
            <div id="map" className={styles.map}></div>
        </div>
    );
};
