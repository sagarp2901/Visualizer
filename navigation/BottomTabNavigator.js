import * as React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import TabBarIcon from '../components/TabBarIcon';
import MapScreen from '../screens/MapScreen';
import TimeSeriesScreen from '../screens/TimeSeriesScreen';
import DashboardScreen from '../screens/DashboardScreen';
import BarsScreen from '../screens/BarsScreen';

const BottomTab = createBottomTabNavigator();
const INITIAL_ROUTE_NAME = 'Dashboard';

export default function BottomTabNavigator({ navigation, route }) {
  // Set the header title on the parent stack navigator depending on the
  // currently active tab. Learn more in the documentation:
  // https://reactnavigation.org/docs/en/screen-options-resolution.html
  navigation.setOptions({ headerTitle: getHeaderTitle(route) });

  return (
    <BottomTab.Navigator initialRouteName={INITIAL_ROUTE_NAME}>
      <BottomTab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} name="view-dashboard" />,
        }}
      />
      <BottomTab.Screen
        name="Map"
        component={MapScreen}
        options={{
          title: 'Heat Map',
          tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} name="google-maps" />,
        }}
      />
       <BottomTab.Screen
        name="Bars"
        component={BarsScreen}
        options={{
          title: 'Bars',
          tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} name="chart-bar" />,
        }}
      />
      <BottomTab.Screen
        name="Series"
        component={TimeSeriesScreen}
        options={{
          title: 'Time Series',
          tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} name="chart-line" />,
        }}
      />
    </BottomTab.Navigator>
  );
}

function getHeaderTitle(route) {
  const routeName = route.state?.routes[route.state.index]?.name ?? INITIAL_ROUTE_NAME;

  switch (routeName) {
    case 'Dashboard':
      return 'Dashboard';
    case 'Map':
      return 'Heat Map';
    case 'Bars':
      return 'Bar Chart';
    case 'Series':
      return 'Time Series';
  }
}
