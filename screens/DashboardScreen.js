import * as React from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import { getDailyReport, formatDailyMarkers, getTotals, formatDashboardData, getCases } from '../services/FetchData';
import { Card } from 'react-native-elements';
import { readString } from 'react-papaparse';
const { width } = Dimensions.get('window');

export default class DashBoardScreen extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			totalConfirmed: 0,
			totalDead: 0,
			totalRecovered: 0
		};
		this.numberFormat.bind(this);
	}

	async componentDidMount() {
		try {
			const responseConfirmed = await getCases('CONFIRMED');
			const dataConfirmed = await readString(responseConfirmed);
			const responseRecovered = await getCases('RECOVERED');
			const dataRecovered = await readString(responseRecovered);
			const responseDead = await getCases('DEATHS');
			const dataDead = await readString(responseDead);
			if (dataConfirmed && dataRecovered && dataDead) {
				const formattedConfirmed = formatDashboardData(dataConfirmed.data);
				const formattedRecovered = formatDashboardData(dataRecovered.data);
				const formattedDead = formatDashboardData(dataDead.data);
				this.setState({
					totalConfirmed: formattedConfirmed,
					totalDead: formattedDead,
					totalRecovered: formattedRecovered
				});
			}
		} catch (e) {
			console.warn(e);
		}
	}

	numberFormat(value) {
		return value;
	}

	render() {
		return (
			<View style={styles.container}>
				<Card containerStyle={styles.card}>
					<Text style={styles.text}>Total Confirmed</Text>
					<Text style={[ styles.text, styles.yellow ]}>{this.numberFormat(this.state.totalConfirmed)}</Text>
				</Card>
				<Card containerStyle={styles.card}>
					<Text style={styles.text}>Total Recovered</Text>
					<Text style={[ styles.text, styles.green ]}>{this.numberFormat(this.state.totalRecovered)}</Text>
				</Card>
				<Card containerStyle={styles.card}>
					<Text style={styles.text}>Total Deceased</Text>
					<Text style={[ styles.text, styles.red ]}>{this.numberFormat(this.state.totalDead)}</Text>
				</Card>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		paddingBottom: 15,
		backgroundColor: 'rgba(255, 255, 255, 1)'
	},
	webview: {
		flex: 1
	},
	card: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'rgba(255, 255, 255, 1)',
		borderColor: '#78909c'
	},
	text: {
		textAlign: 'center',
		color: '#78909c',
		fontSize: width * 0.04
	},
	red: { color: '#e53935', fontSize: width * 0.1 },
	green: { color: '#4caf50', fontSize: width * 0.1 },
	yellow: {
		color: '#F9D93E',
		fontSize: width * 0.1
	}
});
