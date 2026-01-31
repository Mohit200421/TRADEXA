import { View, Text } from "react-native";

export default function Dashboard() {
  return (
    <View style={{ flex: 1, backgroundColor: "#0b1220", justifyContent: "center", alignItems: "center" }}>
      <Text style={{ color: "white", fontSize: 20 }}>📊 TradeFX Dashboard</Text>
    </View>
  );
}
