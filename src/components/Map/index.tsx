import styles from "./Map.module.css";

export const ID_ATTRIBUTE_NAME = "@id";

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
    setLastClickedFeatureIds,
}: {
    setLastClickedFeatureIds: React.Dispatch<React.SetStateAction<string[]>>;
}) => {
    let map: google.maps.Map;
    let lastInteractedFeatureIds: string[] = [];
    let lastClickedFeatureIds: string[] = [];
    let datasetLayer: google.maps.FeatureLayer;

    function handleClick(e: google.maps.FeatureMouseEvent) {
        if (e.features) {
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

    async function initMap() {
        // Request needed libraries.
        const { Map } = (await google.maps.importLibrary(
            "maps",
        )) as google.maps.MapsLibrary;
        const { Autocomplete } = (await google.maps.importLibrary(
            "places",
        )) as google.maps.PlacesLibrary;

        const position = { lat: 40.735657, lng: -74.172363 }; // Newark, NJ
        map = new Map(
            document.getElementById("map") as HTMLElement,
            {
                zoom: 16,
                maxZoom: 16, // any further in and the buildings block the overlay
                center: position,
                mapId: "81d6db83c3b8a7fc",
                mapTypeControl: true,
                streetViewControl: false,
            } as google.maps.MapOptions,
        );

        // Dataset ID for Newark found by jazim, shown here .
        const datasetId = "2b8bdf5a-5fbf-4706-96f3-4bdee1077c72";

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
        return STYLE_DEFAULT;
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
            <input id="pac-input" type="text" placeholder="Enter a location" />
            <div id="map" className={styles.map}></div>
        </>
    );
};
