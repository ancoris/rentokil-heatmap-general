import {
    type ReactNode,
    useEffect,
    useState,
    type FunctionComponent,
} from "react";
import {
    ID_ATTRIBUTE_NAME,
    featureIdIsRentokilCustomer,
    getFeatureById,
} from "../geoJsonUtils";
import styles from "./PolygonEditor.module.css";
import {
    STYLE_CLICKED,
    STYLE_CUSTOMER,
    STYLE_NON_CUSTOMER,
    toLatLng,
} from "../mapUtils";
import { PolygonArea } from "../PolygonArea";

type PolygonEditorProps = {
    lastClickedFeatureIds: string[];
};

export const PolygonEditor: FunctionComponent<PolygonEditorProps> = ({
    lastClickedFeatureIds,
}) => {
    const [toEdit, setToEdit] = useState<any[]>([]);
    const [isDirty, setIsDirty] = useState<boolean>(false);
    const [isZoomChanged, setIsZoomChanged] = useState<boolean>(false);
    const [polygonAreas, setPolygonAreas] = useState<ReactNode[]>([]);

    useEffect(() => {
        setToEdit(lastClickedFeatureIds.map(getFeatureById));
    }, [lastClickedFeatureIds]);

    useEffect(() => {
        setPolygonAreas(Array(toEdit.length).fill(null));
        toEdit.forEach((feature, index) => {
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
            const editableStyle = {
                ...(featureIdIsRentokilCustomer(featureId)
                    ? STYLE_CUSTOMER
                    : STYLE_NON_CUSTOMER),
                ...STYLE_CLICKED,
            };
            const featureToEdit = new google.maps.Polygon({
                paths: feature.geometry.coordinates.map((coord: number[][]) =>
                    coord.map(toLatLng),
                ),
                editable: true,
                ...editableStyle,
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
                tilt: 0,
            });
            featureToEdit.setMap(miniMap);

            // todo: not working
            // miniMap.addListener("zoom_changed", () => {
            //     console.log("zoom_changed", setIsZoomChanged, isZoomChanged);
            //     setIsZoomChanged(true);
            // });
            ["insert_at", "remove_at", "set_at"].forEach((eventName) => {
                featureToEdit.getPath().addListener(eventName, () => {
                    setIsDirty(true);
                    measureAdjustedArea(index, featureToEdit, miniMap);
                });
            });
            measureAdjustedArea(index, featureToEdit, miniMap);
        });
    }, [isZoomChanged, toEdit, setPolygonAreas, setIsDirty, setIsZoomChanged]);

    const measureAdjustedArea = (
        index: number,
        featureToEdit: google.maps.Polygon,
        miniMap: google.maps.Map,
    ): void => {
        const polyBounds = new google.maps.LatLngBounds();
        featureToEdit.getPath().forEach((segment) => {
            polyBounds.extend(segment);
        });
        if (!isZoomChanged) {
            miniMap.fitBounds(polyBounds);
        }
        setPolygonAreas((prev) => {
            const newAreas = [...prev];
            newAreas[index] = (
                <PolygonArea
                    key={featureToEdit.get("featureId")}
                    {...{
                        polyPaths: [[featureToEdit.getPath()]],
                        prefix: "Adjusted",
                    }}
                />
            );
            return newAreas;
        });
    };

    const reset = (): void => {
        setIsDirty(false);
        setIsZoomChanged(false);
        setToEdit(structuredClone(toEdit));
    };

    return (
        <>
            {toEdit.length > 0 ? (
                <>
                    <div className={styles.actionsWrapper}>
                        <button className={styles.reset} onClick={reset}>
                            Reset Editor{toEdit.length === 1 ? "" : "s"}
                        </button>
                        <span>Drag points to edit area</span>
                    </div>
                    <div className={styles.editorsWrapper}>
                        {toEdit.map((feature, index) => {
                            const featureId = feature.properties[
                                ID_ATTRIBUTE_NAME
                            ] as string;
                            return (
                                <div key={featureId}>
                                    <div
                                        className={styles.miniMap}
                                        data-featureid={featureId}
                                    ></div>
                                    {isDirty ? polygonAreas[index] : null}
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
