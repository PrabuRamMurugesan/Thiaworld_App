import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  Button,
  ScrollView,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { showMessage } from 'react-native-flash-message';

const initialNotifications = [
  { id: '1', type: 'push', title: 'Order Shipped', message: 'Your gold necklace #12345 has been shipped with insurance.', read: false },
  { id: '2', type: 'email', title: 'Festive Offer', message: 'Get 20% off on making charges this Diwali!', read: false },
  { id: '3', type: 'email', title: 'Security Update', message: 'Your account password was changed successfully.', read: false },
  { id: '4', type: 'push', title: 'App Update', message: 'Explore our new jewellery collection in the app.', read: false },
  { id: '5', type: 'sms', title: 'Reminder', message: 'Visit our showroom for free gold purity check tomorrow.', read: false },
];

const Notifications = () => {
  const navigation = useNavigation();

  const [notifications, setNotifications] = useState(initialNotifications);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(true);

  const toggleSwitch = (type) => {
    if (type === 'email') setEmailNotifications((prev) => !prev);
    if (type === 'push') setPushNotifications((prev) => !prev);
    if (type === 'sms') setSmsNotifications((prev) => !prev);
  };

  const handleSaveSettings = () => {
    showMessage({
      message: 'Success!',
      description: 'Notification settings saved successfully.',
      type: 'success',
      icon: 'success',
    });
    navigation.navigate('Home');
  };

  const handleMarkAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item))
    );
    showMessage({
      message: 'Notification Read',
      description: 'You have marked this notification as read.',
      type: 'info',
      icon: 'info',
    });
  };

  const filteredNotifications = notifications.filter((item) => {
    if (item.type === 'email' && emailNotifications) return true;
    if (item.type === 'push' && pushNotifications) return true;
    if (item.type === 'sms' && smsNotifications) return true;
    return false;
  });

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Notifications</Text>

      <FlatList
        data={filteredNotifications}
        keyExtractor={(item) => item.id}
        style={styles.notificationList}
        renderItem={({ item }) => (
          <View
            style={[
              styles.notificationItem,
              item.read && { backgroundColor: '#f2e8d5' },
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.notificationTitle}>{item.title}</Text>
              <Text style={styles.notificationMessage}>{item.message}</Text>
            </View>
            {!item.read && (
              <TouchableOpacity
                style={styles.markReadButton}
                onPress={() => handleMarkAsRead(item.id)}
              >
                <Text style={styles.markReadText}>Mark as Read</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />

      <Text style={[styles.heading, { marginTop: 20 }]}>
        Notification Settings
      </Text>
      <ScrollView contentContainerStyle={styles.settingsContainer}>
        <View style={styles.settingItem}>
          <Text style={styles.settingTitle}>Email Notifications</Text>
          <Switch
            value={emailNotifications}
            onValueChange={() => toggleSwitch('email')}
            trackColor={{ false: '#ccc', true: '#e0c068' }}
            thumbColor={emailNotifications ? '#B8860B' : '#f4f3f4'}
          />
        </View>
        <View style={styles.settingItem}>
          <Text style={styles.settingTitle}>Push Notifications</Text>
          <Switch
            value={pushNotifications}
            onValueChange={() => toggleSwitch('push')}
            trackColor={{ false: '#ccc', true: '#e0c068' }}
            thumbColor={pushNotifications ? '#B8860B' : '#f4f3f4'}
          />
        </View>
        <View style={styles.settingItem}>
          <Text style={styles.settingTitle}>SMS Notifications</Text>
          <Switch
            value={smsNotifications}
            onValueChange={() => toggleSwitch('sms')}
            trackColor={{ false: '#ccc', true: '#e0c068' }}
            thumbColor={smsNotifications ? '#B8860B' : '#f4f3f4'}
          />
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSaveSettings}
        activeOpacity={0.8}
      >
        <Text style={styles.saveButtonText}>Save Settings</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 18,
    backgroundColor: '#faf8f3',
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4A2C2A',
    marginBottom: 10,
  },
  notificationList: {
    maxHeight: 450,
    marginBottom: 15,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#B8860B',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  notificationTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#4A2C2A',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#555',
    marginTop: 2,
  },
  markReadButton: {
    backgroundColor: '#B8860B',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginLeft: 10,
  },
  markReadText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  settingsContainer: {
    flexGrow: 1,
    marginTop: 10,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    elevation: 2,
    marginBottom: 10,
    shadowColor: '#B8860B',
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  settingTitle: {
    fontSize: 16,
    color: '#4A2C2A',
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#B8860B',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 15,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
});

export default Notifications;
