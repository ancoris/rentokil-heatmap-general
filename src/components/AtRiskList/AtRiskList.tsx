import { useEffect, useState, type FunctionComponent } from "react";
import {
    ID_ATTRIBUTE_NAME,
    featureIdIsRentokilCustomer,
} from "../geoJsonUtils";
import styles from "./AtRiskList.module.css";
import {
    STYLE_CLICKED,
    STYLE_CUSTOMER,
    STYLE_NON_CUSTOMER,
    toLatLng,
} from "../mapUtils";
import geoJson from "../../assets/export.geojson";

const atRisk = [
    "way/98525966",
    "way/98531948",
    "way/98535866",
    "way/98704375",
    "way/98820390",
    "way/157757515",
    "way/164010931",
    "way/230252979",
    "way/342715790",
    "way/424600551",
    "way/457644919",
    "way/559946374",
    "way/697648756",
    "way/988977529",
    "way/1178308379",
];

type AtRiskListProps = {
    handleClick: (featureId: string, coord: google.maps.LatLng) => void;
};

export const AtRiskList: FunctionComponent<AtRiskListProps> = ({
    handleClick,
}) => {
    const [toEdit, setToEdit] = useState<any[]>([]);
    const [isZoomChanged, setIsZoomChanged] = useState<boolean>(false);

    const addListenersOnPolygon = function (
        polygon: google.maps.Polygon,
        featureId: string,
        coord: google.maps.LatLng,
    ) {
        google.maps.event.addListener(polygon, "click", function () {
            handleClick(featureId, coord);
        });
    };

    useEffect(() => {
        const newFeatures: any[] = [];
        atRisk.forEach((featureId) => {
            const foundFeature = geoJson.features.find(
                (feature) =>
                    feature.properties[ID_ATTRIBUTE_NAME] === featureId,
            );
            newFeatures.push(foundFeature);
        });
        setToEdit(newFeatures);
    }, []);

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
                editable: false,
                ...editableStyle,
            });

            const miniMap = new google.maps.Map(miniMapContainer, {
                mapTypeId: "satellite",
                mapTypeControl: false,
                streetViewControl: false,
                zoomControl: false,
                draggable: false,
                scrollwheel: false,
                disableDoubleClickZoom: true,
                fullscreenControl: false,
                clickableIcons: false,
                rotateControl: true,
                tilt: 0,
            });
            featureToEdit.setMap(miniMap);

            addListenersOnPolygon(
                featureToEdit,
                featureId,
                toLatLng(feature.geometry.coordinates[0][0]),
            );

            measureAdjustedArea(featureToEdit, miniMap);
        });
    }, [isZoomChanged, toEdit, setIsZoomChanged]);

    const measureAdjustedArea = (
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
    };

    return (
        <>
            <div className={styles.listWrapper}>
                <h1 className={styles.heading}>Locations to review</h1>
                {toEdit.map((feature) => {
                    console.log(feature);
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
    );
};
