const BASE_URL = '';
export const getCases = (type) => {
	const URLS = {
		CONFIRMED:
			'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Confirmed.csv',
		DEATHS:
			'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Deaths.csv',
		RECOVERED:
			'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Recovered.csv'
	};
	return fetch(URLS[type], {
		headers: {
			Accept: 'application/vnd.openxmlformatsofficedocument.spreadsheetml.sheet'
		}
	}).then((res) => res.text());
};

export const getDailyReport = (useTodayDate) => {
	const date = useTodayDate ? getTodayDate() : getYesterdayDate();

	const url = `https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/${date}.csv`;
	return fetch(url, {
		headers: {
			Accept: 'application/vnd.openxmlformatsofficedocument.spreadsheetml.sheet'
		}
	}).then((res) => {
		// If today's data exist then 200 will be returned
		return res.status == 200 ? res.text() : res.status;
	});
};

export const formatMarkers = (data) => {
	const result = data.map((item) => {
		return {
			title: `${item['Province/State']} - ${item['Country/Region']}`,
			coordinates: {
				latitude: parseFloat(item['Lat']),
				longitude: parseFloat(item['Long'])
			}
		};
	});
	return result;
};

export const formatDailyMarkers = (data) => {
	const result = data.map((item) => {
		return {
			country: item['Country/Region'],
			region: item['Province/State'],
			coordinates: {
				latitude: parseFloat(item['Latitude']) || 0,
				longitude: parseFloat(item['Longitude']) || 0
			},
			confirmed: item['Confirmed'],
			dead: item['Deaths'],
			recovered: item['Recovered']
		};
	});
	return result;
};

export const getYesterdayDate = () => {
	let date = new Date();
	date.setDate(date.getDate() - 1);
	let dd = date.getDate();
	dd = dd > 9 ? dd : '0' + dd;
	let mm = date.getMonth() + 1;
	mm = mm > 9 ? mm : '0' + mm;
	let yyyy = date.getFullYear();
	return `${mm}-${dd}-${yyyy}`;
};

export const getTodayDate = () => {
	let date = new Date();
	date.setDate(date.getDate());
	let dd = date.getDate();
	dd = dd > 9 ? dd : '0' + dd;
	let mm = date.getMonth() + 1;
	mm = mm > 9 ? mm : '0' + mm;
	let yyyy = date.getFullYear();
	return `${mm}-${dd}-${yyyy}`;
};

export const formatChartData = (data, country) => {
	const filteredByCountry = data.filter((item) => {
		return item['Country/Region'] === country;
	});
	const formatted =
		data.length > 1 ? formatArraySeries(filteredByCountry) : formatChartSingleSeries(filteredByCountry[0]);
	return formatted;
};

export const formatDashboardData = (data) => {
	data.shift();
	let cleaned = data.map((item) => {
		return { country: item[1], count: item[item.length - 1] };
	});
	let count = cleaned.reduce((previousValue, currentValue) => {
		return { count: (parseInt(previousValue.count) || 0) + (parseInt(currentValue.count) || 0) };
	}).count;
	return count;
};

export const removeProperties = (arr) => {
	arr.forEach((item) => {
		delete item['Lat'];
		delete item['Long'];
		delete item['Province/State'];
		delete item['Country/Region'];
	});
	return arr;
};

export const formatChartSingleSeries = (arr) => {
	const name = arr['Country/Region'];
	// Remove unwanted properties
	const arrValues = removeProperties([ arr ])[0];
	let keys = Object.keys(arr);
	let seriesData = [];
	keys.forEach((key) => {
		const val = arrValues[key];
		seriesData.push([ new Date(key).getTime(), val ]);
	});
	let seriesObj = { name: name, data: seriesData };
	return seriesObj;
};

export const formatArraySeries = (arr) => {
	const name = arr[0]['Country/Region'];
	const arrValues = removeProperties(arr);
	let keys = Object.keys(arrValues[0]);
	let seriesData = [];
	keys.forEach((key) => {
		let sum = 0;
		arrValues.forEach((row) => {
			let val = parseInt(row[key]);
			sum += !isNaN(val) ? parseInt(row[key]) : 0;
		});
		seriesData.push([ new Date(key).getTime(), sum ]);
	});
	let seriesObj = { name: name, data: seriesData };
	return seriesObj;
};

export const getCountries = () => {
	let countries = getCountryArr();

	return countries.sort().map((val) => {
		return {
			label: val,
			value: val
		};
	});
};

export const formatByCountry = (dataArr) => {
	let data = dataArr.map((item) => {
		return {
			country: item['Country/Region'],
			confirmed: parseInt(item['Confirmed']) || 0,
			dead: parseInt(item['Deaths']) || 0,
			recovered: parseInt(item['Recovered']) || 0
		};
	});
	// Dynamically getting countries from data
	let countries = formatDropdownCountries(dataArr);

	let dataByCountries = [];
	countries.forEach((country) => {
		const filteredByCountry = data.filter((item) => {
			return item.country === country;
		});
		dataByCountries.push(filteredByCountry);
	});

	let dataSumByCountries = [];
	dataByCountries.forEach((countryArr) => {
		if (countryArr && countryArr.length) {
			let countrySum = countryArr.reduce((previousValue, currentValue) => {
				return {
					country: previousValue.country,
					confirmed: parseInt(previousValue.confirmed) + parseInt(currentValue.confirmed),
					dead: previousValue.dead + currentValue.dead,
					recovered: previousValue.recovered + currentValue.recovered
				};
			});
			dataSumByCountries.push(countrySum);
		}
	});
	return dataSumByCountries;
};

