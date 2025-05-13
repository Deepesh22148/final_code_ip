import {View, Text, Pressable, TextInput, Alert} from "react-native";
import {useState} from "react";
import apiClient from "@/lib/api-client";
import {AUTH_LOGIN_URL, AUTH_SIGNUP_URL} from "@/utils/constants";
import {useRouter} from "expo-router";
import {storeUserId} from "@/lib/auth";

export default function Auth(){

    const [toggle, setToggle] = useState<boolean>(true);
    const [userName, setUserName] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string>("");
    const router = useRouter();
    console.log("auth Page");
    async function onSubmit(){


        if(!userName || !password){
            return Alert.alert("Both Username and Password are required");
        }
        if(toggle){
            try {
                console.log("Sending Response...")
                const response = await apiClient.post(AUTH_LOGIN_URL,
                    {
                        "username": userName,
                        "password": password,
                    });



                console.log("response: ", response);
                if(response.status === 200){
                    console.log("Successfully logged in");
                    await storeUserId(response.data.id);
                    router.push(`/(tabs)`);
                }
                else{
                    console.log("Error logged in");
                }

            }
            catch(err){
                console.log(err);
            }

        }
        else {
            try {
                const response = await apiClient.post(AUTH_SIGNUP_URL,
                    {
                        "username": userName,
                        "password": password,
                    });
                console.log(response);
                if(response.status === 200){
                    console.log("Successfully logged in");
                    await storeUserId(response.data.id);
                    router.push(`/(tabs)`);
                }
            } catch (err) {
                console.log(err);
            }
        }
        }
    return(
        <View className={"h-[100%] flex items-center justify-center"}>
            <View className={"h-[90%] w-[100%] p-8 border-4 border-black  rounded-lg space-3"}>

                <View className={"flex flex-row items-center justify-center h-[10%]"}>
                    <Pressable
                        onPress={() => setToggle(false)}
                        className={`w-[50%] h-full p-1 items-center justify-center bg-gray-800 border-2 rounded-l-full border-black ${
                            !toggle ? " bg-gray-700" : ""
                        }`}
                    >
                        <Text className="text-white font-spacemono font-bold text-2xl">Sign Up</Text>
                    </Pressable>
                    <Pressable
                        onPress={() => setToggle(true)}
                        className={`w-[50%] h-full p-1 items-center justify-center bg-gray-800 border-black rounded-r-full ${
                            toggle ? "bg-gray-700 text-black" : ""
                        }`}
                    >
                        <Text className="text-white font-space font-bold text-2xl">Login</Text>
                    </Pressable>
                </View>

                <View className={"border-black border-4 h-[90%] mt-[3%] rounded-lg flex items-center justify-center gap-4"}>
                    <View
                    className={"flex justify-center ml-[20%] w-[100%]"}>
                        <Text className={"font-space font-bold text-2xl"}>Username</Text>
                        <TextInput
                            className={"w-[80%] border-2 border-black font-space rounded-full p-4"}
                                   value={userName}
                                   onChangeText={(text) => setUserName(text)}
                                   placeholder={"Username"}
                                    />
                    </View>

                    <View
                        className={"flex justify-center ml-[20%] w-[100%]"}>
                        <Text className={" font-space font-bold text-2xl"}>Password</Text>
                        <TextInput
                            className={"w-[80%] border-2 p-4 border-black font-space rounded-full"}
                            value={password}
                            secureTextEntry={true}
                            onChangeText={(text) => setPassword(text)}
                            placeholder={"Password"}
                        />
                    </View>

                    <Pressable
                        onPress={onSubmit}
                        className={`w-[80%] p-[4%] items-center justify-center bg-gray-800 border-2 rounded-full border-black  `}
                    >
                        <Text className="text-white font-spacemono font-bold text-2xl">
                            {
                                !toggle ? "Sign Up" : "Login"
                            }</Text>
                    </Pressable>
                </View>

            </View>
        </View>
    )
}
