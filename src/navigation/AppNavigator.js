import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthContext } from "../context/AuthContext";

import WelcomeScreen from "../screens/WelcomeScreen";
import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";
import StudentTabs from '../screens/student/StudentTabs'; 
import AdminTabs from './AdminTabs';
import StudentManagementScreen from '../screens/admin/StudentManagementScreen';
import AddStudentScreen from '../screens/admin/AddStudentScreen';
import BatchManagementScreen from '../screens/admin/BatchManagementScreen';
import FeeManagementScreen from '../screens/admin/FeeManagementScreen';
import DanceTypesManagementScreen from '../screens/admin/DanceTypesManagementScreen';
import EventsManagementScreen from '../screens/admin/EventsManagementScreen';
import FeeRemindersScreen from '../screens/admin/FeeRemindersScreen';
import AdminSangeetPackagesScreen from '../screens/admin/SangeetPackagesScreen';
import AttendanceManagementScreen from '../screens/admin/AttendanceManagementScreen';
import StudentDetailsScreen from '../screens/admin/StudentDetailsScreen';
import EditStudentScreen from '../screens/admin/EditStudentScreen';
import AddEditBatchScreen from '../screens/admin/AddEditBatchScreen';
import AddEditEventScreen from '../screens/admin/AddEditEventScreen';
import AddEditFeeScreen from '../screens/admin/AddEditFeeScreen';
import EventsCategoriesScreen from '../screens/admin/EventsCategoriesScreen';
import AddEditSangeetPackageScreen from '../screens/admin/AddEditSangeetPackageScreen';
import SangeetInquiriesScreen from '../screens/admin/SangeetInquiriesScreen';
import StudioInfoScreen from '../screens/student/StudioInfoScreen';
import StudentSangeetScreen from "../screens/student/StudentSangeetScreen";
import StudentSangeetInquiriesScreen from '../screens/student/StudentSangeetInquiriesScreen';
import EditProfileScreen from "../screens/student/EditProfileScreen";
import SkillLevelsScreen from '../screens/admin/SkillLevelsScreen';
import AddSkillLevel from '../screens/admin/AddSkillLevel';
import ReceiptScreen from '../screens/admin/ReceiptScreen';
import AdminSettingsScreen from '../screens/admin/AdminSettingsScreen';
import BatchAllotmentScreen from '../screens/admin/BatchAllotmentScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import AdminRegistrationScreen from '../screens/admin/AdminRegistrationScreen';
import StudentCredentialsScreen from '../screens/admin/StudentCredentialsScreen';
import NotificationsScreen from '../screens/admin/NotificationsScreen';
import UploadReceiptScreen from '../screens/student/UploadReceiptScreen';
import AdminEventInquiriesScreen from '../screens/admin/AdminEventInquiriesScreen';
import StudentInquiriesScreen from '../screens/student/StudentInquiriesScreen';
import BatchEnrollmentScreen from '../screens/student/BatchEnrollmentScreen';
import AdminCancellationScreen from '../screens/admin/AdminCancellationScreen';
import ScheduleScreen from '../screens/admin/ScheduleScreen';
import MyEventsScreen from '../screens/student/MyEvents';
import MyRemindersScreen from '../screens/student/MyReminders';
import CreateReminderScreen from '../screens/admin/CreateReminder';
import PodcastHomeScreen from '../screens/studio/PodcastHome';
import StudioBookingFormScreen from '../screens/studio/StudioBookingForm';
import StudioMyBookingsScreen from '../screens/studio/StudioMyBookings';
import StudioBookingsScreen from '../screens/admin/StudioBookingsScreen';
import RegistrationPaymentScreen from '../screens/student/RegistrationPaymentScreen';
import ManageAdminsScreen from '../screens/admin/ManageAdminsScreen';
import StudioInquiryForm from '../screens/admin/StudioInquiryForm';
import StudioInquiriesListScreen from '../screens/admin/StudioInquiriesListScreen';
import FeeStructureScreen from '../screens/admin/FeeStructureScreen';
import StudentFeeStructureScreen from '../screens/student/StudentFeeStructureScreen';
import AddEditFeeStructureScreen from '../screens/admin/AddEditFeeStructureScreen';
import AboutUsScreen from '../screens/AboutUsScreen';
import AdminCoreValuesScreen from '../screens/admin/AdminCoreValuesScreen';
import AdminGalleryScreen from '../screens/admin/AdminGalleryScreen';
import AdminAboutUsScreen from '../screens/admin/AdminAboutUsScreen';
import StudentGalleryScreen from '../screens/student/StudentGalleryScreen';
import ManageHolidaysScreen from '../screens/admin/ManageHolidaysScreen';
import SangeetSettingsScreen from '../screens/admin/SangeetSettingsScreen';
import CalendarScheduleScreen from '../screens/admin/CalendarScheduleScreen';
import ProfileSelectionScreen from '../screens/student/ProfileSelectionScreen';
import SplashScreen from '../screens/SplashScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user, loading, activeProfile } = useContext(AuthContext);

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          // Authenticated Screens
          <>
            {user.role === "ADMIN" ? (
              <Stack.Screen name="AdminTabs" component={AdminTabs} />
            ) : (
              !activeProfile ? (
                <Stack.Screen name="ProfileSelection" component={ProfileSelectionScreen} />
              ) : (
                <Stack.Screen name="StudentTabs" component={StudentTabs} />
              )
            )}
            
            {/* Shared Protected Screens */}
            <Stack.Screen name="StudentManagement" component={StudentManagementScreen} />
            <Stack.Screen name="AddStudent" component={AddStudentScreen} />
            <Stack.Screen name="BatchManagement" component={BatchManagementScreen} />
            <Stack.Screen name="FeeManagement" component={FeeManagementScreen} />
            <Stack.Screen name="DanceTypesManagement" component={DanceTypesManagementScreen} />
            <Stack.Screen name="EventsManagement" component={EventsManagementScreen} />
            <Stack.Screen name="FeeReminders" component={FeeRemindersScreen} />
            <Stack.Screen name="AdminSangeetPackages" component={AdminSangeetPackagesScreen} />
            <Stack.Screen name="AttendanceManagement" component={AttendanceManagementScreen} />
            <Stack.Screen name="StudentDetails" component={StudentDetailsScreen} />
            <Stack.Screen name="EditStudent" component={EditStudentScreen} />
            <Stack.Screen name="AddEditBatch" component={AddEditBatchScreen} />
            <Stack.Screen name="AddEditEvent" component={AddEditEventScreen} />
            <Stack.Screen name="AddEditFee" component={AddEditFeeScreen} />
            <Stack.Screen name="EventsCategories" component={EventsCategoriesScreen} />
            <Stack.Screen name="AddEditSangeetPackage" component={AddEditSangeetPackageScreen} />
            <Stack.Screen name="SangeetInquiries" component={SangeetInquiriesScreen} />
            <Stack.Screen name="Receipt" component={ReceiptScreen} />
            <Stack.Screen name="StudioInfo" component={StudioInfoScreen} />
            <Stack.Screen name="SkillLevels" component={SkillLevelsScreen} />
            <Stack.Screen name="AddEditSkillLevel" component={AddSkillLevel} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="AdminSettings" component={AdminSettingsScreen} />
            <Stack.Screen name="BatchAllotment" component={BatchAllotmentScreen} />
            <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
            <Stack.Screen name="AdminRegistration" component={AdminRegistrationScreen} />
            <Stack.Screen name="StudentCredentials" component={StudentCredentialsScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="UploadReceipt" component={UploadReceiptScreen} />
            <Stack.Screen name="AdminEventInquiries" component={AdminEventInquiriesScreen} />
            <Stack.Screen name="StudentInquiries" component={StudentInquiriesScreen} />
            <Stack.Screen name="AdminCancellationScreen" component={AdminCancellationScreen} />
            <Stack.Screen name="ScheduleScreen" component={ScheduleScreen} />
            <Stack.Screen name="StudioInquiryForm" component={StudioInquiryForm} />
            <Stack.Screen name="StudioInquiriesList" component={StudioInquiriesListScreen} />
            <Stack.Screen name="FeeStructure" component={FeeStructureScreen} />
            <Stack.Screen name="StudentFeeStructure" component={StudentFeeStructureScreen} />
            <Stack.Screen name="AddEditFeeStructure" component={AddEditFeeStructureScreen} />
            <Stack.Screen name="AboutUs" component={AboutUsScreen} />
            <Stack.Screen name="CoreValues" component={AdminCoreValuesScreen} />
            <Stack.Screen name="GalleryManagement" component={AdminGalleryScreen} />
            <Stack.Screen name="StudentGallery" component={StudentGalleryScreen} />
            <Stack.Screen name="EditAboutUs" component={AdminAboutUsScreen} />
            <Stack.Screen name="ManageHolidays" component={ManageHolidaysScreen} />
            <Stack.Screen name="SangeetSettings" component={SangeetSettingsScreen} />
            <Stack.Screen name="SangeetPackages" component={StudentSangeetScreen} />
            <Stack.Screen name="StudentSangeetInquiries" component={StudentSangeetInquiriesScreen} />
            <Stack.Screen name="MyEvents" component={MyEventsScreen} />
            <Stack.Screen name="MyReminders" component={MyRemindersScreen} />
            <Stack.Screen name="CreateReminder" component={CreateReminderScreen} />
            <Stack.Screen name="BatchEnrollment" component={BatchEnrollmentScreen} />
            <Stack.Screen name="PodcastHome" component={PodcastHomeScreen} />
            <Stack.Screen name="StudioBookingForm" component={StudioBookingFormScreen} />
            <Stack.Screen name="StudioMyBookings" component={StudioMyBookingsScreen} />
            <Stack.Screen name="StudioBookingsScreen" component={StudioBookingsScreen} />
            <Stack.Screen name="ManageAdmins" component={ManageAdminsScreen} />
            <Stack.Screen name="CalendarSchedule" component={CalendarScheduleScreen} />
            <Stack.Screen name="RegistrationPayment" component={RegistrationPaymentScreen} />
          </>
        ) : (
          // Auth Screens
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="AboutUs" component={AboutUsScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
