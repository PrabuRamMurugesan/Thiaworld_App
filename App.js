import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Image } from 'react-native';
import { CartProvider } from './src/contexts/CartContext';
import { WishlistProvider } from './src/contexts/WishlistContext';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import ErrorBoundary from './src/components/ErrorBoundary';
import CustomDrawer from './src/components/CustomDrawer';

// ✅ Logo for header
const ThiaworldLogo = require('./src/assets/thiaworldlogo.png');
import Home from './src/screens/HomeScreen';
import ProductListings from './src/screens/ProductListing';
import ProductDetails from './src/screens/ProductDetail';
import CartPage from './src/screens/CartScreen';
import Notifications from './src/screens/Notifications';
import ProfileSettingsScreen from './src/screens/ProfileSettingsScreen';
import AppSettingsScreen from './src/screens/AppSettingsScreen';
import UserAccount from './src/screens/UserAccount';
import MyWalletStyled from './src/screens/MyWallet';
import OrderHistory from './src/screens/OrderHistory';
import JewelryWishlist from './src/screens/Wishlist';
import GoldExchangeBuyback from './src/screens/GoldExchangeBuyback';
import SaveCardAndUPI from './src/screens/SaveCardAndUPI';
import BookStoreVisit from './src/screens/BookStoreVisit';
import RewardsScreen from './src/screens/RewardsScreen';
import SavedAddressScreen from './src/screens/SavedAddressScreen';
import DashboardScreen from './src/screens/Dashboard';
import FranchiseDashboard from './src/screens/FranchiseHeadScreen';
import TerritoryDashboardScreen from './src/screens/TerritoryHead';
import AgentScreen from './src/screens/AgentScreen';
import VendorDashboard from './src/screens/VendorScreen';
import BecomeVendorDashboard from './src/screens/BecomeVendorScreen';
import CheckoutPage from './src/screens/CheckoutScreen';
import SuccessPage from './src/screens/SuccessPage';
import IntroScreen from './src/screens/IntroScreen';
import SignInScreen from './src/screens/SignInScreen';
import Registration from './src/screens/SignUp';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import GoldSilverRatesScreen from './src/screens/GoldSilverRatesScreen';
import AboutUsScreen from './src/screens/Aboutus';
import TermsAndConditionsPage from './src/screens/TermsAndConditions';
import ContactUsScreen from './src/screens/ContactUs';
import ThiaSecurePlan from './src/screens/ThiaSecurePlan';
import SearchScreen from './src/screens/SearchScreen';
import GoldPlanScreen from './src/screens/GoldPlanScreen';
import TryAtHomeScreen from './src/screens/TryAtHomeScreen';

// Navigators
const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

/* ------------------ Auth Stack ------------------ */
function AuthStack() {
  const { colors, isDark } = useTheme();
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: true,
        headerStyle: { backgroundColor: colors.header },
        headerTintColor: colors.text,
        headerTitleStyle: { color: colors.text },
      }}
    >
      <Stack.Screen name="Intro" component={IntroScreen}  options={{ headerShown: false }} />
      <Stack.Screen name="SignIn" component={SignInScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SignUp" component={Registration} options={{ headerShown: false }} />
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{
          title: 'Forgot Password',
          headerTitleAlign: 'center',
          headerStyle: { backgroundColor: colors.header },
          headerTintColor: colors.text,
          headerTitleStyle: { color: colors.text },
        }}
      />
    </Stack.Navigator>
  );
}

/* ------------------ Home Drawer Navigator ------------------ */
function HomeDrawer() {
  const { colors, isDark } = useTheme();
  
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawer {...props} />}
      initialRouteName="HomeMain"
      screenOptions={{
        headerShown: true,
        drawerType: 'front', // Use 'front' type
        overlayColor: 'rgba(0, 0, 0, 0.5)', // Add overlay for better UX
        drawerStyle: {
          backgroundColor: colors.background,
          width: 280,
        },
        headerStyle: {
          backgroundColor: colors.header,
          height: 80,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          color: colors.text,
          fontWeight: '600',
        },
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: colors.text,
        swipeEnabled: true,
        swipeEdgeWidth: 50,
      }}
    >
      <Drawer.Screen
        name="HomeMain"
        component={Home}
        options={{
          headerShown: false, // Hide drawer header, use Home screen's custom header
        }}
      />
    </Drawer.Navigator>
  );
}

