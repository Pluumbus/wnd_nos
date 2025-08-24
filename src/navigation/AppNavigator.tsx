import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import HomeScreen from "../screens/HomeScreen";
import OrdersScreen from "../screens/OrdersScreen";
import NewOrderScreen from "../screens/NewOrderScreen";
import WorkflowScreen from "../screens/WorkflowScreen";

export type RootStackParamList = {
  Home: undefined;
  Orders: undefined;
  NewOrder: undefined;
  Workflow: {
    customerName: string;
    customerPhone: string;
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
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
