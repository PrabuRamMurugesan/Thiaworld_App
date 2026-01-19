// ProfileSettingsScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  Image,
  FlatList,
  TextInput,
  Modal,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_BASE = 'https://thiaworld.bbscart.com/api';

const ProfileSettingsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const [tier, setTier] = useState('Gold Member');
  const [profilePic, setProfilePic] = useState('');
  const [savedDesigns, setSavedDesigns] = useState([]);
  const [storeVisits, setStoreVisits] = useState([]);

  const [notifications, setNotifications] = useState({
    offers: true,
    newArrivals: true,
    goldRateAlerts: false,
  });

  const [theme, setTheme] = useState('light');
  const [editModalVisible, setEditModalVisible] = useState(false);

  /* ================= LOAD USER ================= */

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = await AsyncStorage.getItem('THIAWORLD_TOKEN');
        const userStr = await AsyncStorage.getItem('THIAWORLD_USER');
        const cachedUser = userStr ? JSON.parse(userStr) : null;

        if (!token) {
          navigation.replace('SignIn');
          return;
        }


        // Load cached user first (fast UI)
        if (cachedUser) {
          setProfile({
            name: cachedUser.name || '',
            email: cachedUser.email || '',
            phone: cachedUser.phone || '',
          });
          setTier(cachedUser.tier || 'Gold Member');
        }


        // Refresh from DB
        const res = await axios.get(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.data;

        const updatedUser = {
          name: data.name,
          email: data.email,
          phone: data.phone,
          tier: data.tier || 'Gold Member',
        };

        setProfile(updatedUser);
        setTier(updatedUser.tier);

        await AsyncStorage.setItem(
          'THIAWORLD_USER',
          JSON.stringify(updatedUser)
        );


        setLoading(false);
      } catch (err) {
        console.log('Profile load error', err);

        // ONLY redirect if token is invalid (401)
        if (err?.response?.status === 401) {
          console.log('Auth expired, staying on profile for now');
          setLoading(false);
        } 
 else {
          // Network or server issue → stay on profile
          setLoading(false);
        }
      }

    };

    loadUser();
  }, []);

  /* ================= ACTIONS ================= */

  const toggleNotification = (type) => {
    setNotifications((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  const handleSaveProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('THIAWORLD_TOKEN');

      if (!token) {
        Alert.alert('Session expired', 'Please login again');
        navigation.replace('SignIn');
        return;
      }

      const payload = {
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
      };

      const res = await axios.put(
        'https://thiaworld.bbscart.com/api/auth/me',
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const updatedUser = {
        name: res.data.name,
        email: res.data.email,
        phone: res.data.phone,
        tier: res.data.tier || tier,
      };

      // Update screen state
      setProfile(updatedUser);
      setTier(updatedUser.tier);

      // Persist to storage (IMPORTANT)
      await AsyncStorage.setItem(
        'THIAWORLD_USER',
        JSON.stringify(updatedUser)
      );

      setEditModalVisible(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (err) {
      console.log('Profile update error', err);
      Alert.alert(
        'Update failed',
        'Unable to update profile. Please try again.'
      );
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('THIAWORLD_TOKEN');
    await AsyncStorage.removeItem('THIAWORLD_USER');
    navigation.replace('SignIn');

  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete this account from this device?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('THIAWORLD_TOKEN');
              await axios.put(
                `${API_BASE}/auth/deactivate`,
                {},
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              await AsyncStorage.removeItem('bbsUser');
              navigation.replace('SignIn');
            } catch (err) {
              Alert.alert('Error', 'Failed to delete account');
            }
          },
        },
      ]
    );
  };

  /* ================= RENDERS ================= */

  const renderSavedDesign = ({ item }) => (
    <View style={styles.listItem}>
      <Text style={styles.listLabel}>{item.label}</Text>
      <Text style={styles.listDetails}>{item.details}</Text>
      <TouchableOpacity>
        <Text style={styles.actionText}>View</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStoreVisit = ({ item }) => (
    <View style={styles.listItem}>
      <Text style={styles.listLabel}>{item.label}</Text>
      <Text style={styles.listDetails}>{item.details}</Text>
      <TouchableOpacity>
        <Text style={styles.actionText}>Details</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>

        {/* Header */}
        <View style={styles.header}>
          {profilePic ? (
            <Image source={{ uri: profilePic }} style={styles.profilePic} />
          ) : (
            <View style={[styles.profilePic, { backgroundColor: 'gold' }]} />
          )}
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.tier}>{tier}</Text>
          <TouchableOpacity style={styles.editButton} onPress={() => setEditModalVisible(true)}>
            <Text style={styles.editText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Edit Profile Modal */}
        <Modal visible={editModalVisible} animationType="slide" transparent>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 10 }}>
                Edit Profile
              </Text>

              <TextInput
                style={styles.input}
                value={profile.name}
                onChangeText={(t) => setProfile((p) => ({ ...p, name: t }))}
                placeholder="Full Name"
              />

              <TextInput
                style={styles.input}
                value={profile.email}
                onChangeText={(t) => setProfile((p) => ({ ...p, email: t }))}
                placeholder="Email"
              />

              <TextInput
                style={styles.input}
                value={profile.phone}
                onChangeText={(t) => setProfile((p) => ({ ...p, phone: t }))}
                placeholder="Phone"
              />

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 }}>
                <TouchableOpacity style={styles.modalButton} onPress={() => setEditModalVisible(false)}>
                  <Text>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalButton} onPress={handleSaveProfile}>
                  <Text style={{ fontWeight: 'bold' }}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Quick Links */}
        <View style={styles.quickLinks}>
          <TouchableOpacity style={styles.quickLinkItem}><Text>Orders</Text></TouchableOpacity>
          <TouchableOpacity style={styles.quickLinkItem}><Text>Saved</Text></TouchableOpacity>
          <TouchableOpacity style={styles.quickLinkItem}><Text>Rewards</Text></TouchableOpacity>
          <TouchableOpacity style={styles.quickLinkItem}><Text>Gold Plan</Text></TouchableOpacity>
          <TouchableOpacity style={styles.quickLinkItem}><Text>Try@Home</Text></TouchableOpacity>
        </View>

        {/* Account Info */}
        <Text style={styles.sectionTitle}>My Account</Text>
        <View style={styles.section}>
          <Text style={styles.infoText}>Email: {profile.email}</Text>
          <Text style={styles.infoText}>Phone: {profile.phone}</Text>
        </View>

        {/* Saved Designs */}
        <Text style={styles.sectionTitle}>Saved Jewelry Collections</Text>
        <FlatList data={savedDesigns} renderItem={renderSavedDesign} keyExtractor={(i, k) => k.toString()} />

        {/* Store Visits */}
        <Text style={styles.sectionTitle}>Recent Showroom Visits</Text>
        <FlatList data={storeVisits} renderItem={renderStoreVisit} keyExtractor={(i, k) => k.toString()} />

        {/* Preferences */}
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.section}>
          <View style={styles.toggleRow}>
            <Text>Exclusive Offers</Text>
            <Switch value={notifications.offers} onValueChange={() => toggleNotification('offers')} />
          </View>
          <View style={styles.toggleRow}>
            <Text>New Collection Launches</Text>
            <Switch value={notifications.newArrivals} onValueChange={() => toggleNotification('newArrivals')} />
          </View>
          <View style={styles.toggleRow}>
            <Text>Gold Rate Alerts</Text>
            <Switch value={notifications.goldRateAlerts} onValueChange={() => toggleNotification('goldRateAlerts')} />
          </View>
          <View style={styles.toggleRow}>
            <Text>Dark Theme</Text>
            <Switch value={theme === 'dark'} onValueChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')} />
          </View>
        </View>

        {/* Account Actions */}
        <Text style={styles.sectionTitle}>Account Actions</Text>
        <View style={styles.section}>
          <TouchableOpacity onPress={handleLogout}>
            <Text style={[styles.actionText, { color: 'red' }]}>Logout</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDeleteAccount}>
            <Text style={[styles.actionText, { color: 'red' }]}>Delete Account</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

