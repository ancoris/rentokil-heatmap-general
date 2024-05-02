import { useEffect, useState, type FunctionComponent } from "react";
import { ID_ATTRIBUTE_NAME } from "../Map";
import geoJson from "../../assets/export.geojson";
import styles from "./PolygonEditor.module.css";
import { toLatLngLiteral } from "../mapUtils";

type PolygonEditorProps = {
    lastClickedFeatureIds: string[];
};

export const PolygonEditor: FunctionComponent<PolygonEditorProps> = ({
    lastClickedFeatureIds,
}) => {
    const [toEdit, setToEdit] = useState<unknown[]>([]);

    useEffect(() => {
        if (geoJson) {
            setToEdit(
                lastClickedFeatureIds.map((clickedId) => {
                    const foundFeature = geoJson.features.find(
                        (feature) =>
                            feature.properties[ID_ATTRIBUTE_NAME] === clickedId,
                    );
                    if (
                        foundFeature &&
                        foundFeature.geometry.type === "Polygon"
                    ) {
                        return foundFeature;
                    }
                }),
            );
        }
    }, [lastClickedFeatureIds]);

    useEffect(() => {
        toEdit.forEach((feature) => {
            const featureId = feature.properties[ID_ATTRIBUTE_NAME] as string;
            const miniMapContainer = document.querySelector<HTMLDivElement>(
                `div.${styles.miniMap}[data-featureid="${featureId}"]`,
            );
            if (!miniMapContainer) {
                console.error(
                    "missing miniMapContainer div for this feature",
                    featureId,
                );
                return;
            }
            const featureToEdit = new google.maps.Polygon({
                paths: feature.geometry.coordinates[0].map(toLatLngLiteral),
                strokeColor: "#FF0000",
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: "#FF0000",
                fillOpacity: 0.35,
                editable: true,
            });

            const polyBounds = new google.maps.LatLngBounds();
            featureToEdit.getPath().forEach((vector) => {
                polyBounds.extend(vector);
            });

            const miniMap = new google.maps.Map(miniMapContainer, {
                mapTypeId: "satellite",
                mapTypeControl: true,
                mapTypeControlOptions: {
                    style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
                    mapTypeIds: ["roadmap", "satellite"],
                },
                streetViewControl: false,
                zoomControl: false,
                fullscreenControl: false,
                clickableIcons: false,
                rotateControl: true,
            });
            miniMap.fitBounds(polyBounds);

            featureToEdit.setMap(miniMap);
        });
    }, [toEdit]);

    return (
        <>
            {toEdit.length > 0 ? (
                <>
                    <h2>Edit Polygon{toEdit.length === 1 ? "" : "s"}</h2>
                    <div>
                        {toEdit.map((feature) => {
                            const featureId = feature.properties[
                                ID_ATTRIBUTE_NAME
                            ] as string;
                            return (
                                <div key={featureId}>
                                    <div
                                        className={styles.miniMap}
                                        data-featureid={featureId}
                                    ></div>
                                </div>
                            );
                        })}
                    </div>
                </>
            ) : (
                "No Polygon to Edit."
            )}
        </>
    );
};
