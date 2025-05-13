import { Stack, useRouter } from "expo-router";
import "./global.css";
import { useState, useEffect } from "react";
import { SplashScreen } from 'expo-router';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [login, setLogin] = useState<boolean | null>(null);
    const router = useRouter();

    useEffect(() => {
        // Simulate auth check
        const checkAuth = async () => {
            // Replace with your actual auth check
            const isLoggedIn = false; // Your auth logic here
            setLogin(isLoggedIn);
            await SplashScreen.hideAsync();
        };

        checkAuth();
    }, []);

    useEffect(() => {
        if (login === null) return;
        
        if (login) {
            router.replace("/(tabs)");
        } else {
            router.replace("/auth");
        }
    }, [login]);

    return (
        <Stack>
            <Stack.Screen name={"(tabs)"} options={{ headerShown: false }} />
            <Stack.Screen name={"auth"} options={{ headerShown: false }} />
            <Stack.Screen name={"animation"} options={{ headerShown: false }} />
        </Stack>
    );
}