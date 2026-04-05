import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-toast-message';
import { authActions } from '../../store';
import { authAPI } from '../../api/client';
import { FONTS, SPACING, RADIUS, TYPE_SCALE } from '../../theme';

const C = {
  bg: '#020B18', bgCard: '#071929', bgInput: '#0A1E30',
  primary: '#C9A84C', primaryDark: '#A8882E',
  text: '#F0EDE5', textSec: '#94A3B8', textDim: '#4A6480',
  border: 'rgba(201,168,76,0.15)', error: '#EF4444',
};

const Input = ({ label, icon, error, secureRight, ...props }: any) => (
  <View style={{ marginBottom: SPACING.md }}>
    <Text style={{ fontFamily: FONTS.body.regular, color: C.textSec, fontSize: TYPE_SCALE.xs, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 }}>{label}</Text>
    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.bgInput, borderRadius: RADIUS.md, borderWidth: 1, borderColor: error ? C.error : C.border, paddingHorizontal: SPACING.md, height: 52 }}>
      {icon && <Ionicons name={icon} size={18} color={C.textDim} style={{ marginRight: 10 }} />}
      <TextInput style={{ flex: 1, color: C.text, fontFamily: FONTS.body.regular, fontSize: TYPE_SCALE.base }} placeholderTextColor={C.textDim} {...props} />
      {secureRight}
    </View>
    {error ? <Text style={{ color: C.error, fontSize: TYPE_SCALE.xs, fontFamily: FONTS.body.regular, marginTop: 4 }}>{error}</Text> : null}
  </View>
);

const GoldBtn = ({ title, onPress, loading }: any) => (
  <TouchableOpacity style={{ borderRadius: RADIUS.full, overflow: 'hidden', shadowColor: C.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 }} onPress={onPress} disabled={loading}>
    <LinearGradient colors={[C.primary, C.primaryDark]} style={{ paddingVertical: SPACING.base, alignItems: 'center' }}>
      {loading ? <ActivityIndicator color="#020B18" /> : <Text style={{ fontFamily: FONTS.body.bold, color: '#020B18', fontSize: TYPE_SCALE.base, letterSpacing: 1.5 }}>{title}</Text>}
    </LinearGradient>
  </TouchableOpacity>
);

// ── LOGIN SCREEN ─────────────────────────────────────────────
export const LoginScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const validate = () => {
    const e: any = {};
    if (!email.trim()) e.email = 'Email required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Invalid email';
    if (!password) e.password = 'Password required';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleLogin = async () => {
    if (!validate()) { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); return; }
    setLoading(true);
    try {
      const { data } = await authAPI.login({ email: email.toLowerCase().trim(), password });
      await SecureStore.setItemAsync('accessToken', data.accessToken);
      dispatch(authActions.setCredentials({ user: data.user, accessToken: data.accessToken }));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Toast.show({ type: 'error', text1: 'Login Failed', text2: err?.response?.data?.message || 'Check your credentials and make sure the backend is running.' });
    } finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: C.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <LinearGradient colors={['#020B18', '#071929', '#020B18']} style={StyleSheet.absoluteFill} />
      <ScrollView contentContainerStyle={{ flex: 1, padding: SPACING.xl, justifyContent: 'center' }} keyboardShouldPersistTaps="handled">
        {/* Brand */}
        <View style={{ alignItems: 'center', marginBottom: SPACING['2xl'] }}>
          <View style={{ width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(201,168,76,0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.md, borderWidth: 1, borderColor: C.border }}>
            <Ionicons name="boat" size={32} color={C.primary} />
          </View>
          <Text style={{ fontFamily: FONTS.display.bold, fontSize: TYPE_SCALE.xl, color: C.text, letterSpacing: 2 }}>PARK & LAUNCH</Text>
          <Text style={{ fontFamily: FONTS.body.regular, color: C.textSec, fontSize: TYPE_SCALE.sm, marginTop: 4 }}>Welcome back, Captain</Text>
        </View>

        <Input label="Email Address" icon="mail-outline" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="your@email.com" error={errors.email} />
        <Input label="Password" icon="lock-closed-outline" value={password} onChangeText={setPassword} secureTextEntry={!showPw} placeholder="••••••••" error={errors.password}
          secureRight={<TouchableOpacity onPress={() => setShowPw(p => !p)}><Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={18} color={C.textDim} /></TouchableOpacity>}
        />

        <TouchableOpacity style={{ alignItems: 'flex-end', marginBottom: SPACING.xl }} onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={{ fontFamily: FONTS.body.regular, color: C.primary, fontSize: TYPE_SCALE.sm }}>Forgot password?</Text>
        </TouchableOpacity>

        <GoldBtn title="SIGN IN" onPress={handleLogin} loading={loading} />

        {/* Hint box */}
        <View style={{ marginTop: SPACING.xl, padding: SPACING.md, borderRadius: RADIUS.md, borderWidth: 1, borderColor: C.border, backgroundColor: 'rgba(201,168,76,0.05)' }}>
          <Text style={{ fontFamily: FONTS.body.bold, color: C.primary, fontSize: TYPE_SCALE.xs, marginBottom: 6 }}>TEST CREDENTIALS</Text>
          <Text style={{ fontFamily: FONTS.body.regular, color: C.textSec, fontSize: TYPE_SCALE.xs }}>User:    ahmed@parkandlaunch.ae / user123</Text>
          <Text style={{ fontFamily: FONTS.body.regular, color: C.textSec, fontSize: TYPE_SCALE.xs }}>Admin:   admin@parkandlaunch.ae / admin123</Text>
          <Text style={{ fontFamily: FONTS.body.regular, color: C.textSec, fontSize: TYPE_SCALE.xs }}>Captain: captain@parkandlaunch.ae / captain123</Text>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: SPACING.xl }}>
          <Text style={{ fontFamily: FONTS.body.regular, color: C.textSec, fontSize: TYPE_SCALE.sm }}>New to Park & Launch?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={{ fontFamily: FONTS.body.bold, color: C.primary, fontSize: TYPE_SCALE.sm }}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// ── REGISTER SCREEN ───────────────────────────────────────────
