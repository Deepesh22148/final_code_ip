import * as FileSystem from 'expo-file-system';
import { useEffect, useState, useCallback, useMemo } from "react";
import { getUserId } from "@/lib/auth";
import apiClient from "@/lib/api-client";
import { API_GENERATE_ANIMATION } from "@/utils/constants";
import { View, Text, ActivityIndicator, FlatList, TouchableOpacity, Dimensions, RefreshControl, Alert } from "react-native";
import { Image } from 'expo-image';
import { Link, useRouter } from "expo-router";
import { AntDesign } from '@expo/vector-icons';

type AnimationResult = {
  message: string;
  outputDir: string;
  gifUrls?: string[];
};

const GIF_CACHE_DIR = `${FileSystem.cacheDirectory}gif_cache/`;

async function ensureDirExists() {
  const dirInfo = await FileSystem.getInfoAsync(GIF_CACHE_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(GIF_CACHE_DIR, { intermediates: true });
  }
}

export default function Animations() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [animationData, setAnimationData] = useState<AnimationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedGif, setSelectedGif] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [gifCache, setGifCache] = useState<Record<string, string>>({});
  const router = useRouter();
  const screenWidth = Dimensions.get("window").width;

  const clearGifCache = async () => {
    try {
      await FileSystem.deleteAsync(GIF_CACHE_DIR, { idempotent: true });
      await ensureDirExists();
      setGifCache({});
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  };

  const cacheGif = useCallback(async (url: string) => {
    try {
      await ensureDirExists();
      const filename = `${Date.now()}_${url.split('/').pop() || 'animation.gif'}`;
      const localUri = `${GIF_CACHE_DIR}${filename}`;
      
      const result = await FileSystem.createDownloadResumable(
        `${url}?t=${Date.now()}`,
        localUri
      ).downloadAsync();
      
      return result?.uri || url;
    } catch (error) {
      console.error('Caching failed, using network:', error);
      return url;
    }
  }, []);

  const fetchAnimation = useCallback(async (id: string) => {
    try {
      setRefreshing(true);
      setAnimationData(null);
      setError(null);
      
      // Clear cache before fetching new animations
      await clearGifCache();
      
      const timestamp = Date.now();
      const response = await apiClient.post<AnimationResult>(
        `${API_GENERATE_ANIMATION}?t=${timestamp}`, 
        { id }
      );
      
      setAnimationData(response.data);
      
      if (response.data.gifUrls?.length) {
        const cacheUpdates: Record<string, string> = {};
        await Promise.all(
          response.data.gifUrls.map(async (url) => {
            const cacheBustedUrl = `${url}?t=${timestamp}`;
            cacheUpdates[url] = await cacheGif(cacheBustedUrl);
          })
        );
        
        setGifCache(cacheUpdates);
        setSelectedGif(response.data.gifUrls[0]);
      }
    } catch (e) {
      console.error("Animation fetch error:", e);
      setError("Failed to load animations. Pull to refresh.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [cacheGif]);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const id = await getUserId();
        setUserId(id);
        await fetchAnimation(id);
      } catch (error) {
        console.error(error);
        setError("Failed to get user ID");
        setLoading(false);
      }
    };

    fetchDetails();
  }, [fetchAnimation]);

  const GifDisplay = useCallback(({ uri, size }: { uri: string; size: 'thumb' | 'full' }) => {
    const cachedUri = gifCache[uri] || `${uri}?t=${Date.now()}`;
    const dimensions = {
      thumb: { width: 100, height: 100 },
      full: { width: '100%', height: screenWidth * 0.9 }
    };

    return (
      <Image
        source={{ uri: cachedUri }}
        style={dimensions[size]}
        contentFit={size === 'thumb' ? 'cover' : 'contain'}
        transition={100}
        cachePolicy="none"
        key={cachedUri}
      />
    );
  }, [gifCache, screenWidth]);

  const renderGifThumbnail = useCallback(({ item }: { item: string }) => (
    <TouchableOpacity onPress={() => setSelectedGif(item)} activeOpacity={0.7}>
      <View className={`mx-2 p-1 rounded-lg overflow-hidden 
        ${selectedGif === item ? 'border-2 border-blue-500' : 'border border-gray-200'}`}>
        <GifDisplay uri={item} size="thumb" />
      </View>
    </TouchableOpacity>
  ), [selectedGif]);

  const MainGifViewer = useMemo(() => {
    if (!selectedGif) {
      return (
        <View className="items-center justify-center" style={{ height: screenWidth * 0.9 }}>
          <Text className="text-gray-500">Select an animation</Text>
        </View>
      );
    }
    return <GifDisplay uri={selectedGif} size="full" />;
  }, [selectedGif, screenWidth]);

  const ActionButtons = () => (
    <View className="flex-row justify-center gap-x-4 mt-6 mb-4">
      <TouchableOpacity
        className="px-6 py-3 bg-indigo-600 rounded-full flex-row items-center"
        onPress={() => router.push('/(tabs)/scanner')}
      >
        <AntDesign name="camera" size={18} color="white" />
        <Text className="text-white font-medium ml-2">New Animation</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="px-6 py-3 bg-green-500 rounded-full flex-row items-center"
        onPress={() => Alert.alert('Hello!', 'Thanks for using our app!')}
      >
        <AntDesign name="smileo" size={18} color="white" />
        <Text className="text-white font-medium ml-2">Say Hello</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && !animationData) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-4 text-lg text-gray-700">Loading your animations...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 p-6">
        <View className="items-center">
          <AntDesign name="exclamationcircle" size={32} color="#ef4444" />
          <Text className="text-red-600 text-lg mt-3 font-medium">{error}</Text>
          <TouchableOpacity 
            onPress={() => userId && fetchAnimation(userId)}
            className="mt-4 bg-blue-500 px-5 py-2 rounded-lg flex-row items-center"
          >
            <AntDesign name="reload1" size={16} color="white" />
            <Text className="text-white font-medium ml-2">Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="p-4">
        <Text className="text-2xl font-bold text-gray-900 mb-2">Your Animations</Text>
        
        {animationData?.gifUrls?.length ? (
          <>
            <View className="mb-6 bg-white rounded-xl shadow-sm overflow-hidden">
              {MainGifViewer}
            </View>

            <FlatList
              data={animationData.gifUrls}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderGifThumbnail}
              contentContainerStyle={{ paddingVertical: 8 }}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={() => userId && fetchAnimation(userId)}
                  tintColor="#3b82f6"
                />
              }
            />

            <ActionButtons />
          </>
        ) : (
          <View className="flex-1 justify-center items-center mt-10">
            <AntDesign name="picture" size={48} color="#9ca3af" />
            <Text className="text-xl text-gray-500 mt-4">No animations yet</Text>
            <Text className="text-gray-400 mt-2 text-center">
              Create your first animation using the camera
            </Text>
            <Link href={"/(tabs)/scanner"} asChild className="mt-6 w-full">
              <TouchableOpacity className="bg-blue-500 py-3 rounded-lg items-center w-full">
                <Text className="text-white font-medium">Create Animation</Text>
              </TouchableOpacity>
            </Link>
          </View>
        )}
      </View>
    </View>
  );
}