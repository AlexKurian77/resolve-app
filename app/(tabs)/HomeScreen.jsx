import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth, db } from "../../firebaseConfig";
import { ToastAndroid } from "react-native";

export default function HomeScreen() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const badgeMilestones = [
    { days: 1, name: "1-Day Badge" },
    { days: 7, name: "7-Day Badge" },
    { days: 30, name: "30-Day Badge" },
    { days: 100, name: "100-Day Badge" },
  ];
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setUserData(userSnap.data());
          }
        }
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
    handleCheckIn();
  }, []);
  const handleCheckIn = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        const lastCheckIn = data.lastCheckIn ? data.lastCheckIn.toDate() : null;
        const today = new Date();
        today.setHours(0, 0, 0, 0); // ignore time part

        let newStreak = 1; // default

        if (lastCheckIn) {
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);

          if (lastCheckIn.toDateString() === today.toDateString()) {
            ToastAndroid.show("Already checked in today!", ToastAndroid.SHORT);
            return;
          } else if (lastCheckIn.toDateString() === yesterday.toDateString()) {
            newStreak = data.currentStreak + 1;
          }
        }

        const bestStreak = Math.max(newStreak, data.bestStreak || 0);

        // Check for badges
        let newBadges = [...(data.badges || [])];
        badgeMilestones.forEach((milestone) => {
          if (
            newStreak === milestone.days &&
            !newBadges.includes(milestone.name)
          ) {
            newBadges.push(milestone.name);
            ToastAndroid.show(
              `Congrats! You earned the "${milestone.name}" badge 🏆`,
              ToastAndroid.LONG
            );
          }
        });

        // Update Firestore with streaks + badges
        await updateDoc(userRef, {
          currentStreak: newStreak,
          bestStreak: bestStreak,
          lastCheckIn: serverTimestamp(),
          lastSuccessDate: today.toLocaleDateString(),
          badges: newBadges,
        });

        // Update local state
        setUserData({
          ...data,
          currentStreak: newStreak,
          bestStreak: bestStreak,
          lastCheckIn: today,
          lastSuccessDate: today.toLocaleDateString(),
          badges: newBadges,
        });

        ToastAndroid.show("Checked in! Keep it up!!", ToastAndroid.SHORT);
      }
    } catch (e) {
      console.log(e);
      ToastAndroid.show("Something went wrong", ToastAndroid.SHORT);
    }
  };

  const displayName = userData?.displayName || "";
  const currentStreak = userData?.currentStreak ?? 0;
  const bestStreak = userData?.bestStreak ?? 0;
  const badges = userData?.badges || [];
  const lastSuccessDate = userData?.lastSuccessDate || "-";

  return (
    <SafeAreaView className="flex-1 bg-[#f6faef]">
      <StatusBar style="dark" />
      <View className="flex-1 bg-[#f6faef] px-3 pt-6">
        {/* Header */}
        <View className="flex-row items-center mb-4">
          <View className="bg-[#e3f6e8] p-2 rounded-full mr-3">
            <MaterialCommunityIcons
              name="tree-outline"
              size={24}
              color="#4bb38a"
            />
          </View>
          <View>
            <Text className="text-lg font-semibold text-[#222]">
              Welcome back{displayName ? `, ${displayName}` : ""}
            </Text>
            <Text className="text-xs text-[#7a8b99]">
              Your healing journey continues
            </Text>
          </View>
          <View className="ml-auto">
            <FontAwesome name="gear" size={22} color="#7a8b99" />
          </View>
        </View>
        <ScrollView>
          {/* Clean Streak Card */}
          <LinearGradient
            colors={["#e3f6e8", "#f6faef"]}
            className="rounded-2xl p-5 mb-4 shadow-sm"
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text className="text-[#4bb38a] font-semibold mb-2">
              Clean Streak
            </Text>
            <Text className="text-5xl font-bold text-[#2e7d5b] text-center">
              {currentStreak}
            </Text>
            <Text className="text-center text-[#7a8b99] mt-1">days strong</Text>
            <View className="flex-row justify-center mt-2 mb-1">
              {[...Array(7)].map((_, i) => (
                <View
                  key={i}
                  className="w-3 h-3 rounded-full mx-0.5"
                  style={{
                    backgroundColor: i < currentStreak ? "#4bb38a" : "#e3f6e8",
                    opacity: 1,
                  }}
                />
              ))}
            </View>
            <Text className="text-xs text-center text-[#7a8b99]">
              Best streak: {bestStreak} | Last: {lastSuccessDate}
            </Text>
          </LinearGradient>

          {/* Life Tree Card */}
          <LinearGradient
            colors={["#f6f6fa", "#f6faef"]}
            className="rounded-2xl p-5 mb-4 shadow-sm"
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View className="flex-row items-center mb-2">
              <MaterialCommunityIcons name="tree" size={18} color="#b7aaff" />
              <Text className="ml-2 text-[#b7aaff] font-semibold">
                Life Tree
              </Text>
            </View>
            <View className="items-center mb-2">
              <MaterialCommunityIcons name="sprout" size={32} color="#4bb38a" />
            </View>
            {/* Progress Bar: use bestStreak as a proxy for growth */}
            <View className="w-full h-2 bg-[#e3e3f6] rounded-full mb-2">
              <View
                className="h-2 bg-[#4bb38a] rounded-full"
                style={{ width: `${Math.min(bestStreak, 100)}%` }}
              />
            </View>
            <Text className="text-center text-[#4bb38a] font-semibold">
              {Math.min(bestStreak, 100)}% grown
            </Text>
            <Text className="text-xs text-center text-[#7a8b99]">
              Your progress nurtures growth
            </Text>
          </LinearGradient>

          {/* Quick Access Cards */}
          <View className="flex-row flex-wrap justify-between mb-4">
            <View className="w-[48%] bg-[#f6faef] rounded-2xl p-4 mb-3 items-center shadow-sm border border-[#e3f6e8]">
              <MaterialCommunityIcons
                name="trending-up"
                size={28}
                color="#4bb38a"
              />
              <Text className="mt-2 text-[#222] font-medium">Progress</Text>
            </View>
            <View className="w-[48%] bg-[#f6faef] rounded-2xl p-4 mb-3 items-center shadow-sm border border-[#e3e3f6]">
              <MaterialCommunityIcons
                name="medal-outline"
                size={28}
                color="#b7aaff"
              />
              <Text className="mt-2 text-[#222] font-medium">Achievements</Text>
            </View>
            <View className="w-[48%] bg-[#f6faef] rounded-2xl p-4 mb-3 items-center shadow-sm border border-[#fbeee7]">
              <MaterialCommunityIcons name="brain" size={28} color="#e7b7aa" />
              <Text className="mt-2 text-[#222] font-medium">Exercises</Text>
            </View>
            <View className="w-[48%] bg-[#f6faef] rounded-2xl p-4 mb-3 items-center shadow-sm border border-[#e3f6f6]">
              <MaterialCommunityIcons
                name="account-group-outline"
                size={28}
                color="#7ad1d1"
              />
              <Text className="mt-2 text-[#222] font-medium">Community</Text>
            </View>
          </View>

          {/* Today's Focus Section */}
          <View className="bg-[#f6faef] rounded-2xl p-4 mb-4 shadow-sm border border-[#e3f6e8]">
            <View className="flex-row items-center mb-2">
              <MaterialCommunityIcons name="target" size={18} color="#4bb38a" />
              <Text className="ml-2 text-[#222] font-semibold">
                Today's Focus
              </Text>
            </View>

            {/* Focus Card 1 */}
            <View className="bg-[#f8fbf4] rounded-xl p-3 mb-3 flex-row items-center justify-between">
              <View className="flex-row items-center">
                <MaterialCommunityIcons
                  name="heart-circle-outline"
                  size={24}
                  color="#4bb38a"
                />
                <View className="ml-2">
                  <Text className="font-medium text-[#222]">
                    Practice Self-Compassion
                  </Text>
                  <Text className="text-xs text-[#7a8b99]">
                    Remember: healing isn't linear
                  </Text>
                </View>
              </View>
              <TouchableOpacity className="bg-white px-4 py-1.5 rounded-full shadow-sm">
                <Text className="text-[#4bb38a] font-semibold">Start</Text>
              </TouchableOpacity>
            </View>

            {/* Focus Card 2 */}
            <View className="bg-[#f8fbf4] rounded-xl p-3 flex-row items-center justify-between">
              <View className="flex-row items-center">
                <MaterialCommunityIcons
                  name="meditation"
                  size={24}
                  color="#b7aaff"
                />
                <View className="ml-2">
                  <Text className="font-medium text-[#222]">
                    Mindfulness Check-in
                  </Text>
                  <Text className="text-xs text-[#7a8b99]">
                    5-minute breathing
                  </Text>
                </View>
              </View>
              <TouchableOpacity className="bg-white px-4 py-1.5 rounded-full shadow-sm">
                <Text className="text-[#b7aaff] font-semibold">Begin</Text>
              </TouchableOpacity>
            </View>
            {/* Recent Wins Section */}
          </View>
          <View className="bg-[#f6faef] rounded-2xl p-4 mb-6 shadow-sm border border-[#e3f6e8]">
            <View className="flex-row items-center mb-2">
              <MaterialCommunityIcons
                name="star-four-points-outline"
                size={18}
                color="#b7aaff"
              />
              <Text className="ml-2 text-[#222] font-semibold">
                Recent Wins
              </Text>
            </View>

            {/* Dynamic Badges as Wins */}
            {badges.length > 0 ? (
              badges.map((badge, idx) => (
                <View
                  key={idx}
                  className={`rounded-xl p-3 mb-3 flex-row items-center ${idx % 2 === 0 ? "bg-[#e3f6e8]" : "bg-[#e3e3f6]"}`}
                >
                  <MaterialCommunityIcons
                    name={
                      idx % 2 === 0
                        ? "star-outline"
                        : "account-multiple-outline"
                    }
                    size={22}
                    color={idx % 2 === 0 ? "#4bb38a" : "#b7aaff"}
                  />
                  <View className="ml-2">
                    <Text className="font-medium text-[#222]">
                      {badge} Badge
                    </Text>
                    <Text className="text-xs text-[#7a8b99]">
                      Earned for {badge}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <Text className="text-xs text-[#7a8b99]">
                No recent wins yet.
              </Text>
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
