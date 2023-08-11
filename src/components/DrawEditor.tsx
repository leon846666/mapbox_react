import React, { useEffect, useRef } from 'react';
import MapboxDraw, { MapboxDrawControls } from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import * as turf from '@turf/turf';
import { Position } from '@turf/turf';
import { Button } from 'react-bootstrap';
import { FaSave } from 'react-icons/fa';
import booleanIntersects from '@turf/boolean-intersects';
import { AnySourceImpl } from 'mapbox-gl';
import { Alert } from 'antd';


interface DrawControlProps {
    map: mapboxgl.Map | null;
    close: () => void;
    coordinates: Position[][];
    onDrawingChange?: (isDrawing: boolean) => void;
}

const DrawControl: React.FC<DrawControlProps> = ({ map, close, coordinates, onDrawingChange }) => {

    const coordinatesRef = useRef(coordinates);
    useEffect(() => {
        coordinatesRef.current = coordinates;
    }, [coordinates]);


    const drawRef = useRef<MapboxDraw | null>(null);



    useEffect(() => {
        if (map) {


            drawRef.current = new MapboxDraw({
                displayControlsDefault: false,
                controls: {
                    polygon: true,
                    trash: true,
                },
            });

            map.addControl(drawRef.current, 'top-left');


            const handleModeChange = function (event: any) {
                if (onDrawingChange) {
                    onDrawingChange(event.mode === 'draw_polygon');
                }
            };

            const handleRightClick = (e: any) => {
                // check if is drawing
                if (drawRef.current) {
                    const mode = drawRef.current.getMode();
                    console.log("mode ", mode)

                    if (mode === 'draw_polygon' || mode === 'direct_select') {
                        var name = ""; // popup an window for the name of the polygon
                        if (name !== undefined) {
                            while (name.trim().length <= 0) {
                                name = prompt("Please enter a name for this paddock:", "") as string
                                const activeFeatures = drawRef.current.getAll();
                                if (activeFeatures.features.length > 0) {
                                    const latestFeature = activeFeatures.features[0];
                                    if (latestFeature.properties) {

                                        if (map.getLayer('paddock-name-label')) {
                                            map.removeLayer('paddock-name-label')
                                            map.removeSource('paddock-name-label')
                                        }

                                        if (map.getLayer('area-label')) {
                                            map.removeLayer('area-label')
                                            map.removeSource('area-label')
                                        }

                                        console.log(latestFeature)
                                        const coordinates = (latestFeature.geometry as turf.Polygon).coordinates;

                                        const center = turf.center(turf.polygon(coordinates));
                                        const area = turf.area((turf.polygon(coordinates)));
                                        latestFeature.properties.Paddock = name;
                                        latestFeature.properties.Area = area.toFixed(2);
                                        drawRef.current.add(latestFeature);

                                        map.addSource('paddock-name-label', {
                                            type: 'geojson',
                                            data: center
                                        });
                                        map.addLayer({
                                            id: 'paddock-name-label',
                                            type: 'symbol',
                                            source: 'paddock-name-label',
                                            layout: {
                                                'text-field': `Paddock: ${name },\n Area : ${area.toFixed(2)} m²`,
                                                'text-anchor': 'center',
                                                'text-offset': [0, 0],
                                                'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
                                                'text-size': 8
                                            }
                                        });
                                    }
                                }
                            }

                        }

                        drawRef.current.changeMode('simple_select'); // 更改为选择模式
                    }
                }

            };

            map.on('contextmenu', handleRightClick);


            // Adding the event listener
            map.on('draw.modechange', handleModeChange);

            map.on('draw.create', validateFeature);
            map.on('draw.update', validateFeature);
            map.on('draw.delete', featuredelete);

            return () => {

                if (drawRef.current) {
                    map.removeControl(drawRef.current);
                }

                // Removing the event listener
                map.off('draw.modechange', handleModeChange);

                map.off('draw.create', validateFeature);
                map.off('draw.update', validateFeature);
                map.off('draw.delete', featuredelete);
                map.off('contextmenu', handleRightClick);

            };
        }
    }, [map, onDrawingChange]);

    const validateFeature = (event: any) => {
        console.log(coordinatesRef.current)
        // if the is drawing inside of a polygon
        if (coordinatesRef.current.length > 0) {
            const feature = event.features[0];
            const BOUNDS_POLYGON = turf.polygon(coordinatesRef.current);
            const contains = turf.booleanContains(BOUNDS_POLYGON, feature)
            if (!contains) {
                drawRef.current?.delete(feature.id);
                <Alert message='The drawn area is out of bounds!' type="error" />
            } else {

            }
        }
        else {
            console.log("Drawing new polygon")

        }
        const drawRefData = drawRef.current?.getAll() || { features: [] }
        console.log("drawRefData", drawRefData)
        if (map && drawRefData.features.length > 0) {
            const drawnPolygon = event.features[0];
           let name= event.features[0].properties.Paddock;
            const area = turf.area(drawnPolygon);
            if (map.getLayer('area-label')) {
                map.removeLayer('area-label');
                map.removeSource('area-label');
            }
            if (map.getLayer('paddock-name-label')) {
                map.removeLayer('paddock-name-label')
                map.removeSource('paddock-name-label')
            }


            const center = turf.center(drawnPolygon);
            map.addSource('area-label', {
                type: 'geojson',
                data: center
            });
           const paddockProperties= name?`Paddock: ${name },\n Area : ${area.toFixed(2)} m²`: `Area : ${area.toFixed(2)} m²`
            map.addLayer({
                id: 'area-label',
                type: 'symbol',
                source: 'area-label',
                layout: {
                    'text-field':paddockProperties ,
                    'text-anchor': 'center',
                    'text-offset': [0, 0],
                    'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
                    'text-size': 10
                }
            });

        }

    };

    const featuredelete = (event: any) => {
        const feature = event.features[0];
        console.log("delte is ")
        drawRef.current?.delete(feature.id);
        if (map) {
            map.removeLayer('area-label')
            map.removeSource('area-label')
        }

    };

    const handleSaveClick = () => {
        if (drawRef.current) {
            const allData = drawRef.current.getAll();
            // Handle the data as needed. E.g., send it to the server, etc.
            console.log(allData);
            const myData: AnySourceImpl | undefined = map?.getSource("myData");
            if (myData) {

                const olDdata = (myData as any)._data;
                console.log("olDdata ", olDdata)
                console.log("geometry ", allData.features[0].geometry)

                // const newPolygon = turf.polygon(polygons);
                console.log("olDdata", olDdata)
                if (booleanIntersects(allData.features[0], olDdata)) {
                    // The polygons intersect or touch each other
                    alert('The new polygon cannot touch or overlap the existing polygon.');
                    
                } else {
                    alert('The new polygon is good.');
                    olDdata.features.push(allData.features[0]);
                    console.log(olDdata)
                }
            }

        }
    }
    return (
        <div className='mapboxgl-control-container'>
            <div className='mapboxgl-ctrl-top-left'>
                <div className="mapboxgl-ctrl-group mapboxgl-ctrl">
                    <Button onClick={handleSaveClick} className="mapbox-gl-draw_ctrl-draw-btn" style={{ position: 'absolute', top: 60, backgroundColor: 'white', border: '0.5!important' }} >
                        <FaSave size="1.2em" color='black' />
                    </Button>
                </div>
            </div>
        </div>
    );

};

export default DrawControl;
