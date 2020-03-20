import * as React from 'react';
import { StyleSheet, View, Text, Dimensions, SafeAreaView, ScrollView } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import ChartView from '../react-native-highcharts';
import { formatChartData, getCases, getCountries, formatDropdownCountries } from '../services/FetchData';
import { readString } from 'react-papaparse';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Card } from 'react-native-elements';
const { width, height } = Dimensions.get('window');

const getConfig = (data) => ({
	title: {
		text: 'Confirmed/Recovered/Deceased By Country'
	},
	chart: {
		type: 'spline'
	},
	yAxis: {
		title: { text: 'Total Count' }
	},
	navigator: {
		enabled: false
	},
	rangeSelector: {
		inputEnabled: false,
		inputDateFormat: '%Y-%d-%m',
		inputEditDateFormat: '%Y-%d-%m',
		buttonSpacing: 10,
		buttonTheme: {
			// styles for the buttons
			r: 8,
			fill: 'none',
			stroke: 'none',
			width: 60,
			height: 18,
			style: {
				color: '#039',
				fontSize: '13px'
			},
			states: {
				hover: {
					fill: '#333333',
					stroke: '#333333'
				},
				select: {
					fill: '#039',
					style: {
						color: 'white'
					}
				}
			}
		},
		buttons: [
			{
				type: 'day',
				count: 10,
				text: '10 Days'
			},
			{
				type: 'day',
				count: 20,
				text: '20 Days'
			},
			{
				type: 'day',
				count: 30,
				text: '30 Days'
			},
			{
				type: 'all',
				count: data.confirmedSeries.length - 1,
				text: 'All'
			}
		]
	},

	xAxis: {
		categories: data.xAxis
	},
	series: [ data.confirmedSeries, data.deadSeries, data.recoveredSeries ],
	credits: {
		enabled: false
	},
	exporting: {
		enabled: false
	}
});

export default class TimeSeriesScreen extends React.Component {
	constructor(props) {
		super(props);
		this.allowChartUpdate = true;
		this.state = {
			country: '',
			countries: [],
			confirmedSeries: [],
			deadSeries: [],
			recoveredSeries: [],
			countConfirmed: 0,
			countRecovered: 0,
			countDead: 0,
			xAxis: []
		};

		this.createChart = this.createChart.bind(this);
		this.updateCountry = this.updateCountry.bind(this);
	}

	async componentDidMount() {
		await this.createChart();
	}

	async createChart() {
		try {
			this.allowChartUpdate = false;

			const responseConfirmed = await getCases('CONFIRMED');
			const dataConfirmed = await readString(responseConfirmed, { header: true });

			const responseDeaths = await getCases('DEATHS');
			const dataDeaths = await readString(responseDeaths, { header: true });

			const responseRecovered = await getCases('RECOVERED');
			const dataRecovered = await readString(responseRecovered, { header: true });

			//Dynamically set countries from confirmed dataset here since it does not work at setState line 145
			if (dataConfirmed) {
				let uniqueCountries = formatDropdownCountries(dataConfirmed.data);
				// Making this drowpdown array here since formatDropdownCountries is being used as a common function for Bars as well
				const countries = uniqueCountries.map((item) => {
					return { label: item, value: item };
				});
				this.setState({ countries });
			}

			if (dataConfirmed && dataDeaths && dataRecovered) {
				const formattedConfirmed = formatChartData(dataConfirmed.data, this.state.country);
				const formattedDeaths = formatChartData(dataDeaths.data, this.state.country);
				const formattedRecovered = formatChartData(dataRecovered.data, this.state.country);
				let seriesConfirmed = formattedConfirmed;
				seriesConfirmed.name = 'Confirmed';
				seriesConfirmed.color = '#fbc02d';
				let seriesRecovered = formattedRecovered;
				seriesRecovered.name = 'Recovered';
				seriesRecovered.color = '#00c853';
				let seriesDead = formattedDeaths;
				seriesDead.name = 'Deceased';
				seriesDead.color = '#f44336';
				this.setState({
					confirmedSeries: seriesConfirmed,
					deadSeries: seriesDead,
					recoveredSeries: seriesRecovered,
					countConfirmed: seriesConfirmed.data[seriesConfirmed.data.length - 1][1] || 0,
					countDead: seriesDead.data[seriesDead.data.length - 1][1] || 0,
					countRecovered: seriesRecovered.data[seriesRecovered.data.length - 1][1] || 0,
					xAxis: seriesConfirmed.data.map((item) => {
						return item[0];
					})
				});
			}
		} catch (e) {
			console.warn(e);
		}
	}

