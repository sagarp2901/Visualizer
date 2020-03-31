import * as React from 'react';
import { Platform, StatusBar, StyleSheet, View, Dimensions, Alert } from 'react-native';
import { SplashScreen } from 'expo';
import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import BottomTabNavigator from './navigation/BottomTabNavigator';
import useLinking from './navigation/useLinking';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from './constants/Colors';

const Stack = createStackNavigator();
const { width } = Dimensions.get('window');
const githubLink = 'Github repo'.link('https://github.com/CSSEGISandData/');

function TitleBar() {
	return (
		<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
			<BottomTabNavigator />
		</View>
	);
}

export default function App(props) {
	const [ isLoadingComplete, setLoadingComplete ] = React.useState(false);
	const [ initialNavigationState, setInitialNavigationState ] = React.useState();
	const containerRef = React.useRef();
	const { getInitialState } = useLinking(containerRef);

	// Load any resources or data that we need prior to rendering the app
	React.useEffect(() => {
		async function loadResourcesAndDataAsync() {
			try {
				SplashScreen.preventAutoHide();

				// Load our initial navigation state
				setInitialNavigationState(await getInitialState());

				// Load fonts
				await Font.loadAsync({
					...Ionicons.font,
					'space-mono': require('./assets/fonts/SpaceMono-Regular.ttf')
				});
			} catch (e) {
				// We might want to provide this error information to an error reporting service
				console.warn(e);
			} finally {
				setLoadingComplete(true);
				SplashScreen.hide();
			}
		}

		loadResourcesAndDataAsync();
	}, []);

	if (!isLoadingComplete && !props.skipLoadingScreen) {
		return null;
	} else {
		return (
			<View style={styles.container}>
				{Platform.OS === 'ios' && <StatusBar barStyle='default' />}
				<NavigationContainer ref={containerRef} initialState={initialNavigationState}>
					<Stack.Navigator>
						<Stack.Screen
							name='Root'
							component={BottomTabNavigator}
							options={{
								headerRight: () => (
									<MaterialCommunityIcons
										onPress={() =>
											Alert.alert(
												'About',
												`This App is built using the data from GitHub Repo(https://github.com/CSSEGISandData) and displays interactive visuals and map to provide best available information on the current global issue.\n\nAs stated in this repo's Terms of Use, this data is provided to the public strictly for educational and academic research purposes. The data comes from multiple publicly available sources, that do not always agree.\n\nThis app does not collect or store any personal information from the user. It may access user's device location for updating current location on the map and would be stored on the device's internal storage.\n\nThis App is strictly for the purpose of information and education and not for commercial/monetary gains.\n\n\The CDC guideline is referenced in this app under the 'Guidelines' section to provide the users with a viable source of information at hand. We cannot be held responsible for the content provided under the CDC Guidelines. Please contact CDC for any questions/concerns using the CDC contact information at the bottom of the guide.\n\nPlease read the privacy policy for Google Play Services for further information.`,
												[ { text: 'OK', onPress: () => console.log('OK Pressed') } ],
												{ cancelable: false }
											)}
										name={'information-outline'}
										size={30}
										style={{ marginBottom: -3, paddingRight: width / 25 }}
										color={Colors.tabIconSelected}
									/>
								)
							}}
						/>
					</Stack.Navigator>
				</NavigationContainer>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff'
	}
});