export const RegisterScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const set = (f: string) => (v: string) => setForm(p => ({ ...p, [f]: v }));

  const validate = () => {
    const e: any = {};
    if (!form.name.trim()) e.name = 'Name required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
    if (!form.phone.trim()) e.phone = 'Phone required';
    if (form.password.length < 6) e.password = 'Min 6 characters';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const { data } = await authAPI.register({ name: form.name.trim(), email: form.email.toLowerCase().trim(), phone: form.phone.trim(), password: form.password });
      await SecureStore.setItemAsync('accessToken', data.accessToken);
      dispatch(authActions.setCredentials({ user: data.user, accessToken: data.accessToken }));
    } catch (err: any) {
      Toast.show({ type: 'error', text1: 'Registration Failed', text2: err?.response?.data?.message || 'Please try again' });
    } finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: C.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <LinearGradient colors={['#020B18', '#071929', '#020B18']} style={StyleSheet.absoluteFill} />
      <ScrollView contentContainerStyle={{ padding: SPACING.xl, paddingTop: SPACING['3xl'] }} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: SPACING.xl }}>
          <Ionicons name="arrow-back" size={24} color={C.text} />
        </TouchableOpacity>
        <View style={{ alignItems: 'center', marginBottom: SPACING['2xl'] }}>
          <Text style={{ fontFamily: FONTS.display.bold, fontSize: TYPE_SCALE.xl, color: C.text, letterSpacing: 2 }}>CREATE ACCOUNT</Text>
          <Text style={{ fontFamily: FONTS.body.regular, color: C.textSec, fontSize: TYPE_SCALE.sm, marginTop: 4 }}>Join Park & Launch today</Text>
        </View>
        <Input label="Full Name" icon="person-outline" value={form.name} onChangeText={set('name')} placeholder="Ahmed Al Rashidi" error={errors.name} />
        <Input label="Email Address" icon="mail-outline" value={form.email} onChangeText={set('email')} keyboardType="email-address" autoCapitalize="none" placeholder="your@email.com" error={errors.email} />
        <Input label="Phone Number" icon="call-outline" value={form.phone} onChangeText={set('phone')} keyboardType="phone-pad" placeholder="+971 50 000 0000" error={errors.phone} />
        <Input label="Password" icon="lock-closed-outline" value={form.password} onChangeText={set('password')} secureTextEntry placeholder="Min 6 characters" error={errors.password} />
        <Input label="Confirm Password" icon="lock-closed-outline" value={form.confirm} onChangeText={set('confirm')} secureTextEntry placeholder="Repeat password" error={errors.confirm} />
        <GoldBtn title="CREATE ACCOUNT" onPress={handleRegister} loading={loading} />
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: SPACING.xl }}>
          <Text style={{ fontFamily: FONTS.body.regular, color: C.textSec, fontSize: TYPE_SCALE.sm }}>Already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={{ fontFamily: FONTS.body.bold, color: C.primary, fontSize: TYPE_SCALE.sm }}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// ── OTP SCREEN ────────────────────────────────────────────────
