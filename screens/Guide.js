import * as React from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import WebView from 'react-native-webview';
const { height } = Dimensions.get('window');
const cdcAndroidURI = { uri: 'https://www.cdc.gov/coronavirus/2019-nCoV/index.html' };

export default class Guide extends React.Component {
	constructor() {
		super();
	}

	render() {
		return <WebView style={styles.container} source={cdcAndroidURI} />;
	}
}

const styles = StyleSheet.create({
	container: {
		marginTop: -height / 100
	}
});
