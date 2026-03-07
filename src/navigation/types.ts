import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
};

export type AuthStackParamList = {
  Splash: undefined;
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  RoleSelection: { name: string; email: string; phone: string; password: string };
  ForgotPassword: undefined;
  ResetPassword: undefined;
};

export type MainTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  EventsTab: NavigatorScreenParams<EventsStackParamList>;
  VendorsTab: NavigatorScreenParams<VendorsStackParamList>;
  BudgetTab: NavigatorScreenParams<BudgetStackParamList>;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
};

export type HomeStackParamList = {
  Dashboard: undefined;
  Notifications: undefined;
};

export type EventsStackParamList = {
  MyEvents: undefined;
  CreateEvent: undefined;
  EventDetails: { eventId: string };
  Committees: { eventId: string };
  CommitteeDetails: { committeeId: string };
  Tasks: { eventId: string };
  TaskDetails: { taskId: string };
  JoinEvent: undefined;
  EventProgram: { eventId: string };
  EventProfile: { eventId: string };
  LiveStream: { eventId: string };
};

export type VendorsStackParamList = {
  VendorMarketplace: undefined;
  VendorProfile: { vendorId: string };
  EngageVendor: { vendorId: string };
  MyServices: undefined;
};

export type BudgetStackParamList = {
  BudgetOverview: { eventId?: string } | undefined;
  BudgetCategories: { eventId: string };
  AddExpense: { eventId: string };
  ExpenseHistory: { eventId: string };
};

export type ProfileStackParamList = {
  MyProfile: undefined;
  EditProfile: undefined;
  MyEvents: undefined;
  Settings: undefined;
};
