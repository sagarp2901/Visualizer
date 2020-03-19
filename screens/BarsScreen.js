import * as React from 'react';
import { StyleSheet, View, Dimensions, SafeAreaView } from 'react-native';
import ChartView from '../react-native-highcharts';
import { getDailyReport, formatByCountry, formatSeries } from '../services/FetchData';
import { readString } from 'react-papaparse';
const { height } = Dimensions.get('window');

const getConfig = (data) => ({
	chart: {
		type: 'bar',
		height: height / 1.3
	},
	title: {
		text: 'Top 10 Affected Countries'
	},
	xAxis: {
		categories: data.countries
	},
	legend: {
		reversed: false
	},
	plotOptions: {
		series: {
			dataLabels: {
				enabled: true
			}
		}
	},
	series: data.series,
	credits: {
		enabled: false
	},
	exporting: {
		enabled: false
	}
});

export default class BarsScreen extends React.Component {
	constructor(props) {
		super(props);
		this.allowChartUpdate = true;
		this.state = {
			series: [],
			countries: []
		};
		this.createChart = this.createChart.bind(this);
	}

	async componentDidMount() {
		await this.createChart();
	}

	async createChart() {
		try {
			this.allowChartUpdate = false;
			const jsonResponse = await getDailyReport(false);
			const dataJson = await readString(jsonResponse, { header: true });
			if (dataJson) {
				const formatted = formatByCountry(dataJson.data);
				const formattedFinal = formatSeries(formatted);
				this.setState({ series: formattedFinal.series, countries: formattedFinal.countries });
			}
		} catch (e) {
			console.warn(e);
		}
	}

	numberFormat = (value) => {
		return value;
	};

	render() {
		const { series, countries } = this.state;
		const chartConfig = getConfig({ series, countries });
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
				<View>
					<ChartView style={{ height: height / 1.3 }} config={chartConfig} options={options} />
					{/* <HighchartsReactNative
				allowChartUpdate={this.allowChartUpdate}
				useSSL={true}
				useCDN={true}
				modules={modules}
				styles={styles.container}
				options={chartConfig}
			/> */}
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
		paddingBottom: 10,
		backgroundColor: 'rgba(255, 255, 255, 1)'
	},
	charContainer: {
		height: Dimensions.get('window').height / 2
	}
});