/* ------------------ Main App Navigator (with Theme) ------------------ */
function AppNavigator() {
  const { colors, isDark } = useTheme();
  
  return (
    <NavigationContainer
      theme={{
        dark: isDark,
        colors: {
          primary: colors.primary,
          background: colors.background,
          card: colors.card,
          text: colors.text,
          border: colors.border,
          notification: colors.primary,
        },
        fonts: {
          regular: {
            fontFamily: 'System',
            fontWeight: '400',
          },
          medium: {
            fontFamily: 'System',
            fontWeight: '500',
          },
          bold: {
            fontFamily: 'System',
            fontWeight: '700',
          },
          heavy: {
            fontFamily: 'System',
            fontWeight: '800',
          },
        },
      }}
    >
      <Stack.Navigator 
        initialRouteName="Welcome" // ✅ Set initial route
        screenOptions={{ 
          headerShown: true,
          headerStyle: { backgroundColor: colors.header },
          headerTintColor: colors.text,
          headerTitleStyle: { 
            color: colors.text,
            fontWeight: '600', // ✅ Add fontWeight to prevent font access errors
          },
          cardStyle: { backgroundColor: colors.background },
        }}
      >
              
              {/* Auth Flow */}
              <Stack.Screen 
                name="Welcome" 
                component={AuthStack}  
                options={{ headerShown: false }}
              />

              {/* Main App Screens */}
              <Stack.Screen
                name="Intro"
                component={IntroScreen}
                options={{
                  title: '',
                  headerTitleAlign: 'center',
                  headerTitleStyle: {
                    fontWeight: 'bold',
                    fontSize: 20,
                    color: colors.text,
                  },
                  headerStyle: {
                    backgroundColor: colors.header,
                  },
                }}
              />

              <Stack.Screen
                name="SignUp"
                component={Registration}
                options={{
                  title: 'Sign Up',
                  headerStyle: { backgroundColor: colors.header },
                  headerTintColor: colors.text,
                  headerTitleStyle: { color: colors.text },
                }}
              />

              <Stack.Screen
                name="ThiaSecurePlan"
                component={ThiaSecurePlan}
                options={{
                  title: 'Thia Secure Plan',
                  headerStyle: { backgroundColor: colors.header },
                  headerTintColor: colors.text,
                  headerTitleStyle: { color: colors.text },
                }}
              />

              <Stack.Screen
                name="SignIn"
                component={SignInScreen}
                options={{
                  title: 'Sign In',
                  headerStyle: { backgroundColor: colors.header },
                  headerTintColor: colors.text,
                  headerTitleStyle: { color: colors.text },
                }}
              />
               
              <Stack.Screen
                name="ForgotPassword"
                component={ForgotPasswordScreen}
                options={{
                  title: 'Forgot Password',
                  headerStyle: { backgroundColor: colors.header },
                  headerTintColor: colors.text,
                  headerTitleStyle: { color: colors.text },
                }}
              />

              <Stack.Screen
                name="Home"
                component={HomeDrawer}
                options={{
                  headerShown: false,
                }}
              />

              <Stack.Screen
                name="Search"
                component={SearchScreen}
                options={{ headerShown: false }}
              />

              <Stack.Screen
                name="Products"
                component={ProductListings}
                options={{
                  title: 'Product Listings',
                  headerStyle: { backgroundColor: colors.header },
                  headerTintColor: colors.text,
                  headerTitleStyle: { color: colors.text },
                }}
              />

              <Stack.Screen
                name="ProductDetails"
                component={ProductDetails}
                options={{
                  title: 'Product Details',
                  headerStyle: { backgroundColor: colors.header },
                  headerTintColor: colors.text,
                  headerTitleStyle: { color: colors.text },
                }}
              />

              <Stack.Screen
                name="Cart"
                component={CartPage}
                options={{
                  title: 'My Cart',
                  headerStyle: { backgroundColor: colors.header },
                  headerTintColor: colors.text,
                  headerTitleStyle: { color: colors.text },
                }}
              />

              <Stack.Screen
                name="Notifications"
                component={Notifications}
                options={{
                  title: 'Notifications',
                  headerStyle: { backgroundColor: colors.header },
                  headerTintColor: colors.text,
                  headerTitleStyle: { color: colors.text },
                }}
              />

              <Stack.Screen
                name="Account"
                component={UserAccount}
                options={{
                  title: 'Account',
                  headerStyle: { backgroundColor: colors.header },
                  headerTintColor: colors.text,
                  headerTitleStyle: { color: colors.text },
                }}
              />

              <Stack.Screen
                name='MyWallet'
                component={MyWalletStyled}
                options={{
                  title: 'My Wallet',
                  headerStyle: { backgroundColor: colors.header },
                  headerTintColor: colors.text,
                  headerTitleStyle: { color: colors.text },
                }}
              />

              <Stack.Screen
                name="Profile"
                component={ProfileSettingsScreen}
                options={{
                  title: 'Profile',
                  headerStyle: { backgroundColor: colors.header },
                  headerTintColor: colors.text,
                  headerTitleStyle: { color: colors.text },
                }}
              />

              <Stack.Screen
                name="Orders"
                component={OrderHistory}
                options={{
                  title: 'Order History',
                  headerStyle: { backgroundColor: colors.header },
                  headerTintColor: colors.text,
                  headerTitleStyle: { color: colors.text },
                }}
              />

              <Stack.Screen
                name="Wishlist"
                component={JewelryWishlist}
                options={{
                  title: 'My Wishlist',
                  headerStyle: { backgroundColor: colors.header },
                  headerTintColor: colors.text,
                  headerTitleStyle: { color: colors.text },
                }}
              />

              <Stack.Screen
                name="Exchange"
                component={GoldExchangeBuyback}
                options={{
                  title: 'Gold Exchange Buy ',
                  headerStyle: { backgroundColor: colors.header },
                  headerTintColor: colors.text,
                  headerTitleStyle: { color: colors.text },
                }}
              />

              <Stack.Screen
                name="Payments"
                component={SaveCardAndUPI}
                options={{
                  title: 'My Bank Account ',
                  headerStyle: { backgroundColor: colors.header },
                  headerTintColor: colors.text,
                  headerTitleStyle: { color: colors.text },
                }}
              />

              <Stack.Screen
                name="StoreVisit"
                component={BookStoreVisit}
                options={{
                  title: 'Book Store Visit ',
                  headerStyle: { backgroundColor: colors.header },
                  headerTintColor: colors.text,
                  headerTitleStyle: { color: colors.text },
                }}
              />

              <Stack.Screen
                name="Rewards"
                component={RewardsScreen}
                options={{
                  title: 'Exclusive Offers',
                  headerStyle: { backgroundColor: colors.header },
                  headerTintColor: colors.text,
                  headerTitleStyle: { color: colors.text },
                }}
              />

              <Stack.Screen
                name="GoldPlan"
                component={GoldPlanScreen}
                options={{
                  title: 'Gold Plan',
                  headerStyle: { backgroundColor: colors.header },
                  headerTintColor: colors.text,
                  headerTitleStyle: { color: colors.text },
                }}
              />

              <Stack.Screen
                name="TryAtHome"
                component={TryAtHomeScreen}
                options={{
                  title: 'Try@Home',
                  headerStyle: { backgroundColor: colors.header },
                  headerTintColor: colors.text,
                  headerTitleStyle: { color: colors.text },
                }}
              />

              <Stack.Screen
                name="ProfileSettings"
                component={ProfileSettingsScreen}
                options={{
                  title: 'Profile Settings',
                  headerStyle: { backgroundColor: colors.header },
                  headerTintColor: colors.text,
                  headerTitleStyle: { color: colors.text },
                }}
              />

              <Stack.Screen
                name="Settings"
                component={AppSettingsScreen}
                options={{
                  title: 'App Settings',
                  headerStyle: { backgroundColor: colors.header },
                  headerTintColor: colors.text,
                  headerTitleStyle: { color: colors.text },
                }}
              />

              <Stack.Screen
                name="Addresses"
                component={SavedAddressScreen}
                options={{
                  title: 'My Address',
                  headerStyle: { backgroundColor: colors.header },
                  headerTintColor: colors.text,
                  headerTitleStyle: { color: colors.text },
                }}
              />
              
              <Stack.Screen
                name="Ratings"
                component={GoldSilverRatesScreen}
                options={{
                  title: 'Gold & Silver Ranges',
                  headerStyle: { backgroundColor: colors.header },
                  headerTintColor: colors.text,
                  headerTitleStyle: { color: colors.text },
                }}
              />

              <Stack.Screen
                name="Dashboard"
                component={DashboardScreen}
                options={{
                  title: 'Dashboard',
                  headerStyle: { backgroundColor: colors.header },
                  headerTintColor: colors.text,
                  headerTitleStyle: { color: colors.text },
                }}
              />

              <Stack.Screen
                name="Franchise"
                component={FranchiseDashboard}
                options={{
                  title: 'Franchise Dashboard',
                  headerStyle: { backgroundColor: colors.header },
                  headerTintColor: colors.text,
                  headerTitleStyle: { color: colors.text },
                }}
              />

              <Stack.Screen
                name="Territory"
                component={TerritoryDashboardScreen}
                options={{
                  title: 'Territory Dashboard',
                  headerStyle: { backgroundColor: colors.header },
                  headerTintColor: colors.text,
                  headerTitleStyle: { color: colors.text },
                }}
              />

              <Stack.Screen
                name="Agent"
                component={AgentScreen}
                options={{
                  title: 'Agent Dashboard',
                  headerStyle: { backgroundColor: colors.header },
                  headerTintColor: colors.text,
                  headerTitleStyle: { color: colors.text },
                }}
              />

              <Stack.Screen
                name="Vendor"
                component={VendorDashboard}
                options={{
                  title: 'Vendor Dashboard',
                  headerStyle: { backgroundColor: colors.header },
                  headerTintColor: colors.text,
                  headerTitleStyle: { color: colors.text },
                }}
              />

              <Stack.Screen
                name="BecomeAVendor"
                component={BecomeVendorDashboard}
                options={{
                  title: 'Become A Vendor Dashboard',
                  headerStyle: { backgroundColor: colors.header },
                  headerTintColor: colors.text,
                  headerTitleStyle: { color: colors.text },
                }}
              />

              <Stack.Screen
                name="Checkout"
                component={CheckoutPage}
                options={{
                  title: 'Checkout',
                  headerStyle: { backgroundColor: colors.header },
                  headerTintColor: colors.text,
                  headerTitleStyle: { color: colors.text },
                }}
              />
              
              <Stack.Screen
                name="AboutUs"
                component={AboutUsScreen}
                options={{
                  title: 'About Us',
                  headerStyle: { backgroundColor: colors.header },
                  headerTintColor: colors.text,
                  headerTitleStyle: { color: colors.text },
                }}
              />

              <Stack.Screen
                name="TermsAndConditions"
                component={TermsAndConditionsPage}
                options={{
                  title: 'Terms And Conditions',
                  headerStyle: { backgroundColor: colors.header },
                  headerTintColor: colors.text,
                  headerTitleStyle: { color: colors.text },
                }}
              />

              <Stack.Screen
                name="ContactUs"
                component={ContactUsScreen}
                options={{
                  title: 'Contact Us',
                  headerStyle: { backgroundColor: colors.header },
                  headerTintColor: colors.text,
                  headerTitleStyle: { color: colors.text },
                }}
              />

              <Stack.Screen
                name="Success"
                component={SuccessPage}
                options={{
                  title: 'Successfully',
                  headerStyle: { backgroundColor: colors.header },
                  headerTintColor: colors.text,
                  headerTitleStyle: { color: colors.text },
                }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        );
      }

export default function App() {
  console.log('📱 App component rendering...');
  
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <WishlistProvider>
          <CartProvider>
            <AppNavigator />
          </CartProvider>
        </WishlistProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}