export const formatSeries = (formatted) => {
	let confirmed = [];
	let recovered = [];
	let deceased = [];
	formatted.sort((a, b) => {
		return b.confirmed - a.confirmed;
	});
	let countries = formatted
		.map((item) => {
			return item.country;
		})
		.slice(0, 10);
	formatted.forEach((item) => {
		confirmed.push(item.confirmed);
		recovered.push(item.recovered);
		deceased.push(item.dead);
	});
	let series = [];
	series.push({ name: 'Confirmed', data: confirmed.slice(0, 10), color: '#F9D93E' });
	series.push({ name: 'Recovered', data: recovered.slice(0, 10), color: '#4caf50' });
	series.push({ name: 'Deceased', data: deceased.slice(0, 10), color: '#e53935' });
	return { series: series, countries: countries };
};

export const getCountryArr = () => {
	return [
		'Thailand',
		'Japan',
		'Singapore',
		'Nepal',
		'Malaysia',
		'Canada',
		'Australia',
		'Cambodia',
		'Sri Lanka',
		'Germany',
		'Finland',
		'United Arab Emirates',
		'Philippines',
		'India',
		'Italy',
		'Sweden',
		'Spain',
		'Belgium',
		'Egypt',
		'Lebanon',
		'Iraq',
		'Oman',
		'Afghanistan',
		'Bahrain',
		'Kuwait',
		'Algeria',
		'Croatia',
		'Switzerland',
		'Austria',
		'Israel',
		'Pakistan',
		'Brazil',
		'Georgia',
		'Greece',
		'North Macedonia',
		'Norway',
		'Romania',
		'Estonia',
		'San Marino',
		'Belarus',
		'Iceland',
		'Lithuania',
		'Mexico',
		'New Zealand',
		'Nigeria',
		'Ireland',
		'Luxembourg',
		'Monaco',
		'Qatar',
		'Ecuador',
		'Azerbaijan',
		'Armenia',
		'Dominican Republic',
		'Indonesia',
		'Portugal',
		'Andorra',
		'Latvia',
		'Morocco',
		'Saudi Arabia',
		'Senegal',
		'Argentina',
		'Chile',
		'Jordan',
		'Ukraine',
		'Hungary',
		'Liechtenstein',
		'Poland',
		'Tunisia',
		'Bosnia and Herzegovina',
		'Slovenia',
		'South Africa',
		'Bhutan',
		'Cameroon',
		'Colombia',
		'Costa Rica',
		'Peru',
		'Serbia',
		'Slovakia',
		'Togo',
		'Malta',
		'Martinique',
		'Bulgaria',
		'Maldives',
		'Bangladesh',
		'Paraguay',
		'Albania',
		'Cyprus',
		'Brunei',
		'US',
		'Burkina Faso',
		'Holy See',
		'Mongolia',
		'Panama',
		'China',
		'Iran',
		'Korea, South',
		'France',
		'Cruise Ship',
		'Denmark',
		'Czechia',
		'Taiwan*',
		'Vietnam',
		'Russia',
		'Moldova',
		'Bolivia',
		'Honduras',
		'United Kingdom',
		'Congo (Kinshasa)',
		"Cote d'Ivoire",
		'Jamaica',
		'Turkey',
		'Cuba',
		'Guyana',
		'Kazakhstan',
		'Ethiopia',
		'Sudan',
		'Guinea',
		'Kenya',
		'Antigua and Barbuda',
		'Uruguay',
		'Ghana',
		'Namibia',
		'Seychelles',
		'Trinidad and Tobago',
		'Venezuela',
		'Eswatini',
		'Gabon',
		'Guatemala',
		'Mauritania',
		'Rwanda',
		'Saint Lucia',
		'Saint Vincent and the Grenadines',
		'Suriname',
		'Kosovo',
		'Central African Republic',
		'Congo (Brazzaville)',
		'Equatorial Guinea',
		'Uzbekistan',
		'Netherlands',
		'Benin',
		'Liberia',
		'Somalia',
		'Tanzania',
		'Barbados',
		'Montenegro',
		'Kyrgyzstan',
		'Mauritius',
		'Zambia',
		'Djibouti',
		'Gambia, The',
		'Bahamas, The',
		'Chad',
		'El Salvador',
		'Fiji',
		'Nicaragua'
	];
};

export const getTotals = (markers) => {
	let totals = {
		totalConfirmed: 0,
		totalDead: 0,
		totalRecovered: 0
	};
	if (markers && markers.length) {
		markers.forEach((marker) => {
			totals.totalConfirmed += parseInt(marker.confirmed) ? parseInt(marker.confirmed) : 0;
			totals.totalDead += parseInt(marker.dead) ? parseInt(marker.dead) : 0;
			totals.totalRecovered += parseInt(marker.recovered) ? parseInt(marker.recovered) : 0;
		});
	}
	return totals;
};

export const formatDropdownCountries = (data) => {
	let countries = [];
	data.forEach((item) => {
		countries.push(item['Country/Region']);
	});
	let uniqueCountries = [];
	countries.forEach((item) => {
		if (item && uniqueCountries.indexOf(item) < 0) uniqueCountries.push(item);
	});
	uniqueCountries.sort();
	return uniqueCountries;
};
