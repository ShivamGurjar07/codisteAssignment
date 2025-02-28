import { useEffect, useState, useContext } from "react";
import { fetchEntries, deleteEntry } from "../api/api";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import TravelForm from "./TravelForm";
import EditTravelForm from "./EditTravelForm";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

const TravelList = () => {
  const { user } = useContext(AuthContext);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingEntry, setEditingEntry] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");

  const loadEntries = async () => {
    if (!user) return;
    try {
      const { data } = await fetchEntries(user.token);
      setEntries(data || []);
    } catch (error) {
      toast.error("Error fetching entries");
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteEntry(id, user.token);
      toast.success("Entry deleted!");
      setEntries(entries.filter((entry) => entry._id !== id));
    } catch (error) {
      toast.error("Error deleting entry");
    }
  };

  const handleEdit = (entry) => {
    setEditingEntry(entry);
  };

  const handleEditSuccess = (updatedEntry) => {
    setEntries(
      entries.map((entry) =>
        entry._id === updatedEntry._id ? updatedEntry : entry
      )
    );
    setEditingEntry(null);
  };

  const handleViewOnMap = (entry) => {
    setSelectedLocation(entry);
    setLat(entry.lat || "");
    setLng(entry.lng || "");
  };

  useEffect(() => {
    if (user) loadEntries();
  }, [user]);

  return (
    <div className="travel_list">
      <TravelForm refreshEntries={loadEntries} />
      <h2 className="h1">My Travel Entries</h2>

      {loading ? (
        <p>Loading entries...</p>
      ) : entries.length > 0 ? (
        <div className="travel-grid">
          {entries.map((entry) => (
            <div key={entry._id} className="travel-card">
              {entry.imageUrl && (
                <img
                  src={entry.imageUrl}
                  alt="travel"
                  className="travel-image"
                />
              )}
              <div className="travel-content">
                <h3>{entry.location}</h3>
                <p className="travel-date">
                  {new Date(entry.date).toDateString()}
                </p>
                <p>{entry.description}</p>
              </div>
              <div className="button-group">
                <button
                  className="edit-button"
                  onClick={() => handleEdit(entry)}
                >
                  Edit
                </button>
                <button
                  className="delete-button"
                  onClick={() => handleDelete(entry._id)}
                >
                  Delete
                </button>
                <button
                  className="view-map-button"
                  onClick={() => handleViewOnMap(entry)}
                >
                  View in Map
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No travel entries found.</p>
      )}

      {editingEntry && (
        <EditTravelForm
          entry={editingEntry}
          onClose={() => setEditingEntry(null)}
          onUpdate={handleEditSuccess}
        />
      )}

      {/* {selectedLocation && (
        <div className="modal">
          <div className="modal-content">
            <h3>Enter Coordinates for {selectedLocation.locationName}</h3>
            <input
              type="number"
              placeholder="Latitude"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
            />
            <input
              type="number"
              placeholder="Longitude"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
            />
            <button onClick={() => setSelectedLocation(null)}>Close</button>

            

            {lat && lng && (
              <MapContainer
                center={[lat, lng]}
                zoom={12}
                style={{ width: "100%", height: "50vh" }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[lat, lng]}>
                  <Popup>{selectedLocation.locationName}</Popup>
                </Marker>
              </MapContainer>
            )}
          </div>
        </div>
      )} */}

      {selectedLocation && (
        <div className="modal modal-large">
          <div className="modal-content">
            <h3>Enter Coordinates for {selectedLocation.locationName}</h3>
            <input
              type="number"
              placeholder="Latitude"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
            />
            <input
              type="number"
              placeholder="Longitude"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
            />
            <button onClick={() => setSelectedLocation(null)}>Close</button>

            {lat && lng && (
              <MapContainer
                center={[lat, lng]}
                zoom={12}
                style={{ width: "100%", height: "60vh" }} // Increased map size
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[lat, lng]}>
                  <Popup>{selectedLocation.locationName}</Popup>
                </Marker>
              </MapContainer>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TravelList;
