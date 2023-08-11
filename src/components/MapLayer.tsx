import React, { useEffect, useState } from 'react';
import axios from 'axios';
import mapboxgl, { Coordinate } from 'mapbox-gl';
import { useNavigate } from 'react-router-dom';
import { Button, Tooltip, Overlay } from 'react-bootstrap';
import { FaRegQuestionCircle, } from 'react-icons/fa';
import { FaDrawPolygon } from "react-icons/fa";
import IconEditor from './iconEditor';
import { features } from 'process';
import DrawControl from './DrawEditor';
import { Position } from '@turf/turf';


const MapLayer = () => {
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [clickedPaddock, setClickedPaddock] = useState<string | null>(null);
  const navigate = useNavigate();
  const [showHelp, setShowHelp] = useState(false);
  const [target, setTarget] = useState(null);
  var [showEditor, setShowEditor] = useState(false);
  var [showDrawEditor, setShowDrawEditor] = useState(false);
  var [showChild, setShowChild] = useState(false);
  var [minZoomInit, setMinZoomInit] = useState(0);
  const [isDrawing, setIsDrawing] = React.useState(false);
  const [coordinates, setCoordinates] = useState<Position[][]>([]);
  const isDrawingRef = React.useRef(isDrawing);

  useEffect(() => {
    isDrawingRef.current = isDrawing;
  }, [isDrawing]);

  const showTooltip = (event: any) => {
    setShowHelp(true);
    setTarget(event.target);
  };

  const hideTooltip = () => {
    setShowHelp(false);
  };



  // Open the IconEditor
  const showDrawEditorFunc = () => {
    console.log(showDrawEditor)
    showDrawEditor = !showDrawEditor
    setShowDrawEditor(showDrawEditor);
  };

  // Close the IconEditor
  const hideDrawEditor = () => {
    setShowDrawEditor(false);
  };


  useEffect(() => {
    console.log("minZoomInit", minZoomInit); // 这会在 minZoomInit 更新后打印新值
  }, [minZoomInit]);


  useEffect(() => {
    console.log("isDrawing", isDrawing); // 这会在 isDrawing 更新后打印新值
    if (!isDrawing) {

    }

  }, [isDrawing]);



  useEffect(() => {
    // Navigate to new page when clickedPaddock changes
    if (clickedPaddock) {
      navigate(`/info/${clickedPaddock}`);
    }
  }, [clickedPaddock, navigate]);

  useEffect(() => {
    mapboxgl.accessToken = 'pk.eyJ1IjoibGVvbjgyMCIsImEiOiJjbGtzeW10eHEwMDV3M2hvY3ZtaHN4Zm5iIn0.Z843hAkBHV0vf1nCyvsfJg';
    const mapObject = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
    });


    setMap(mapObject);
  }, []);

  useEffect(() => {
    if (map) {
      axios
        .get('/data/TrueS_copy.geojson')
        .then((response) => {
          const data = response.data;
          console.log(data)
          map.on('load', () => {

            const iconUrls = new Set<string>(data.features.map((feature: any) => feature.properties.icon));

            // Function to load images asynchronously
            const loadImage = (url: string) => {
              return new Promise((resolve, reject) => {
                map.loadImage(url, (error, image) => {
                  if (!url) {
                    resolve(null);
                    return;
                  }
                  if (error) {
                    reject(error);
                    return;
                  }
                  if (!image) {
                    reject(new Error(`Image at ${url} could not be loaded`));
                    return;
                  }
                  map.addImage(url, image);
                  resolve(null);
                });
              });
            };


            Promise.all([...iconUrls].map(loadImage))
              .then(() => {
                // Once all images are loaded, add the source and layers
                map.addSource('myData', {
                  type: 'geojson',
                  data: data,
                });

                map.addLayer({
                  id: 'myDataLayer',
                  type: 'fill',
                  source: 'myData',
                  layout: {},
                  paint: {
                    'fill-color': [
                      'match',
                      ['get', 'status'],
                      0,
                      '#000',
                      '#b2d695',
                    ],
                  },
                });

                map.addLayer({
                  id: 'polygon-outline',
                  type: 'line',
                  source: 'myData',
                  layout: {},
                  paint: {
                    'line-color': '#fff',
                    'line-width': 3,
                  },
                });
                let popWin: mapboxgl.Popup;
                map.on('click', 'myDataLayer', function (e) {
                  const paddName = e?.features?.[0].properties?.Paddock
                  const area = e?.features?.[0].properties?.Area
                  console.log("area   ",area)
                  const paddockFeature = e?.features?.[0]
                  console.log(isDrawing)
                  if (!isDrawingRef.current) {

                    popWin = new mapboxgl.Popup()
                      .setLngLat(e.lngLat)
                      .setHTML(
                        `<h4>Paddock Detail for: ${paddName},Area is ${area}</h4>
                      <button id="iconEditorButton">Add Icon</button>
                      <button id="drawEditorButton">Custom Polygon</button>
                      `
                      )
                      .addTo(map);

                  }

                  setTimeout(() => {
                    const iconEditorButton = document.getElementById('iconEditorButton');
                    if (iconEditorButton) {
                      iconEditorButton.addEventListener('click', function () {
                        showIconEditor();
                      });
                    }

                  }, 0);

                  setTimeout(() => {
                    const drawEditorButton = document.getElementById('drawEditorButton');
                    if (drawEditorButton) {
                      drawEditorButton.addEventListener('click', function () {
                        console.log(paddName)
                        // 更新图层样式使得除了activeId以外的所有polygon都显示为灰色
                        const currentFilter = map.getFilter('myDataLayer');
                        console.log("Current filter:", currentFilter);
                        map.setPaintProperty('myDataLayer', 'fill-color', [
                          'match',
                          ['get', 'Paddock'],
                          paddName,
                          '#b2d695', '#d1d1d1',
                        ]);

                        if (map.getLayer('myDataLayer')) {
                          console.log("'myDataLayer' exists");
                        } else {
                          console.warn("'myDataLayer' doesn't exist");
                        }

                        const bounds = [paddockFeature].reduce((bounds: any, feature: any) => {
                          if (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon') {
                            feature.geometry.coordinates.forEach((ring: any) => {
                              ring.forEach((coord: any) => {
                                bounds.extend(coord);
                              });
                            });
                          } else if (feature.geometry.type === 'LineString' || feature.geometry.type === 'MultiLineString') {
                            feature.geometry.coordinates.forEach((coord: any) => {
                              bounds.extend(coord);
                            });

                          } else if (feature.geometry.type === 'Point' || feature.geometry.type === 'MultiPoint') {
                            bounds.extend(feature.geometry.coordinates);
                          }
                          return bounds;
                        }, new mapboxgl.LngLatBounds());

                        map.fitBounds(bounds, { padding: 100, animate: false });

                        showDrawEditorFunc()
                        const geo = paddockFeature?.geometry || { type: "" }
                        if (geo.type === "Point" ||
                          geo.type === "LineString" ||
                          geo.type === "Polygon" ||
                          geo.type === "MultiPoint" ||
                          geo.type === "MultiLineString" ||
                          geo.type === "MultiPolygon") {
                          const coordinates = geo.coordinates;
                          console.log("coordinates", coordinates)
                          popWin.remove()
                          setCoordinates(coordinates as Position[][]);

                        }

                      });
                    }

                  },);


                });
                map.addLayer({
                  id: 'polygon-symbol',
                  type: 'symbol',
                  source: 'myData',
                  layout: {
                    'icon-image': [
                      'case',
                      ['has', 'icon'],
                      ['get', 'icon'],
                      ''
                    ], // use the icon property from each feature
                    'icon-allow-overlap': true,
                    'visibility': 'none', // initially set visibility to none
                    'icon-size': 0.05
                  }
                });


                map.on('dblclick', 'myDataLayer', function (e) {
                  var properties = e?.features?.[0]?.properties;
                  var paddock = properties?.Paddock;
                  setClickedPaddock(paddock);

                });
                console.log(data)
                const bounds = data.features.reduce((bounds: any, feature: any) => {
                  if (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon') {
                    feature.geometry.coordinates.forEach((ring: any) => {
                      ring.forEach((coord: any) => {
                        bounds.extend(coord);
                      });
                    });
                  } else if (feature.geometry.type === 'LineString' || feature.geometry.type === 'MultiLineString') {
                    feature.geometry.coordinates.forEach((coord: any) => {
                      bounds.extend(coord);
                    });

                  } else if (feature.geometry.type === 'Point' || feature.geometry.type === 'MultiPoint') {
                    bounds.extend(feature.geometry.coordinates);
                  }
                  return bounds;
                }, new mapboxgl.LngLatBounds());

                map.fitBounds(bounds, { padding: 30, animate: false });
                // get the init zoom
                let mapInitZoom = map.getZoom();
                map.on('zoom', () => {
                  // listen to the zoom changes , if it's smaller than the init zoom ,display the icon.
                  if (map.getZoom() > mapInitZoom + 0.5) {
                    map.setLayoutProperty('polygon-symbol', 'visibility', 'visible');
                  } else {
                    map.setLayoutProperty('polygon-symbol', 'visibility', 'none');
                    if (!isDrawing) {
                      map.setPaintProperty('myDataLayer', 'fill-color', [
                        'match',
                        ['get', 'status'],
                        0,
                        '#000',
                        '#b2d695',
                      ],);
                      setCoordinates([])
                    }


                  }
                });
                //set the min zoom
                map.setMinZoom(mapInitZoom);
                console.log(mapInitZoom)
                setMinZoomInit(mapInitZoom)
                console.log(minZoomInit)

              })
              .catch((error) => console.error('An error occurred:', error));
          });
        })
        .catch((error) => console.error('An error occurred:', error));
    }
  }, [map]);


  // Open the IconEditor
  const showIconEditor = () => {
    showEditor = !showEditor
    setShowEditor(showEditor);
  };

  // Close the IconEditor
  const hideIconEditor = () => {
    setShowEditor(false);
  };



  function handleGetDrawObject(draw: MapboxDraw): void {
    console.log("draw =>", draw);
  }

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <div id="map" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />
      <Button style={{ position: 'absolute', top: '30px', right: '30px', border: 'none', backgroundColor: 'transparent' }} onClick={showTooltip}>
        <FaRegQuestionCircle size="2em" color='black' />
      </Button>
      <Overlay target={target} show={showHelp} placement="left" rootClose={true} onHide={hideTooltip}>
        {props => (
          <Tooltip id="overlay-example" {...props} className='maptooltip'>
            Help text goes here
          </Tooltip>
        )}
      </Overlay>
      <div>
        <div style={{ position: 'absolute', top: '60px', right: '30px', border: 'none', backgroundColor: 'transparent' }}>
      
        {showEditor ? <IconEditor close={hideIconEditor} /> : null}
        </div>
        {showDrawEditor ? <DrawControl close={hideIconEditor}
          onDrawingChange={setIsDrawing}
          map={map} coordinates={coordinates} /> : null}
      </div>
      <Button style={{ position: 'absolute', top: '30px', left: '30px', border: 'none', backgroundColor: 'transparent' }} onClick={showDrawEditorFunc}>
        <FaDrawPolygon size="1.5em" color='black' />
      </Button>


    </div>
  );

};
export default MapLayer
