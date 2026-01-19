import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // 👁 Eye icons

const ForgotPasswordScreen = () => {
    const navigation = useNavigation();

    const [phoneOrEmail, setPhoneOrEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // 👁 Visibility toggles
    const [showOtp, setShowOtp] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSendOtp = () => {
        if (!phoneOrEmail) {
            Alert.alert('Error', 'Please enter your email or phone.');
            return;
        }
        setOtpSent(true);
        Alert.alert('OTP Sent', 'Check your phone/email for OTP.');
    };

    const handleResetPassword = () => {
        if (!otp || otp.length !== 6) {
            Alert.alert('Error', 'Enter a valid 6-digit OTP.');
            return;
        }
        if (!newPassword || newPassword.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters.');
            return;
        }
        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match.');
            return;
        }
        Alert.alert('Success', 'Password reset successfully!');
        navigation.navigate('SignIn');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Reset Your Password</Text>
            <Text style={styles.subtitle}>
                Enter your registered phone or email to reset your password.
            </Text>

            {/* Email/Phone Input */}
            <TextInput
                placeholder="Phone number or Email"
                value={phoneOrEmail}
                onChangeText={setPhoneOrEmail}
                style={styles.input}
                keyboardType="default"
            />

            {/* OTP + Password Section */}
            {otpSent && (
                <>
                    {/* OTP Input with Emoji Eye Toggle */}
                    <View style={styles.passwordContainer}>
                        <TextInput
                            placeholder="Enter OTP"
                            value={otp}
                            onChangeText={setOtp}
                            style={styles.passwordInput}
                            keyboardType="numeric"
                            maxLength={6}
                            secureTextEntry={!showOtp} // 👁
                        />
                        <TouchableOpacity onPress={() => setShowOtp(!showOtp)}>
                            <Text style={styles.emojiIcon}>{showOtp ? '🙈' : '👁️'}</Text>
                        </TouchableOpacity>
                    </View>

                    {/* New Password with Emoji Eye Toggle */}
                    <View style={styles.passwordContainer}>
                        <TextInput
                            placeholder="New Password"
                            value={newPassword}
                            onChangeText={setNewPassword}
                            style={styles.passwordInput}
                            secureTextEntry={!showNewPassword}
                        />
                        <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                            <Text style={styles.emojiIcon}>{showNewPassword ? '🙈' : '👁️'}</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Confirm Password with Emoji Eye Toggle */}
                    <View style={styles.passwordContainer}>
                        <TextInput
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            style={styles.passwordInput}
                            secureTextEntry={!showConfirmPassword}
                        />
                        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                            <Text style={styles.emojiIcon}>{showConfirmPassword ? '🙈' : '👁️'}</Text>
                        </TouchableOpacity>
                    </View>

                </>
            )}

            {/* Buttons */}
            {!otpSent ? (
                <TouchableOpacity style={styles.button} onPress={handleSendOtp}>
                    <Text style={styles.buttonText}>Send OTP</Text>
                </TouchableOpacity>
            ) : (
                <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
                    <Text style={styles.buttonText}>Reset Password</Text>
                </TouchableOpacity>
            )}

            {/* Back to Sign In */}
            <Text style={styles.footerText}>
                Remember password?{' '}
                <Text
                    style={styles.link}
                    onPress={() => navigation.navigate('SignIn')}
                >
                    Sign In
                </Text>
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
        padding: 25,
        paddingTop: 50,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#022D36',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: '#555',
        marginBottom: 25,
        textAlign: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        backgroundColor: '#FAFAFA',
        padding: 14,
        borderRadius: 10,
        fontSize: 15,
        marginBottom: 15,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        backgroundColor: '#FAFAFA',
        borderRadius: 10,
        paddingHorizontal: 12,
        marginBottom: 15,
    },
    passwordInput: {
        flex: 1,
        paddingVertical: 14,
        fontSize: 15,
    },
    button: {
        backgroundColor: '#FFD700',
        paddingVertical: 15,
        borderRadius: 50,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
        elevation: 4,
        ...(Platform.OS === 'web' && { cursor: 'pointer' }),
    },
    buttonText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 16,
    },
    footerText: {
        textAlign: 'center',
        color: '#555',
        fontSize: 14,
    },
    link: {
        color: '#022D36',
        fontWeight: 'bold',
    },
});

export default ForgotPasswordScreen;
