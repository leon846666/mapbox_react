import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl, { LngLat } from 'mapbox-gl';


interface PaddockParams {
  paddockName?: string;
  [key: string]: string | undefined;
}

const PaddockDetail: React.FC = () => {
  const { paddockName = ''} = useParams<PaddockParams>();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const paddock= JSON.parse(queryParams.get('feature')|| '');
  console.log(paddock)

  const [map, setMap] = useState<mapboxgl.Map | null>(null);

  useEffect(() => {
    mapboxgl.accessToken = 'pk.eyJ1IjoibGVvbjgyMCIsImEiOiJjbGtzeW10eHEwMDV3M2hvY3ZtaHN4Zm5iIn0.Z843hAkBHV0vf1nCyvsfJg'; // 你的Mapbox access token
    debugger
    const initializeMap = ({ setMap, mapContainer }: any) => {
      const map = new mapboxgl.Map({
        container: mapContainer,
        style: 'mapbox://styles/mapbox/streets-v11', // 或其他你喜欢的样式
        zoom: 14,
        center: [175.4962545633316, -40.339871437780744] // 初始中心坐标，你可以更改它
      });


      map.on('load', () => {
        setMap(map);
        map.addSource('myPaddockData', {
          type: 'geojson',
          data: paddock,
        });

        map.addLayer({
          id: 'myStatusLayer',
          type: 'fill',
          source: 'myPaddockData',
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
          source: 'myPaddockData',
          layout: {},
          paint: {
            'line-color': '#fff',
            'line-width': 3,
          },
        });
     
  
        const bounds = [paddock].reduce((bounds: any, feature: any) => {
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
     
        //set the min zoom
        map.setMinZoom(mapInitZoom-1)
      });

    };

    if (!map) initializeMap({ setMap, mapContainer: 'map-container' });
  }, [map]);

  return (
    <div>
      <h1>Paddock : {paddock.properties.Paddock}</h1>
      <div id="map-container" style={{ width: '100%', height: '500px' }}></div>
    </div>
  );
};


export default PaddockDetail;
