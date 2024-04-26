import styles from "./Map.module.css";

export const ID_ATTRIBUTE_NAME = "@id"; // "globalid";

const STYLE_DEFAULT = {
    strokeColor: "green",
    strokeWeight: 2.0,
    strokeOpacity: 1.0,
    fillColor: "green",
    fillOpacity: 0.3,
};

const STYLE_CLICKED = {
    ...STYLE_DEFAULT,
    strokeColor: "blue",
    fillColor: "blue",
    fillOpacity: 0.5,
};

const STYLE_MOUSE_MOVE = {
    ...STYLE_DEFAULT,
    strokeWeight: 4.0,
};

export const Map = ({
    setFeatureArea,
    setLastClickedFeatureIds,
    setMap,
}: {
    setFeatureArea: React.Dispatch<React.SetStateAction<number>>;
    setLastClickedFeatureIds: React.Dispatch<React.SetStateAction<string[]>>;
    setMap: React.Dispatch<React.SetStateAction<google.maps.Map | null>>;
}) => {
    let map: google.maps.Map;
    let lastInteractedFeatureIds: string[] = [];
    let lastClickedFeatureIds: string[] = [];
    let datasetLayer: any;

    function handleClick(/* MouseEvent */ e) {
        let featureAreaSqFoot = 0;
        if (e.features) {
            lastClickedFeatureIds = e.features.map((f) => {
                featureAreaSqFoot += f.datasetAttributes["acres"] * 43560;
                return f.datasetAttributes[ID_ATTRIBUTE_NAME];
            });
        }
        setFeatureArea(featureAreaSqFoot);
        setLastClickedFeatureIds(lastClickedFeatureIds);

        //@ts-ignore
        datasetLayer.style = applyStyle;
    }

    function handleMouseMove(/* MouseEvent */ e) {
        if (e.features) {
            lastInteractedFeatureIds = e.features.map(
                (f) => f.datasetAttributes[ID_ATTRIBUTE_NAME],
            );
        }
        //@ts-ignore
        datasetLayer.style = applyStyle;
    }

    async function initMap() {
        // Request needed libraries.
        const {Map} = (await google.maps.importLibrary(
            "maps",
        )) as google.maps.MapsLibrary;

        const { Autocomplete } = (await google.maps.importLibrary(
            "places",
        )) as google.maps.places;

        const position = {lat: 40.735657, lng: -74.172363};
        map = new Map(document.getElementById("map") as HTMLElement, {
            zoom: 16,
            center: position,
            mapId: "81d6db83c3b8a7fc",
            mapTypeControl: false,
        });
        setMap(map);

        // Dataset ID for Newark found by jazim, shown here .
        const datasetId = "2b8bdf5a-5fbf-4706-96f3-4bdee1077c72";

        //@ts-ignore
        datasetLayer = map.getDatasetFeatureLayer(datasetId);
        datasetLayer.style = applyStyle;

        datasetLayer.addListener("click", handleClick);
        datasetLayer.addListener("mousemove", handleMouseMove);

        const inputField = document.getElementById("pac-input"); // Replace with your input element ID
        const autocomplete = new Autocomplete(inputField);

        autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace();
            if (place) {
                // Update map center based on selected address
                map.setCenter(place.geometry.location);
                map.setZoom(16);
            }
        });

        // Map event listener.
        map.addListener("mousemove", () => {
            // If the map gets a mousemove, that means there are no feature layers
            // with listeners registered under the mouse, so we clear the last
            // interacted feature ids.
            if (lastInteractedFeatureIds?.length) {
                lastInteractedFeatureIds = [];
                datasetLayer.style = applyStyle;
            }
        });
        createAttribution(map, "Data source: NYC Open Data");
        createAttribution(
            map,
            "The data included in this document is from www.openstreetmap.org. The data is made available under ODbL.",
        );
    }

    function applyStyle(/* FeatureStyleFunctionOptions */ params) {
        const datasetFeature = params.feature;
        //@ts-ignore
        if (
            lastClickedFeatureIds.includes(
                datasetFeature.datasetAttributes[ID_ATTRIBUTE_NAME],
            )
        ) {
            return STYLE_CLICKED;
        }
        //@ts-ignore
        if (
            lastInteractedFeatureIds.includes(
                datasetFeature.datasetAttributes[ID_ATTRIBUTE_NAME],
            )
        ) {
            return STYLE_MOUSE_MOVE;
        }
        return STYLE_DEFAULT;
    }

    function createAttribution(map: google.maps.Map, label: string) {
        const attributionDiv = document.createElement("div");
        const attributionLabel = document.createElement("div");

        // Define CSS styles.
        attributionLabel.style.backgroundColor = "#fff";
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

    return <>
        <input id="pac-input" type="text" placeholder="Enter a location"/>
        <div id="map" className={styles.map}></div>
    </>
};