	numberFormat = (value) => {
		return value;
	};

	async updateCountry(country) {
		this.setState({ country });
		await this.createChart();
	}
	render() {
		const { confirmedSeries, recoveredSeries, deadSeries, xAxis, countries } = this.state;
		const chartConfig = getConfig({ confirmedSeries, recoveredSeries, deadSeries, xAxis });
		const options = {
			global: {
				useUTC: false
			},
			lang: {
				decimalPoint: ',',
				thousandsSep: ','
			}
		};
		return (
			<SafeAreaView style={styles.container}>
				<View style={styles.charContainer}>
					<ChartView style={{ height: height / 1.4 }} config={chartConfig} options={options} stock={true} />
				</View>
				<View style={styles.pickerContainer}>
					<RNPickerSelect
						style={{
							...pickerSelectStyles,
							iconContainer: {
								top: 8,
								right: 8
							},
							placeholder: {
								color: '#78909c',
								fontSize: 16,
								fontWeight: 'bold'
							}
						}}
						onValueChange={this.updateCountry}
						items={countries}
						placeholder={{ label: 'Select a Country...', value: null }}
						Icon={() => {
							return <MaterialCommunityIcons name='chevron-down' size={30} color='gray' />;
						}}
					/>
				</View>
				<Card containerStyle={[ styles.card, { elevation: 0 } ]}>
					<View style={{ flexDirection: 'row' }}>
						<Text style={styles.text}>Total Confirmed:</Text>
						<Text style={[ styles.text, styles.yellow ]}>
							{this.numberFormat(this.state.countConfirmed)}
						</Text>
					</View>
					<View style={{ flexDirection: 'row' }}>
						<Text style={styles.text}>Total Recovered:</Text>
						<Text style={[ styles.text, styles.green ]}>
							{this.numberFormat(this.state.countRecovered)}
						</Text>
					</View>
					<View style={{ flexDirection: 'row' }}>
						<Text style={styles.text}>Total Deceased:</Text>
						<Text style={[ styles.text, styles.red ]}>{this.numberFormat(this.state.countDead)}</Text>
					</View>
				</Card>
			</SafeAreaView>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		justifyContent: 'center',
		flex: 1,
		paddingTop: 10,
		paddingBottom: 10,
		backgroundColor: 'rgba(255, 255, 255, 1)'
	},
	chart: {
		backgroundColor: 'rgba(0,0,0,0.8)'
	},

	pickerContainer: {
		paddingRight: 15,
		paddingLeft: 15,
		borderWidth: 1,
		borderColor: '#78909c',
		marginHorizontal: 18,
		marginTop: -height / 93
	},
	card: {
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'rgba(255,255,255, 0)',
		borderColor: 'rgba(255,255,255, 0)',
		width: width / 2.2,
		position: 'absolute',
		right: width / 1.9,
		top: height / 10
	},
	text: {
		justifyContent: 'center',
		alignItems: 'center',
		textAlign: 'center',
		color: '#78909c',
		fontSize: width * 0.03,
		fontWeight: 'bold'
	},
	red: { color: '#e53935', fontSize: width * 0.03, paddingLeft: 10 },
	green: { color: '#4caf50', fontSize: width * 0.03, paddingLeft: 10 },
	yellow: {
		color: '#fbc02d',
		fontSize: width * 0.03,
		paddingLeft: 10
	}
});

const pickerSelectStyles = StyleSheet.create({
	inputIOS: {
		shadowColor: 'rgba(0,0,0, .2)',
		shadowOffset: { height: 0, width: 0 },
		shadowOpacity: 0, //default is 1
		shadowRadius: 0, //default is 1
		fontSize: 16,
		fontWeight: 'bold',
		paddingVertical: 12,
		paddingHorizontal: 10,
		borderWidth: 1,
		borderColor: 'gray',
		borderRadius: 2,
		color: '#78909c',
		paddingRight: 30 // to ensure the text is never behind the icon
	},
	inputAndroid: {
		fontSize: 20,
		paddingHorizontal: 10,
		paddingVertical: 8,
		borderWidth: 0.5,
		borderWidth: 1,
		borderColor: 'gray',
		borderRadius: 2,
		color: '#78909c',
		fontWeight: 'bold',
		paddingRight: 30 // to ensure the text is never behind the icon
	}
});
