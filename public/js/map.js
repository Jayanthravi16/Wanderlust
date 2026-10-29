const mapElement = document.getElementById("map");
const coordinates = JSON.parse(mapElement.dataset.coordinates);
const map = new mapboxgl.Map({
  accessToken: mapElement.dataset.mapToken,
  container: "map",
  center: coordinates,
  zoom: 9,
});

const popupContent = document.createElement("div");
const popupHeading = document.createElement("h4");
popupHeading.textContent = mapElement.dataset.listingLocation;
const popupMessage = document.createElement("p");
popupMessage.textContent = "Exact location provided after booking";
popupContent.append(popupHeading, popupMessage);

new mapboxgl.Marker({ color: "red" })
  .setLngLat(coordinates)
  .setPopup(new mapboxgl.Popup({ offset: 25 }).setDOMContent(popupContent))
  .addTo(map);