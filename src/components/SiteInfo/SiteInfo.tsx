import { FunctionComponent, useEffect, useState } from "react";
import styles from "./SiteInfo.module.css";
import * as GMPX from "@googlemaps/extended-component-library/react";
import geoJson from "../../assets/export.geojson.ts";
import { ID_ATTRIBUTE_NAME } from "../geoJsonUtils";

const getCenterLatLng = (latlngArray: number[][]): google.maps.LatLng => {
    if (latlngArray.length === 0) {
        throw new Error("Empty array passed.");
    }

    let totalLat = 0;
    let totalLng = 0;

    for (const latlng of latlngArray) {
        if (latlng.length !== 2) {
            throw new Error("Invalid coordinate format.");
        }
        totalLat += latlng[1];
        totalLng += latlng[0];
    }

    const centerLat = totalLat / latlngArray.length;
    const centerLng = totalLng / latlngArray.length;

    const latLng = new google.maps.LatLng({
        lat: centerLat,
        lng: centerLng,
    });

    return latLng;
};

const doesNotContainAny = (types: string[], restricted: string[]) => {
    return !restricted.some((item) => types.includes(item));
};

const filterResults = (results: google.maps.GeocoderResult[]) => {
    return results.filter((result) => {
        return doesNotContainAny(result.types, [
            "country",
            "political",
            "postal_code",
            "route",
            "plus_code",
        ]);
    });
};

type SiteInfoProps = {
    lastClickedFeatureIds: string[];
};

export const SiteInfo: FunctionComponent<SiteInfoProps> = ({
    lastClickedFeatureIds,
}) => {
    const [placeIds, setPlaceIds] = useState<string[]>([]);
    useEffect(() => {
        (
            google.maps.importLibrary(
                "geocoding",
            ) as Promise<google.maps.GeocodingLibrary>
        )
            .then((lib: google.maps.GeocodingLibrary) => {
                if (
                    lib.Geocoder &&
                    lastClickedFeatureIds?.length > 0 &&
                    geoJson
                ) {
                    const foundFeature = geoJson.features.find(
                        (feature) =>
                            feature.properties[ID_ATTRIBUTE_NAME] ===
                            lastClickedFeatureIds[0],
                    );
                    if (
                        foundFeature &&
                        foundFeature.geometry.type === "Polygon"
                    ) {
                        const latLng = getCenterLatLng(
                            foundFeature.geometry.coordinates[0],
                        );
                        const geocoder = new lib.Geocoder();
                        geocoder.geocode(
                            { location: latLng },
                            function (results, status) {
                                if (status == "OK" && results) {
                                    setPlaceIds(
                                        filterResults(results).map((result) => {
                                            return result.place_id;
                                        }),
                                    );
                                } else {
                                    setPlaceIds([]);
                                    console.error(
                                        `Geocode was not successful: ${status}`,
                                    );
                                }
                            },
                        );
                    }
                }
            })
            .catch((error: unknown) => {
                console.error("Error importing geometry library: ", error);
            });
    }, [lastClickedFeatureIds]);

    return (
        <div className={styles.siteInfoOuter}>
            {placeIds.length > 0 &&
                placeIds.map((id) => {
                    return (
                        <section key={id}>
                            <GMPX.APILoader
                                apiKey={
                                    "AIzaSyBWjMNpB8OfCyVhcARQUMBh9bDzrcxBOpc"
                                }
                            />
                            <GMPX.PlaceOverview
                                place={id}
                                googleLogoAlreadyDisplayed
                            ></GMPX.PlaceOverview>
                        </section>
                    );
                })}
            ;
        </div>
    );
};
