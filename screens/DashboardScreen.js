import * as React from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import ChartView from '../react-native-highcharts';
import { formatDashboardData, getCases } from '../services/FetchData';
import { Card } from 'react-native-elements';
import { readString } from 'react-papaparse';
import { SafeAreaView } from 'react-native-safe-area-context';
const { width, height } = Dimensions.get('window');

const getConfig = (data) => ({
	chart: {
		plotBackgroundColor: null,
		plotBorderWidth: null,
		plotShadow: false
	},
	title: {
		text: '<b>Total Cases</b>',
		align: 'center',
		verticalAlign: 'middle',
		y: 100
	},
	tooltip: {
		pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
	},
	plotOptions: {
		pie: {
			allowPointSelect: true,
			dataLabels: {
				enabled: true,
				format: '<b>{point.name}</b>: {point.percentage:.1f} %',
				distance: -width / 6
			},
			startAngle: -90,
			endAngle: 90,
			center: [ '50%', '75%' ],
			size: '110%'
		}
	},
	series: [
		{
			type: 'pie',
			name: 'Count',
			innerSize: '50%',
			colorByPoint: true,
			data: [
				{
					name: 'Confirmed',
					color: '#F9D93E',
					y: data.total.confirmed
				},
				{
					name: 'Recovered',
					color: '#4caf50',
					y: data.total.recovered
				},
				{
					name: 'Deceased',
					color: '#e53935',
					y: data.total.dead
				}
			]
		}
	],
	credits: {
		enabled: false
	},
	exporting: {
		enabled: false
	}
});

export default class DashBoardScreen extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			total: {
				confirmed: 0,
				dead: 0,
				recovered: 0
			}
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
				const total = {
					confirmed: formattedConfirmed,
					dead: formattedDead,
					recovered: formattedRecovered
				};
				this.setState({ total });
			}
		} catch (e) {
			console.warn(e);
		}
	}

	numberFormat(value) {
		return value;
	}

	render() {
		const chartConfig = getConfig({ total: this.state.total });
		const options = {
			global: {
				useUTC: false
			},
			lang: {
				decimalPoint: '.',
				thousandsSep: ','
			}
		};

		return (
			<SafeAreaView style={styles.container}>
				<ChartView style={styles.chart} config={chartConfig} options={options} />
				<View style={styles.cards}>
					<Card containerStyle={styles.card}>
						<Text style={styles.text}>Total Confirmed</Text>
						<Text style={[ styles.text, styles.yellow ]}>
							{this.numberFormat(this.state.total.confirmed)}
						</Text>
					</Card>
					<Card containerStyle={styles.card}>
						<Text style={styles.text}>Total Recovered</Text>
						<Text style={[ styles.text, styles.green ]}>
							{this.numberFormat(this.state.total.recovered)}
						</Text>
					</Card>
					<Card containerStyle={styles.card}>
						<Text style={styles.text}>Total Deceased</Text>
						<Text style={[ styles.text, styles.red ]}>{this.numberFormat(this.state.total.dead)}</Text>
					</Card>
				</View>
			</SafeAreaView>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		justifyContent: 'center',
		flex: 1,
		paddingTop: 10,
		paddingBottom: 20,
		backgroundColor: 'rgba(255, 255, 255, 1)'
	},
	chart: {
		height: height / 1.8,
		marginTop: -height / 7,
		marginBottom: -height / 9,
		paddingLeft: 10,
		paddingRight: 10
	},
	cards: {
		flex: 1
	},
	card: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'rgba(255, 255, 255, 1)',
		borderColor: '#78909c',
		height: height / 8.5
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
