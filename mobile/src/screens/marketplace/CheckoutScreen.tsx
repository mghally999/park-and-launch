import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { THEMES, FONTS, SPACING, RADIUS, TYPE_SCALE } from '../../theme';
import { marketplaceActions } from '../../store';

const STEPS = ['Delivery', 'Payment', 'Confirm'];

export default function CheckoutScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const themeId = useSelector((s: any) => s.ui?.theme || 'deep_ocean');
  const theme = THEMES[themeId] || THEMES.deep_ocean;
  const { total = 0, cart = [] } = route.params || {};

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [paid, setPaid] = useState(false);

  const [delivery, setDelivery] = useState({ name: 'Ahmed Al Rashidi', phone: '+971 50 111 2222', area: 'Dubai Marina', street: 'Marina Walk, Building 5, Apt 201', notes: '' });
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [cardErrors, setCardErrors] = useState<any>({});

  const formatCardNumber = (v: string) => v.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19);
  const formatExpiry = (v: string) => { const d = v.replace(/\D/g, ''); return d.length >= 2 ? d.slice(0,2) + '/' + d.slice(2,4) : d; };

  const validateCard = () => {
    const e: any = {};
    const num = card.number.replace(/\s/g, '');
    if (num.length < 16) e.number = 'Invalid card number';
    if (!card.expiry.includes('/') || card.expiry.length < 5) e.expiry = 'Invalid expiry';
    if (card.cvv.length < 3) e.cvv = 'Invalid CVV';
    if (!card.name.trim()) e.name = 'Name required';
    setCardErrors(e);
    return !Object.keys(e).length;
  };

  const handlePay = async () => {
    if (!validateCard()) return;
    setLoading(true);
    // Simulate Stripe payment processing
    await new Promise(r => setTimeout(r, 3000));
    setLoading(false);
    setPaid(true);
    setStep(2);
    dispatch(marketplaceActions.clearCart());
  };

  const getCardBrand = () => {
    const n = card.number.replace(/\s/g, '');
    if (n.startsWith('4')) return 'visa';
    if (n.startsWith('5') || n.startsWith('2')) return 'card';
    if (n.startsWith('3')) return 'card';
    return 'card-outline';
  };

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.bg },
    header: { flexDirection: 'row', alignItems: 'center', padding: SPACING.base, gap: SPACING.md },
    title: { fontFamily: FONTS.display.bold, fontSize: TYPE_SCALE.xl, color: theme.colors.textPrimary, flex: 1 },
    stepRow: { flexDirection: 'row', marginHorizontal: SPACING.base, marginBottom: SPACING.xl },
    stepItem: { flex: 1, alignItems: 'center' },
    stepLine: { flex: 1, height: 2, marginTop: 11 },
    stepCircle: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
    stepLabel: { fontFamily: FONTS.body.regular, fontSize: 10, marginTop: 4 },
    section: { backgroundColor: theme.colors.bgCard, borderRadius: RADIUS.xl, margin: SPACING.base, padding: SPACING.base, borderWidth: 1, borderColor: theme.colors.border },
    sectionTitle: { fontFamily: FONTS.display.regular, fontSize: TYPE_SCALE.base, color: theme.colors.primary, letterSpacing: 1, marginBottom: SPACING.md },
    label: { fontFamily: FONTS.body.medium, color: theme.colors.textSecondary, fontSize: TYPE_SCALE.xs, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6, marginTop: SPACING.sm },
    input: { backgroundColor: theme.colors.bgInput, borderRadius: RADIUS.md, borderWidth: 1, borderColor: theme.colors.border, paddingHorizontal: SPACING.md, height: 48, color: theme.colors.textPrimary, fontFamily: FONTS.body.regular, fontSize: TYPE_SCALE.base },
    inputError: { borderColor: theme.colors.error },
    errorText: { color: theme.colors.error, fontSize: 11, fontFamily: FONTS.body.regular, marginTop: 4 },
    row2: { flexDirection: 'row', gap: SPACING.sm },
    securityBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: theme.colors.greenBg, borderRadius: RADIUS.md, padding: SPACING.sm, marginTop: SPACING.md },
    secBadgeText: { fontFamily: FONTS.body.regular, color: theme.colors.green, fontSize: TYPE_SCALE.xs },
    stripeNote: { fontFamily: FONTS.body.regular, color: theme.colors.textTertiary, fontSize: 10, textAlign: 'center', marginTop: SPACING.sm },
    payBtn: { margin: SPACING.base, borderRadius: RADIUS.full, overflow: 'hidden', ...theme.shadows.gold },
    payInner: { paddingVertical: SPACING.base, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
    payText: { fontFamily: FONTS.body.bold, color: '#020B18', fontSize: TYPE_SCALE.base, letterSpacing: 1 },
    successContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING['2xl'] },
    successIcon: { width: 100, height: 100, borderRadius: 50, backgroundColor: theme.colors.greenBg, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.xl, borderWidth: 2, borderColor: theme.colors.green },
    successTitle: { fontFamily: FONTS.display.bold, fontSize: TYPE_SCALE['2xl'], color: theme.colors.textPrimary, textAlign: 'center' },
    successSub: { fontFamily: FONTS.body.regular, color: theme.colors.textSecondary, textAlign: 'center', marginTop: SPACING.sm, lineHeight: 22 },
    orderRef: { fontFamily: FONTS.display.bold, color: theme.colors.primary, fontSize: TYPE_SCALE.lg, marginTop: SPACING.md, letterSpacing: 2 },
  });

  const StepIndicator = () => (
    <View style={s.stepRow}>
      {STEPS.map((label, i) => (
        <React.Fragment key={i}>
          <View style={s.stepItem}>
            <View style={[s.stepCircle, { borderColor: i <= step ? theme.colors.primary : theme.colors.border, backgroundColor: i < step ? theme.colors.primary : 'transparent' }]}>
              {i < step ? <Ionicons name="checkmark" size={12} color="#020B18" /> : <Text style={{ fontFamily: FONTS.body.bold, color: i === step ? theme.colors.primary : theme.colors.textTertiary, fontSize: 10 }}>{i+1}</Text>}
            </View>
            <Text style={[s.stepLabel, { color: i === step ? theme.colors.primary : theme.colors.textTertiary }]}>{label}</Text>
          </View>
          {i < STEPS.length - 1 && <View style={[s.stepLine, { backgroundColor: i < step ? theme.colors.primary : theme.colors.border }]} />}
        </React.Fragment>
      ))}
    </View>
  );

  if (paid) return (
    <SafeAreaView style={s.container}>
      <View style={s.successContainer}>
        <View style={s.successIcon}><Ionicons name="checkmark" size={50} color={theme.colors.green} /></View>
        <Text style={s.successTitle}>Order Confirmed!</Text>
        <Text style={s.successSub}>Your order has been placed successfully. You will receive a confirmation email shortly with tracking information.</Text>
        <Text style={s.orderRef}>ORD-{Date.now().toString(36).toUpperCase()}</Text>
        <TouchableOpacity style={[s.payBtn, { marginTop: SPACING['2xl'] }]} onPress={() => navigation.navigate('Marketplace')}>
          <LinearGradient colors={theme.gradients.gold as any} style={{ paddingVertical: 14, paddingHorizontal: 40, borderRadius: RADIUS.full }}>
            <Text style={s.payText}>CONTINUE SHOPPING</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => step > 0 ? setStep(s => s - 1) : navigation.goBack()}><Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} /></TouchableOpacity>
        <Text style={s.title}>Checkout</Text>
        <Text style={{ fontFamily: FONTS.display.bold, color: theme.colors.primary, fontSize: TYPE_SCALE.base }}>{total.toLocaleString()} AED</Text>
      </View>

      <StepIndicator />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {step === 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>DELIVERY ADDRESS</Text>
            <Text style={s.label}>Full Name</Text>
            <TextInput style={s.input} value={delivery.name} onChangeText={v => setDelivery(d => ({...d, name: v}))} />
            <Text style={s.label}>Phone</Text>
            <TextInput style={s.input} value={delivery.phone} onChangeText={v => setDelivery(d => ({...d, phone: v}))} keyboardType="phone-pad" />
            <Text style={s.label}>Area / Emirate</Text>
            <TextInput style={s.input} value={delivery.area} onChangeText={v => setDelivery(d => ({...d, area: v}))} placeholder="Dubai Marina, JBR, etc." placeholderTextColor={theme.colors.textTertiary} />
            <Text style={s.label}>Street Address</Text>
            <TextInput style={s.input} value={delivery.street} onChangeText={v => setDelivery(d => ({...d, street: v}))} />
            <Text style={s.label}>Delivery Notes (Optional)</Text>
            <TextInput style={[s.input, { height: 80, paddingTop: 12 }]} value={delivery.notes} onChangeText={v => setDelivery(d => ({...d, notes: v}))} placeholder="Leave at gate, call on arrival..." placeholderTextColor={theme.colors.textTertiary} multiline />
          </View>
        )}

        {step === 1 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>PAYMENT DETAILS</Text>
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: SPACING.md }}>
              {['visa', 'mastercard', 'amex'].map(brand => (
                <View key={brand} style={{ backgroundColor: theme.colors.bgElevated, borderRadius: RADIUS.sm, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: theme.colors.border }}>
                  <Ionicons name="card" size={16} color={theme.colors.primary} />
                </View>
              ))}
              <Text style={{ fontFamily: FONTS.body.regular, color: theme.colors.textSecondary, fontSize: 10, alignSelf: 'center' }}>Visa · Mastercard · Amex</Text>
            </View>
            <Text style={s.label}>Card Number</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.bgInput, borderRadius: RADIUS.md, borderWidth: 1, borderColor: cardErrors.number ? theme.colors.error : theme.colors.border, paddingHorizontal: SPACING.md, height: 48 }}>
              <Ionicons name={getCardBrand() as any} size={22} color={theme.colors.primary} style={{ marginRight: 10 }} />
              <TextInput style={{ flex: 1, color: theme.colors.textPrimary, fontFamily: FONTS.body.regular, fontSize: TYPE_SCALE.base, letterSpacing: 2 }} value={card.number} onChangeText={v => setCard(c => ({...c, number: formatCardNumber(v)}))} placeholder="1234 5678 9012 3456" placeholderTextColor={theme.colors.textTertiary} keyboardType="numeric" maxLength={19} />
            </View>
            {cardErrors.number && <Text style={s.errorText}>{cardErrors.number}</Text>}
            <View style={s.row2}>
              <View style={{ flex: 1 }}>
                <Text style={s.label}>Expiry Date</Text>
                <TextInput style={[s.input, cardErrors.expiry && s.inputError]} value={card.expiry} onChangeText={v => setCard(c => ({...c, expiry: formatExpiry(v)}))} placeholder="MM/YY" placeholderTextColor={theme.colors.textTertiary} keyboardType="numeric" maxLength={5} />
                {cardErrors.expiry && <Text style={s.errorText}>{cardErrors.expiry}</Text>}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.label}>CVV</Text>
                <TextInput style={[s.input, cardErrors.cvv && s.inputError]} value={card.cvv} onChangeText={v => setCard(c => ({...c, cvv: v.replace(/\D/g, '').slice(0,4)}))} placeholder="•••" placeholderTextColor={theme.colors.textTertiary} keyboardType="numeric" secureTextEntry maxLength={4} />
                {cardErrors.cvv && <Text style={s.errorText}>{cardErrors.cvv}</Text>}
              </View>
            </View>
            <Text style={s.label}>Cardholder Name</Text>
            <TextInput style={[s.input, cardErrors.name && s.inputError]} value={card.name} onChangeText={v => setCard(c => ({...c, name: v}))} placeholder="As printed on card" placeholderTextColor={theme.colors.textTertiary} autoCapitalize="words" />
            {cardErrors.name && <Text style={s.errorText}>{cardErrors.name}</Text>}
            <View style={s.securityBadge}>
              <Ionicons name="lock-closed" size={14} color={theme.colors.green} />
              <Text style={s.secBadgeText}>256-bit SSL encrypted · Powered by Stripe · PCI DSS compliant</Text>
            </View>
            <Text style={s.stripeNote}>Your card details are encrypted and never stored on our servers.</Text>
          </View>
        )}
      </ScrollView>

      {step < 2 && !paid && (
        loading ? (
          <View style={[s.payBtn, { backgroundColor: theme.colors.bgCard, padding: SPACING.base, margin: SPACING.base, borderRadius: RADIUS.full, alignItems: 'center' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <ActivityIndicator color={theme.colors.primary} />
              <Text style={{ fontFamily: FONTS.body.semibold, color: theme.colors.textPrimary }}>Processing payment...</Text>
            </View>
          </View>
        ) : (
          <TouchableOpacity style={s.payBtn} onPress={() => { if (step === 0) setStep(1); else handlePay(); }}>
            <LinearGradient colors={theme.gradients.gold as any} style={s.payInner}>
              <Ionicons name={step === 1 ? 'lock-closed' : 'arrow-forward'} size={16} color="#020B18" />
              <Text style={s.payText}>{step === 0 ? 'CONTINUE TO PAYMENT' : `PAY ${total.toLocaleString()} AED`}</Text>
            </LinearGradient>
          </TouchableOpacity>
        )
      )}
    </SafeAreaView>
  );
}
