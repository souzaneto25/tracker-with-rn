import { useEffect, useRef, useState } from 'react';
import { Button, StyleSheet, View } from 'react-native';
import { LocationObject, getCurrentPositionAsync, requestForegroundPermissionsAsync, watchPositionAsync, LocationAccuracy, LocationObjectCoords } from 'expo-location';
import MapView, { Circle, Marker, Polyline, LatLng } from 'react-native-maps';

type LngLatCoords = [number, number][][];

export default function App() {

  //settings
  const DELAY_IN_MINUTES = 1;
  const PLAYBACK_SPEED_DEFAULT = 5;

  const [location, setLocation] = useState<LocationObject | null>(null);
  const [listLocation, setListLocation] = useState<LocationObjectCoords[]>([]);

  const [coordinates, setCoordinates] = useState<LatLng[]>([]);
  const [lngLatCoords, setLngLatCoords] = useState<LngLatCoords>([]);
  const mapRef = useRef<MapView>(null);

  async function requestLocationPermission() {
    const { granted } = await requestForegroundPermissionsAsync();

    if (granted) setLocation(await getCurrentPositionAsync());
  }

  useEffect(() => {
    requestLocationPermission();
  }, []);

  useEffect(() => {
    watchPositionAsync({
      accuracy: LocationAccuracy.BestForNavigation,
      timeInterval: (DELAY_IN_MINUTES * 60 * 1000) / PLAYBACK_SPEED_DEFAULT,
    }, (response) => {
      setLocation(response);

      mapRef.current?.animateCamera({ center: { latitude: response.coords.latitude, longitude: response.coords.longitude } })

      let lastData = listLocation;

      lastData.push(response.coords);
      setListLocation(lastData);
      let lastCoords: LatLng[] = lastData.map(loc => ({ latitude: loc.latitude, longitude: loc.longitude }))
      setCoordinates(lastCoords);


      let lastLngLatCoords = lngLatCoords;
      lastLngLatCoords.push([response.coords.longitude, response.coords.latitude] as any);
      setLngLatCoords(lastLngLatCoords)

    });
  }, []);

  const polylineCoordinates = listLocation.map((coord) => ({
    latitude: coord.latitude,
    longitude: coord.longitude,
  }));

  const ciclesObj = listLocation.map((coord, i) => (
    <Circle radius={200} key={i} center={{ latitude: coord.latitude, longitude: coord.longitude }} />
  ));

  return (
    <View style={styles.container}>
      {
        location &&
        <MapView
          pitchEnabled={false}
          rotateEnabled={false}
          ref={mapRef}
          style={styles.map}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005
          }}
        >
          <Marker
            draggable={false}
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude
            }}
          />
          {ciclesObj}
          <Polyline
            coordinates={polylineCoordinates}
            strokeColor="red"
            strokeWidth={2}
            lineDashPattern={[10, 10]}
          />

        </MapView>
      }

      <Button
        onPress={() => console.log(coordinates)}
        title="Locations"
        color="#841584"
        accessibilityLabel="Return the log object with all locations"
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    flex: 1,
    width: '100%'
  },
  list: {
    flex: 1,
  }
});
