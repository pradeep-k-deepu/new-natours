export const getMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoicHJhZGVlcC1rLWRlZXB1IiwiYSI6ImNrcnE0YWh3MDA0eW8ycW8waGowOWtvZ2cifQ.D20I95BYzr3u99xEwPyrRA';
  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/pradeep-k-deepu/ckomhpq5o840218mu48fdev2l',
    scrollZoom: false,
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    //create element
    let el = document.createElement('div');
    el.className = 'marker';
    var marker = new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    new mapboxgl.Popup({
      closeOnClick: false,
      offset: 30,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`Day ${loc.day}. ${loc.description}`)
      .addTo(map);

    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};
