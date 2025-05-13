import { Text, View, ActivityIndicator, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import { getUserId } from '@/lib/auth';
import { AntDesign } from '@expo/vector-icons';

export default function Index() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const id = await getUserId();
      setUserId(id);
    } catch (error) {
      console.error(error);
      setError("Failed to load user data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-4 text-lg text-gray-600">Loading your profile...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 p-6">
        <View className="items-center">
          <AntDesign name="exclamationcircle" size={48} color="#ef4444" />
          <Text className="text-red-600 text-lg mt-3 font-medium">{error}</Text>
          <TouchableOpacity 
            className="mt-4 bg-blue-500 px-5 py-2 rounded-lg flex-row items-center"
            onPress={fetchDetails}
          >
            <AntDesign name="reload1" size={16} color="white" />
            <Text className="text-white font-medium ml-2">Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 p-6 justify-center">
      <View className="bg-white rounded-xl shadow-sm p-6 items-center">
        {/* Avatar Circle */}
        <View className="w-16 h-16 rounded-full bg-blue-100 justify-center items-center mb-4">
          <AntDesign name="user" size={24} color="#3b82f6" />
        </View>
        
        {/* Title */}
        <Text className="text-xl font-bold text-gray-900 mb-1">Your Account</Text>
        
        {/* User ID */}
        <Text className="text-gray-600 mb-6">
          {userId ? `ID: ${userId}` : "No user logged in"}
        </Text>
        
        
      </View>
    </View>
  );
}