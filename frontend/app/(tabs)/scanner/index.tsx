import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState, useRef, useEffect } from 'react';
import { Button, Pressable, Text, TouchableOpacity, View, Image } from 'react-native';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import {Redirect, useLocalSearchParams, useRouter} from "expo-router";
import apiClient from "@/lib/api-client";
import {API_FILE_UPLOAD} from "@/utils/constants";
import {getUserId} from "@/lib/auth";

export default function App() {
    const [facing, setFacing] = useState<CameraType>('back');
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef<CameraView>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    // Pre-warm the camera for faster startup
    useEffect(() => {
        if (cameraRef.current) {
            cameraRef.current.resumePreview();
        }
        const fetchDetails = async () => {
            try {
                const id = await getUserId();
                setUserId(id);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, []);

    if (!permission) {
        return <View />;
    }

    if (!permission.granted) {
        return (
            <View className="flex-1 justify-center items-center">
                <Text className="text-lg mb-4">We need your permission to show the camera</Text>
                <Button onPress={requestPermission} title="grant permission" />
            </View>
        );
    }

    function toggleCameraFacing() {
        setFacing(current => (current === 'back' ? 'front' : 'back'));
    }

    async function captureRectangle() {
        if (cameraRef.current && !isProcessing) {
            setIsProcessing(true);
            try {
                const photo = await cameraRef.current.takePictureAsync({
                    quality: 0.5,
                    skipProcessing: true,
                });

                const originX = Math.max(0, photo.width * 0.05);
                const originY = Math.max(0, photo.height * 0.1);
                const width = Math.min(photo.width * 0.9, photo.width - originX);
                const height = Math.min(photo.height * 0.8, photo.height - originY);

                console.log("Crop dimensions:", { originX, originY, width, height });

                const cropped = await manipulateAsync(
                    photo.uri,
                    [{
                        crop: { originX, originY, width, height }
                    }],
                    { compress: 0.8, format: SaveFormat.JPEG }
                );

                setCapturedImage(cropped.uri);

                const formData = new FormData();
                formData.append('photo', {  
                    uri: cropped.uri,
                    name: `${userId}-photo.jpg`,
                    type: 'image/jpeg'
                });

                const response = await apiClient.post(API_FILE_UPLOAD, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
                });

                console.log("Upload success:", response.data);
                router.push("/animation")
        } catch (error) {
            console.error("Upload failed:", error);
            alert("Failed: " + error.message);
        } finally {
            setIsProcessing(false);
        }
    }
        }
    


    return (
        <View className="h-[100%] w-[100%]">
            {capturedImage ? (
                <View className="flex-1">
                    <Image
                        source={{ uri: capturedImage }}
                        className="flex-1"
                        resizeMode="contain"
                        fadeDuration={0} // Disable fade animation for faster display
                    />
                    <Button title="Back to Camera" onPress={() => setCapturedImage(null)} />
                </View>
            ) : (
                <CameraView
                    ref={cameraRef}
                    className="h-full w-[100%]"
                    facing={facing}
                    mute={true}
                    animateShutter={false}

                    pictureSize="medium" // Use smaller image size
                >
                    <View className="h-full border-4 border-black flex justify-center items-center">
                        <View className="h-[80%] w-[90%] border-4 border-black">
                            <TouchableOpacity
                                className="h-full"
                                onPress={toggleCameraFacing}
                            >
                                <Text>Flip Camera</Text>
                            </TouchableOpacity>
                        </View>
                        <Pressable
                            onPress={captureRectangle}
                            className="absolute bottom-2 bg-white p-4 rounded-full"
                            disabled={isProcessing}
                        >
                            <Text>{isProcessing ? 'Processing...' : 'Capture Rectangle'}</Text>
                        </Pressable>
                    </View>
                </CameraView>
            )}
        </View>
    );
}
