import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import HomeScreen from "../screens/HomeScreen";
import OrdersScreen from "../screens/OrdersScreen";
import NewOrderScreen from "../screens/NewOrderScreen";
import WorkflowScreen from "../screens/WorkflowScreen";
import PriceScreen from "../screens/PriceScreen";
import SettingsScreen from "../screens/SettingsScreen";
import { OrderWithJoins } from "../services/orderService";
import { NavigationContainer } from "@react-navigation/native";

export type RootStackParamList = {
  Home: undefined;
  Orders: undefined;
  NewOrder: undefined;
  Price: undefined;
  Settings: undefined;
  Workflow: {
    orderData: OrderWithJoins;
    isNewOrder: boolean;
  };
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Orders" component={OrdersScreen} />
        <Stack.Screen name="NewOrder" component={NewOrderScreen} />
        <Stack.Screen name="Workflow" component={WorkflowScreen} />
        <Stack.Screen name="Price" component={PriceScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
