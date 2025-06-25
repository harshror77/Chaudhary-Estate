
import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Container } from '../components/index';
import L from 'leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet-geosearch/dist/geosearch.css';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

// Map container style
const mapContainerStyle = {
  height: '400px',
  width: '100%',
  borderRadius: '12px',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
};

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const AddProperty = () => {
  // Form state
  const [propertyData, setPropertyData] = useState({
    title: '',
    description: '',
    price: '',
    propertyType: '',
    bedrooms: '',
    bathrooms: '',
    area: '',
  });

  // Image upload state
  const [files, setFiles] = useState([]);
  const { getRootProps, getInputProps } = useDropzone({
    accept: 'image/*',
    onDrop: (acceptedFiles) => {
      setFiles(
        acceptedFiles.map((file) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          })
        )
      );
    },
  });

  // Location state
  const [address, setAddress] = useState('');
  const [position, setPosition] = useState([28.7041, 77.1025]);

  // Submission state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Location marker component
  function LocationMarker() {
    const map = useMap();

    useEffect(() => {
      const provider = new OpenStreetMapProvider();
      const searchControl = new GeoSearchControl({
        provider,
        style: 'bar',
        showMarker: true,
        autoClose: true,
        retainZoomLevel: false,
        animateZoom: true,
        searchLabel: 'Enter address...',
        autoComplete: true,
        autoCompleteDelay: 200,
      });

      map.addControl(searchControl);

      map.on('geosearch/showlocation', (result) => {
        const newPos = [result.location.y, result.location.x];
        setPosition(newPos);
        setAddress(result.location.label);
        map.flyTo(newPos, 15);
      });

      return () => map.removeControl(searchControl);
    }, [map]);

    useMapEvents({
      click(e) {
        const newPos = [e.latlng.lat, e.latlng.lng];
        setPosition(newPos);

        // Reverse geocode clicked location
        fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${newPos[0]}&lon=${newPos[1]}`
        )
          .then((res) => res.json())
          .then((data) => {
            if (data.display_name) {
              setAddress(data.display_name);
            }
          });
      },
    });

    return position ? <Marker position={position} /> : null;
  }

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPropertyData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (!propertyData.title.trim()) {
      setError('Property title is required');
      setLoading(false);
      return;
    }

    if (!propertyData.price || isNaN(propertyData.price)) {
      setError('Valid price is required');
      setLoading(false);
      return;
    }

    if (!address || position.length !== 2) {
      setError('Please select a valid location');
      setLoading(false);
      return;
    }

    if (files.length === 0) {
      setError('Please upload at least one property image');
      setLoading(false);
      return;
    }

    // Prepare form data
    const formData = new FormData();
    formData.append('title', propertyData.title);
    formData.append('description', propertyData.description);
    formData.append('price', propertyData.price);
    formData.append('propertyType', propertyData.propertyType);
    formData.append('address', address);
    formData.append('latitude', position[0]);
    formData.append('longitude', position[1]);

    files.forEach((file) => {
      formData.append('images', file);
    });

    const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/property/upload`,formData,{withCredentials:true});

    setTimeout(() => {
      setLoading(false);
      alert('Property listed successfully!');
      // Reset form
      setPropertyData({
        title: '',
        description: '',
        price: '',
        propertyType: '',
        bedrooms: '',
        bathrooms: '',
        area: '',
      });
      setFiles([]);
      setAddress('');
      setPosition([28.7041, 77.1025]);
    }, 2000);
  };

  return (
    <Container>
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8 py-8">
        <h1 className="text-3xl font-bold text-gray-800">List New Property</h1>

        {/* Error display */}
        {error && (
          <div className="p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>
        )}

        {/* Image upload section */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Property Images</h2>
          <div
            {...getRootProps({ className: 'dropzone' })}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
          >
            <input {...getInputProps()} />
            <p className="text-gray-500">
              Drag & drop property photos here, or click to select
            </p>
            <div className="mt-4 grid grid-cols-4 gap-4">
              {files.map((file) => (
                <div
                  key={file.name}
                  className="relative h-32 rounded-lg overflow-hidden"
                >
                  <img
                    src={file.preview}
                    alt="preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Property details form */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property Title
            </label>
            <input
              type="text"
              name="title"
              className="w-full p-3 border rounded-lg"
              value={propertyData.title}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property Type
            </label>
            <select
              name="propertyType"
              className="w-full p-3 border rounded-lg"
              value={propertyData.propertyType}
              onChange={handleInputChange}
            >
              <option value="">Select Type</option>
              <option value="house">House</option>
              <option value="apartment">Apartment</option>
              <option value="villa">Villa</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price ($)
            </label>
            <input
              type="number"
              name="price"
              className="w-full p-3 border rounded-lg"
              value={propertyData.price}
              onChange={handleInputChange}
            />
          </div>
        </section>

        {/* Location section */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Property Location</h2>
          <div className="space-y-4">
            <div className="p-3 border rounded-lg bg-gray-50">
              Selected Address: {address || 'No address selected'}
            </div>
            <MapContainer center={position} zoom={13} style={mapContainerStyle}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <LocationMarker />
            </MapContainer>
          </div>
        </section>

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 px-6 rounded-lg transition-colors ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {loading ? 'Submitting...' : 'List Property'}
        </button>
      </form>
    </Container>
  );
};

export default AddProperty;