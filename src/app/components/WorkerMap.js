'use client';
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const workerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 12);
    }
  }, [center, map]);
  return null;
}

export default function WorkerMap({ workers, onWorkerClick }) {
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState([30.3753, 69.3451]); // Pakistan center

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = [position.coords.latitude, position.coords.longitude];
          setUserLocation(location);
          setMapCenter(location);
        },
        (error) => {
          console.log('Location access denied:', error);
        }
      );
    }
  }, []);

  return (
    <div className="relative w-full h-[500px] rounded-xl overflow-hidden shadow-lg border border-gray-200">
      <MapContainer
        center={mapCenter}
        zoom={6}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RecenterMap center={userLocation} />
        
        {userLocation && (
          <Marker position={userLocation} icon={userIcon}>
            <Popup>
              <div className="text-center">
                <strong>Your Location</strong>
              </div>
            </Popup>
          </Marker>
        )}

        {workers.map((worker) => {
          if (!worker.location?.coordinates) return null;
          const [lng, lat] = worker.location.coordinates;
          return (
            <Marker key={worker.id} position={[lat, lng]} icon={workerIcon}>
              <Popup>
                <div className="text-center">
                  <strong className="text-lg">{worker.name}</strong>
                  <p className="text-blue-600 font-medium">{worker.skill}</p>
                  <p className="text-gray-600 text-sm">{worker.city}</p>
                  <p className="text-yellow-500">⭐ {worker.rating.toFixed(1)}</p>
                  <button
                    onClick={() => onWorkerClick(worker.id)}
                    className="mt-2 bg-blue-600 text-white px-4 py-1 rounded-lg text-sm hover:bg-blue-700"
                  >
                    View Profile
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {userLocation && (
        <div className="absolute top-4 right-4 bg-white px-4 py-2 rounded-lg shadow-md z-[1000]">
          <p className="text-sm text-gray-600">📍 Your location detected</p>
        </div>
      )}
    </div>
  );
}
