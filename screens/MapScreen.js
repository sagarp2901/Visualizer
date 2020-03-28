import React from 'react';
//import MapView from 'react-native-map-clustering';
import MapView from '@bam.tech/react-native-component-map-clustering';
import { StyleSheet, View, Dimensions, Text } from 'react-native';
import { Marker, PROVIDER_GOOGLE, Callout } from 'react-native-maps';
import { getDailyReport, formatDailyMarkers } from '../services/FetchData';
import { readString } from 'react-papaparse';
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';
import { getMapDark } from '../constants/MapDark';
const numbro = require('numbro');

const INITIAL_REGION = {
	latitude: 43.6372866,
	longitude: -79.4036979,
	latitudeDelta: 8.5,
	longitudeDelta: 8.5
};
export default class MapScreen extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			markers: [],
			initialRegion: INITIAL_REGION
		};
		this.setCurrentLocation = this.setCurrentLocation.bind(this);
	}

	numberFormat = (value) => {
		return numbro(value).format({ thousandSeparated: true });
	};

	async componentDidMount() {
		try {
			this.setCurrentLocation();
			// Get map data
			const jsonResponse = await getDailyReport(false);
			const dataJson = await readString(jsonResponse, { header: true });
			if (dataJson && dataJson.data) {
				this.setState({ markers: formatDailyMarkers(dataJson.data) });
			}
		} catch (e) {
			console.warn(e);
		}
	}

	async setCurrentLocation() {
		// Ask for location permission
		let { status } = await Permissions.askAsync(Permissions.LOCATION);
		if (status !== 'granted') {
			// If permission is denied, default location would be used
			console.log('Permission to access location was denied');
		} else {
			// Get current location
			const location = await Location.getCurrentPositionAsync({});
			if (location) {
				// Set current location
				let region = this.state.initialRegion;
				region.latitude = location.coords.latitude;
				region.longitude = location.coords.longitude;
				this.setState({ initialRegion: region });
			}
		}
	}

	render() {
		return (
			<MapView
				customMapStyle={getMapDark()}
				clustering={true}
				initialRegion={this.state.initialRegion}
				style={{ flex: 1 }}
				provider={PROVIDER_GOOGLE}>
				{this.state.markers.map((marker, index) => (
					<Marker key={index} coordinate={marker.coordinates}>
						<Callout style={styles.markerStyle} tooltip={true}>
							<View style={styles.tooltipContainer}>
								<Text style={styles.white}>{marker.place}</Text>
								<Text style={styles.yellow}>{`Confirmed: ${this.numberFormat(marker.confirmed)}`}</Text>
								<Text style={styles.green}>{`Recovered: ${this.numberFormat(marker.recovered)}`}</Text>
								<Text style={styles.blue}>{`Active: ${this.numberFormat(marker.active)}`}</Text>
								<Text style={styles.red}>{`Deceased: ${this.numberFormat(marker.dead)}`}</Text>
							</View>
						</Callout>
					</Marker>
				))}
			</MapView>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
		alignItems: 'center',
		justifyContent: 'center'
	},
	mapStyle: {
		width: Dimensions.get('window').width,
		height: Dimensions.get('window').height
	},
	markerStyle: {
		backgroundColor: 'rgba(0,0,0,0.8)',
		width: 180,
		zIndex: 10,
		padding: 10
	},
	tooltipContainer: {
		justifyContent: 'center',
		alignItems: 'center'
	},
	red: {
		color: '#e53935',
		fontSize: 15
	},
	green: {
		color: '#4caf50',
		fontSize: 15
	},
	yellow: {
		color: '#fbc02d',
		fontSize: 15
	},
	white: {
		color: '#eeeeee',
		fontSize: 15,
		marginBottom: 5
	},
	blue: {
		color: '#0288d1',
		fontSize: 15
	}
});