export const OTPScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const inputs = React.useRef<any[]>([]);

  const handleChange = (val: string, idx: number) => {
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) inputs.current[idx + 1]?.focus();
    if (!val && idx > 0) inputs.current[idx - 1]?.focus();
    if (next.every(d => d) && next.join('').length === 6) verify(next.join(''));
  };

  const verify = async (code: string) => {
    setLoading(true);
    try {
      await authAPI.verifyOTP(code);
      dispatch(authActions.updateUser({ isPhoneVerified: true }));
      Toast.show({ type: 'success', text1: 'Phone Verified!' });
    } catch (err: any) {
      Toast.show({ type: 'error', text1: 'Invalid OTP', text2: err?.response?.data?.message });
      setOtp(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    } finally { setLoading(false); }
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <LinearGradient colors={['#020B18', '#071929', '#020B18']} style={StyleSheet.absoluteFill} />
      <View style={{ flex: 1, padding: SPACING.xl, justifyContent: 'center' }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: SPACING['2xl'] }}>
          <Ionicons name="arrow-back" size={24} color={C.text} />
        </TouchableOpacity>
        <View style={{ alignItems: 'center', marginBottom: SPACING['2xl'] }}>
          <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(201,168,76,0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.lg, borderWidth: 1, borderColor: C.border }}>
            <Ionicons name="phone-portrait-outline" size={36} color={C.primary} />
          </View>
          <Text style={{ fontFamily: FONTS.display.bold, fontSize: TYPE_SCALE['2xl'], color: C.text }}>Verify Phone</Text>
          <Text style={{ fontFamily: FONTS.body.regular, color: C.textSec, fontSize: TYPE_SCALE.sm, marginTop: 8, textAlign: 'center' }}>Enter the 6-digit code sent to your phone</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: SPACING['2xl'] }}>
          {otp.map((d, i) => (
            <TextInput key={i} ref={r => { if (r) inputs.current[i] = r; }}
              style={{ width: 48, height: 56, borderRadius: RADIUS.md, textAlign: 'center', fontFamily: FONTS.display.bold, fontSize: TYPE_SCALE.xl, color: C.text, backgroundColor: C.bgInput, borderWidth: d ? 2 : 1, borderColor: d ? C.primary : C.border }}
              value={d} onChangeText={v => handleChange(v.slice(-1), i)} keyboardType="numeric" maxLength={1} selectTextOnFocus
            />
          ))}
        </View>
        {loading && <ActivityIndicator color={C.primary} style={{ marginBottom: SPACING.md }} />}
        <GoldBtn title="VERIFY" onPress={() => verify(otp.join(''))} loading={loading} />
      </View>
    </View>
  );
};

// ── FORGOT PASSWORD SCREEN ────────────────────────────────────
export const ForgotPasswordScreen = () => {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <LinearGradient colors={['#020B18', '#071929']} style={StyleSheet.absoluteFill} />
      <View style={{ flex: 1, padding: SPACING.xl, justifyContent: 'center' }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: SPACING['2xl'] }}>
          <Ionicons name="arrow-back" size={24} color={C.text} />
        </TouchableOpacity>
        {sent ? (
          <View style={{ alignItems: 'center' }}>
            <Ionicons name="checkmark-circle" size={80} color="#10B981" />
            <Text style={{ fontFamily: FONTS.display.bold, fontSize: TYPE_SCALE['2xl'], color: C.text, marginTop: SPACING.lg, textAlign: 'center' }}>Email Sent</Text>
            <Text style={{ fontFamily: FONTS.body.regular, color: C.textSec, marginTop: SPACING.sm, textAlign: 'center' }}>Check your email for reset instructions.</Text>
            <TouchableOpacity style={{ marginTop: SPACING['2xl'], borderRadius: RADIUS.full, overflow: 'hidden', width: '100%' }} onPress={() => navigation.navigate('Login')}>
              <LinearGradient colors={[C.primary, C.primaryDark]} style={{ paddingVertical: SPACING.base, alignItems: 'center' }}>
                <Text style={{ fontFamily: FONTS.body.bold, color: '#020B18', fontSize: TYPE_SCALE.base }}>BACK TO LOGIN</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={{ fontFamily: FONTS.display.bold, fontSize: TYPE_SCALE['2xl'], color: C.text, marginBottom: SPACING.sm }}>Reset Password</Text>
            <Text style={{ fontFamily: FONTS.body.regular, color: C.textSec, marginBottom: SPACING['2xl'] }}>Enter your email to receive a reset code.</Text>
            <Input label="Email Address" icon="mail-outline" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="your@email.com" />
            <GoldBtn title="SEND RESET CODE" onPress={async () => {
              if (!email.trim()) return;
              setLoading(true);
              try { await authAPI.forgotPassword(email.toLowerCase().trim()); setSent(true); }
              catch { Toast.show({ type: 'error', text1: 'Failed', text2: 'Please try again' }); }
              finally { setLoading(false); }
            }} loading={loading} />
          </>
        )}
      </View>
    </View>
  );
};

export default LoginScreen;
