import React, { useContext, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ScrollView,
  Alert,
} from "react-native";
import axios from "axios";
import { useCart } from "../contexts/CartContext";
import RazorpayCheckout from "react-native-razorpay";

const API_BASE = "https://thiaworld.bbscart.com";
const RAZORPAY_KEY = "rzp_test_5kdXsZAny3KeQZ";

export default function CheckoutPage({ navigation, route }) {
  const cart = useCart();
  const buyNowItem = route?.params?.buyNowItem;
  const goldCart = Array.isArray(cart.goldCart) ? cart.goldCart : [];
  const silverCart = Array.isArray(cart.silverCart) ? cart.silverCart : [];
  const diamondCart = Array.isArray(cart.diamondCart) ? cart.diamondCart : [];
  const platinumCart = Array.isArray(cart.platinumCart) ? cart.platinumCart : [];
  const clearCart = cart.clearCart;



  const [selectedPayment, setSelectedPayment] = useState(null);
  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvv: "",
  });
  const [upiId, setUpiId] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [placing, setPlacing] = useState(false);

  const banks = ["SBI", "HDFC", "ICICI", "Axis Bank", "Kotak"];
  const getItemPrice = (item) => {
    return Number(
      item.price ??
      item.finalPrice ??
      item.totalPayable ??
      item.sellingPrice ??
      0
    );
  };

  // -----------------------------
  // CART MERGE (same as web logic)
  const cartItems = useMemo(() => {
    if (buyNowItem) {
      return [buyNowItem];
    }

    return [
      ...goldCart.map((i) => ({ ...i, category: 'gold' })),
      ...silverCart.map((i) => ({ ...i, category: 'silver' })),
      ...diamondCart.map((i) => ({ ...i, category: 'diamond' })),
      ...platinumCart.map((i) => ({ ...i, category: 'platinum' })),
    ];
  }, [buyNowItem, goldCart, silverCart, diamondCart, platinumCart]);


  const itemsTotal = useMemo(() => {
    return cartItems.reduce(
      (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1),
      0
    );
  }, [cartItems]);

  const careHandling = 250;
  const totalAmount = itemsTotal + careHandling;

  // -----------------------------
  // PLACE ORDER (API)
  // -----------------------------
  const handlePlaceOrder = async () => {
    if (!selectedPayment) {
      Alert.alert("Payment Required", "Please select a payment method");
      return;
    }

    if (selectedPayment === "cod") {
      placeOrderWithoutPayment();
      return;
    }

    try {
      setPlacing(true);

      const res = await axios.post(
        `${API_BASE}/api/payment/razorpay/create-order`,
        {
          amount: Math.round(Number(totalAmount) * 100),
          currency: "INR",
        }
      );
      console.log("CREATE ORDER RAW RESPONSE", res.data);

      const orderData = res.data.order ? res.data.order : res.data;

      const orderId = orderData.id;
      const amount = Number(orderData.amount);
      const currency = orderData.currency || "INR";

      console.log("RAZORPAY OPEN DATA", {
        orderId,
        amount,
        currency,
        key: RAZORPAY_KEY,
      });

      if (!orderId || !amount || !RAZORPAY_KEY) {
        Alert.alert("Payment Error", "Invalid payment data");
        return;
      }

      RazorpayCheckout.open({
        key: RAZORPAY_KEY,
        amount,
        currency,
        name: "Thiaworld Jewellery",
        description: "Order Payment",
        order_id: orderId,
        prefill: {
          name: "",
          email: "",
          contact: "",
        },
        theme: { color: "#F37254" },
      })
        .then(async (response) => {
          await axios.post(`${API_BASE}/checkout/update-payment-status`, {
            razorpay_order_id: orderId,
            razorpay_payment_id: response.razorpay_payment_id,
            status: "paid",
          });

          clearCart("gold");
          clearCart("silver");
          clearCart("diamond");
          clearCart("platinum");

          navigation.replace("Success");
        })
        .catch(() => {
          Alert.alert("Payment cancelled");
        });

    } catch (err) {
      console.log("PAYMENT INIT ERROR", err?.response?.data || err.message || err);
      Alert.alert("Error", "Unable to initiate payment");
    }
 finally {
      setPlacing(false);
    }
  };

  const placeOrderWithoutPayment = async () => {
    try {
      setPlacing(true);

      await axios.post(`${API_BASE}/api/checkout/submit`, {
        items: cartItems,
        amount: totalAmount,
        paymentMethod: "COD",
      });

      clearCart("gold");
      clearCart("silver");
      clearCart("diamond");
      clearCart("platinum");

      navigation.replace("Success");
    } catch {
      Alert.alert("Order Failed");
    } finally {
      setPlacing(false);
    }
  };

  // -----------------------------
  // UI (UNCHANGED)
  // -----------------------------
  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        {/* LOGIN */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. LOGIN</Text>
          <Text style={styles.text}>Thiaworld Customer</Text>
          <TouchableOpacity>
            <Text style={styles.changeBtn}>CHANGE</Text>
          </TouchableOpacity>
        </View>

        {/* DELIVERY ADDRESS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. DELIVERY ADDRESS</Text>
          <Text style={styles.text}>Saved delivery address</Text>
          <TouchableOpacity>
            <Text style={styles.changeBtn}>CHANGE</Text>
          </TouchableOpacity>
        </View>

        {/* ORDER SUMMARY */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. ORDER SUMMARY</Text>
          <FlatList
            data={cartItems}
            keyExtractor={(item, i) => `${item.category}-${i}`}
            renderItem={({ item }) => (
              <View style={styles.itemRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName}>
                    {item.name} (x{item.quantity || 1})
                  </Text>
                  <Text style={styles.deliveryText}>
                    Delivery in 5–7 Days
                  </Text>
                </View>
                <Text style={styles.price}>
                  ₹{Number(item.price || 0) * Number(item.quantity || 1)}


                </Text>
              </View>
            )}
          />
        </View>

        {/* PAYMENT OPTIONS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. PAYMENT OPTIONS</Text>

          <TouchableOpacity
            style={styles.optionRow}
            onPress={() => setSelectedPayment("upi")}
          >
            <View
              style={[
                styles.radioCircle,
                selectedPayment === "upi" && styles.radioSelected,
              ]}
            />
            <Text style={styles.optionText}>UPI Payment</Text>
          </TouchableOpacity>
          {selectedPayment === "upi" && (
            <TextInput
              style={styles.input}
              placeholder="Enter UPI ID"
              value={upiId}
              onChangeText={setUpiId}
            />
          )}

          <TouchableOpacity
            style={styles.optionRow}
            onPress={() => setSelectedPayment("card")}
          >
            <View
              style={[
                styles.radioCircle,
                selectedPayment === "card" && styles.radioSelected,
              ]}
            />
            <Text style={styles.optionText}>Credit / Debit Card</Text>
          </TouchableOpacity>

          {selectedPayment === "card" && (
            <>
              <TextInput
                style={styles.input}
                placeholder="Card Number"
                keyboardType="numeric"
                value={cardDetails.number}
                onChangeText={(t) =>
                  setCardDetails({ ...cardDetails, number: t })
                }
              />
              <TextInput
                style={styles.input}
                placeholder="MM/YY"
                value={cardDetails.expiry}
                onChangeText={(t) =>
                  setCardDetails({ ...cardDetails, expiry: t })
                }
              />
              <TextInput
                style={styles.input}
                placeholder="CVV"
                secureTextEntry
                keyboardType="numeric"
                value={cardDetails.cvv}
                onChangeText={(t) =>
                  setCardDetails({ ...cardDetails, cvv: t })
                }
              />
            </>
          )}

          <TouchableOpacity
            style={styles.optionRow}
            onPress={() => setSelectedPayment("netbanking")}
          >
            <View
              style={[
                styles.radioCircle,
                selectedPayment === "netbanking" && styles.radioSelected,
              ]}
            />
            <Text style={styles.optionText}>Net Banking</Text>
          </TouchableOpacity>

          {selectedPayment === "netbanking" &&
            banks.map((bank) => (
              <TouchableOpacity
                key={bank}
                style={[
                  styles.bankOption,
                  selectedBank === bank && styles.selectedBank,
                ]}
                onPress={() => setSelectedBank(bank)}
              >
                <Text
                  style={[
                    styles.bankText,
                    selectedBank === bank && { color: "#fff" },
                  ]}
                >
                  {bank}
                </Text>
              </TouchableOpacity>
            ))}

          <TouchableOpacity
            style={styles.optionRow}
            onPress={() => setSelectedPayment("cod")}
          >
            <View
              style={[
                styles.radioCircle,
                selectedPayment === "cod" && styles.radioSelected,
              ]}
            />
            <Text style={styles.optionText}>Cash on Delivery</Text>
          </TouchableOpacity>
        </View>

        {/* PRICE DETAILS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. PRICE DETAILS</Text>
          <View style={styles.itemRow}>
            <Text>Items Total</Text>
            <Text>₹{itemsTotal}</Text>
          </View>
          <View style={styles.itemRow}>
            <Text>Jewellery Care & Handling</Text>
            <Text>₹{careHandling}</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.itemRow}>
            <Text style={styles.totalText}>Total Amount</Text>
            <Text style={styles.totalText}>₹{totalAmount}</Text>
          </View>
        </View>
      </ScrollView>

      {/* PLACE ORDER */}
      <TouchableOpacity
        style={styles.placeBtn}
        onPress={handlePlaceOrder}
        disabled={placing}
      >
        <Text style={styles.placeBtnText}>
          {placing ? "PLACING ORDER..." : "PLACE ORDER"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f5f0", padding: 10 },
  section: {
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#8B0000",
  },
  text: { fontSize: 14, color: "#333", lineHeight: 20 },
  changeBtn: { color: "#8B0000", fontWeight: "bold", marginTop: 5 },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 6,
  },
  itemName: { fontSize: 14, fontWeight: "500", color: "#222" },
  deliveryText: { fontSize: 12, color: "green", marginTop: 2 },
  price: { fontSize: 14, fontWeight: "bold", color: "#000" },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  optionText: { fontSize: 14, color: "#111" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginVertical: 6,
    backgroundColor: "#fff",
  },
  bankOption: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    marginVertical: 4,
    borderRadius: 6,
  },
  bankText: { fontSize: 14, color: "#222" },
  selectedBank: { backgroundColor: "#8B0000", borderColor: "#8B0000" },
  separator: { height: 1, backgroundColor: "#ddd", marginVertical: 8 },
  totalText: { fontSize: 15, fontWeight: "bold", color: "#000" },
  placeBtn: {
    backgroundColor: "#DAA520",
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  placeBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#8B0000",
    marginRight: 10,
  },
  radioSelected: { backgroundColor: "#8B0000" },
});
