import { useState, useEffect, type FunctionComponent } from "react";

const SQUARE_METRES_TO_SQUARE_FEET_FACTOR = 10.7639;

const { spherical } = await (google.maps.importLibrary(
    "geometry",
) as Promise<google.maps.GeometryLibrary>);

type PolygonAreaProps = {
    polyPaths:
        | (google.maps.LatLng[] | google.maps.MVCArray<google.maps.LatLng>)[][];
    prefix: string;
};

export const PolygonArea: FunctionComponent<PolygonAreaProps> = ({
    polyPaths,
    prefix,
}) => {
    const [displayArea, setDisplayArea] = useState<string>("");
    const [displayAreaNumber, setDisplayAreaNumber] = useState<number>(0);

    useEffect(() => {
        setDisplayArea(
            displayAreaNumber
                ? new Intl.NumberFormat("en-US", {
                      // This is an official unit type but ECMAScript doesn't support
                      // this particular unit yet.Currently, it only supports a subset
                      // of units.
                      // style: "unit",
                      // unit: "area-square-foot",
                      style: "decimal",
                      unitDisplay: "short",
                  }).format(
                      Math.ceil(
                          displayAreaNumber *
                              SQUARE_METRES_TO_SQUARE_FEET_FACTOR,
                      ),
                  )
                : "",
        );
    }, [displayAreaNumber]);

    useEffect(() => {
        setDisplayAreaNumber(
            polyPaths
                ?.map((polyPath) =>
                    polyPath
                        .map(spherical.computeArea)
                        .reduce((acc, curr) => acc + curr, 0),
                )
                .reduce((acc, curr) => acc + curr, 0) ?? 0,
        );
    }, [polyPaths]);

    return (
        <div>
            {prefix && displayArea
                ? `${prefix} area: ${displayArea} square foot.`
                : "Please select a bulding to see its area."}
        </div>
    );
};
