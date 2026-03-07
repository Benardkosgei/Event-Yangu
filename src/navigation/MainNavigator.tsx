import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { MainTabParamList, HomeStackParamList, EventsStackParamList, ProfileStackParamList, VendorsStackParamList, BudgetStackParamList } from './types';
import { DashboardScreen } from '../screens/home/DashboardScreen';
import { NotificationsScreen } from '../screens/home/NotificationsScreen';
import { MyEventsScreen } from '../screens/events/MyEventsScreen';
import { CreateEventScreen } from '../screens/events/CreateEventScreen';
import { EventDetailsScreen } from '../screens/events/EventDetailsScreen';
import { JoinEventScreen } from '../screens/events/JoinEventScreen';
import { CommitteesScreen } from '../screens/events/CommitteesScreen';
import { CommitteeDetailsScreen } from '../screens/events/CommitteeDetailsScreen';
import { TasksScreen } from '../screens/events/TasksScreen';
import { TaskDetailsScreen } from '../screens/events/TaskDetailsScreen';
import { EventProgramScreen } from '../screens/events/EventProgramScreen';
import { LiveStreamScreen } from '../screens/events/LiveStreamScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { EditProfileScreen } from '../screens/profile/EditProfileScreen';
import { SettingsScreen } from '../screens/profile/SettingsScreen';
import { VendorMarketplaceScreen } from '../screens/vendors/VendorMarketplaceScreen';
import { VendorProfileScreen } from '../screens/vendors/VendorProfileScreen';
import { EngageVendorScreen } from '../screens/vendors/EngageVendorScreen';
import { MyServicesScreen } from '../screens/vendors/MyServicesScreen';
import { BudgetOverviewScreen } from '../screens/budget/BudgetOverviewScreen';
import { BudgetCategoriesScreen } from '../screens/budget/BudgetCategoriesScreen';
import { AddExpenseScreen } from '../screens/budget/AddExpenseScreen';
import { ExpenseHistoryScreen } from '../screens/budget/ExpenseHistoryScreen';
import { EventDetailsMenuButton } from '../components/EventDetailsMenuButton';
import { Colors } from '../constants/colors';

const Tab = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const EventsStack = createNativeStackNavigator<EventsStackParamList>();
const VendorsStack = createNativeStackNavigator<VendorsStackParamList>();
const BudgetStack = createNativeStackNavigator<BudgetStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

const HomeNavigator = () => (
  <HomeStack.Navigator>
    <HomeStack.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Home' }} />
    <HomeStack.Screen name="Notifications" component={NotificationsScreen} />
  </HomeStack.Navigator>
);

const EventsNavigator = () => (
  <EventsStack.Navigator>
    <EventsStack.Screen name="MyEvents" component={MyEventsScreen} options={{ title: 'Events' }} />
    <EventsStack.Screen name="CreateEvent" component={CreateEventScreen} />
    <EventsStack.Screen 
      name="EventDetails" 
      component={EventDetailsScreen}
      options={({ route, navigation }) => ({
        title: 'EventDetails',
        headerRight: () => (
          <EventDetailsMenuButton
            eventId={(route.params as any)?.eventId}
            navigation={navigation}
          />
        ),
        headerStyle: {
          backgroundColor: Colors.white,
        },
      })}
    />
    <EventsStack.Screen name="JoinEvent" component={JoinEventScreen} />
    <EventsStack.Screen name="Committees" component={CommitteesScreen} />
    <EventsStack.Screen name="CommitteeDetails" component={CommitteeDetailsScreen} />
    <EventsStack.Screen name="Tasks" component={TasksScreen} />
    <EventsStack.Screen name="TaskDetails" component={TaskDetailsScreen} />
    <EventsStack.Screen name="EventProgram" component={EventProgramScreen} />
    <EventsStack.Screen name="LiveStream" component={LiveStreamScreen} />
  </EventsStack.Navigator>
);

const VendorsNavigator = () => (
  <VendorsStack.Navigator>
    <VendorsStack.Screen name="VendorMarketplace" component={VendorMarketplaceScreen} options={{ title: 'Vendors' }} />
    <VendorsStack.Screen name="VendorProfile" component={VendorProfileScreen} />
    <VendorsStack.Screen name="EngageVendor" component={EngageVendorScreen} />
    <VendorsStack.Screen name="MyServices" component={MyServicesScreen} />
  </VendorsStack.Navigator>
);

const BudgetNavigator = () => (
  <BudgetStack.Navigator>
    <BudgetStack.Screen name="BudgetOverview" component={BudgetOverviewScreen} options={{ title: 'Budget' }} />
    <BudgetStack.Screen name="BudgetCategories" component={BudgetCategoriesScreen} />
    <BudgetStack.Screen name="AddExpense" component={AddExpenseScreen} />
    <BudgetStack.Screen name="ExpenseHistory" component={ExpenseHistoryScreen} />
  </BudgetStack.Navigator>
);

const ProfileNavigator = () => (
  <ProfileStack.Navigator>
    <ProfileStack.Screen name="MyProfile" component={ProfileScreen} options={{ title: 'Profile' }} />
    <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} />
    <ProfileStack.Screen name="Settings" component={SettingsScreen} />
  </ProfileStack.Navigator>
);

export const MainNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.text.secondary,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeNavigator}
        options={{ 
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="EventsTab"
        component={EventsNavigator}
        options={{ 
          tabBarLabel: 'Events',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="VendorsTab"
        component={VendorsNavigator}
        options={{ 
          tabBarLabel: 'Vendors',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="storefront" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="BudgetTab"
        component={BudgetNavigator}
        options={{ 
          tabBarLabel: 'Budget',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="wallet" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileNavigator}
        options={{ 
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
