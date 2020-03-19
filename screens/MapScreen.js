import React from 'react';
import MapView from 'react-native-map-clustering';
import { StyleSheet, View, Dimensions, Text } from 'react-native';
import { Marker, PROVIDER_GOOGLE, Callout } from 'react-native-maps';
import { getDailyReport, formatDailyMarkers } from '../services/FetchData';
import { readString } from 'react-papaparse';

const INITIAL_REGION = {
	latitude: 52.5,
	longitude: 19.2,
	latitudeDelta: 8.5,
	longitudeDelta: 8.5
};

export default class MapScreen extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			markersConfirmed: [],
			markersDead: [],
			markersRecovered: [],
			markers: []
		};
	}

	async componentDidMount() {
		try {
			const jsonResponse = await getDailyReport(false);
			const dataJson = await readString(jsonResponse, { header: true });
			if (dataJson && dataJson.data) {
				this.setState({ markers: formatDailyMarkers(dataJson.data) });
			}
		} catch (e) {
			console.warn(e);
		}
	}
	render() {
		return (
			<MapView
				initialRegion={INITIAL_REGION}
				style={{ flex: 1 }}
				provider={PROVIDER_GOOGLE}
				clusterColor={'rgba(244,67,54,0.5)'}>
				{this.state.markers.map((marker, index) => (
					<Marker key={index} coordinate={marker.coordinates}>
						<Callout style={styles.markerStyle} tooltip={true}>
							<View style={styles.tooltipContainer}>
								<Text style={styles.yellow}>{`Confirmed: ${marker.confirmed}`}</Text>
								<Text style={styles.green}>{`Recovered: ${marker.recovered}`}</Text>
								<Text style={styles.red}>{`Deceased: ${marker.dead}`}</Text>
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
	}
});