/* ================= STYLES (UNCHANGED) ================= */

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fdfaf5' },
  header: { alignItems: 'center', padding: 20, backgroundColor: '#ffe082', borderRadius: 10, margin: 10 },
  profilePic: { width: 80, height: 80, borderRadius: 40, marginBottom: 10 },
  name: { fontSize: 22, fontWeight: 'bold' },
  tier: { fontSize: 14, marginBottom: 5, fontStyle: 'italic' },
  editButton: { padding: 5, backgroundColor: '#fff', borderRadius: 5 },
  editText: { fontWeight: 'bold', color: '#000' },
  quickLinks: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around', marginVertical: 15 },
  quickLinkItem: { alignItems: 'center', padding: 10, backgroundColor: '#fff8e1', borderRadius: 8, width: width * 0.28, elevation: 2, margin: 5 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 15, marginTop: 20 },
  section: { backgroundColor: '#fff', margin: 10, borderRadius: 8, padding: 15, elevation: 2 },
  infoText: { fontSize: 14, marginBottom: 5 },
  listItem: { backgroundColor: '#fff', padding: 15, marginVertical: 5, borderRadius: 8, elevation: 1 },
  listLabel: { fontWeight: 'bold' },
  listDetails: { fontSize: 12, color: '#666', marginVertical: 3 },
  actionText: { color: '#c2185b', marginTop: 5 },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 10 },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: '#fff', padding: 20, borderRadius: 10, width: '90%' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, marginVertical: 5 },
  modalButton: { padding: 10, backgroundColor: '#ffe0b2', borderRadius: 5, width: 100, alignItems: 'center' },
});

export default ProfileSettingsScreen;
