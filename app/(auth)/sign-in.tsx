import CustomButton from '@/components/CustomButton'
import InputField from '@/components/InputField'
import OAuth from '@/components/OAuth'
import { icons, images } from '@/constants'
import { useSignIn } from '@clerk/clerk-expo'
import { Link, useRouter } from 'expo-router'
import React, { useState } from 'react'
import { Alert, Image, ScrollView, Text, View } from 'react-native'

const SignIn = () => {
    const { signIn, setActive, isLoaded } = useSignIn()
    const router = useRouter()
    const [form, setForm] = useState({
        email: '',
        password: '',
    });

    const onSignInPress = async () => {
        if (!isLoaded) return

        // Start the sign-in process using the email and password provided
        try {
            const signInAttempt = await signIn.create({
                identifier: form.email,
                password: form.password,
            })

            // If sign-in process is complete, set the created session as active
            // and redirect the user
            if (signInAttempt.status === 'complete') {
                await setActive({ session: signInAttempt.createdSessionId })
                router.replace("/(root)/(tabs)/home")
            } else {
                // If the status isn't complete, check why. User might need to
                // complete further steps.
                console.error(JSON.stringify(signInAttempt, null, 2))
                Alert.alert("Error", "Log in failed. Please try again.");
            }
        } catch (err: any) {
            // See https://clerk.com/docs/custom-flows/error-handling
            // for more info on error handling
            console.log(JSON.stringify(err, null, 2));
            Alert.alert("Error", err.errors[0].longMessage);
        }
    }

    return (
        <ScrollView className='flex-1 bg-white'>
            <View className='flex-1 bg-white'>
                <View className='relative w-full h-[350px]'>
                    <Image source={images.signUpCar} className='z-0 w-full' />
                    <Text className='text-4xl text-black font-JakartaBold absolute bottom-0 left-5'>Welcome 👋</Text>
                </View>
                <View className='mt-10 p-5'>
                    <InputField
                        label="Email"
                        placeholder="Enter your email"
                        icon={icons.email}
                        value={form.email}
                        onChangeText={(value) => setForm({ ...form, email: value })}
                    />
                    <InputField
                        label="Password"
                        placeholder="Enter your password"
                        icon={icons.lock}
                        secureTextEntry={true}
                        value={form.password}
                        onChangeText={(value) => setForm({ ...form, password: value })}
                    />

                    <CustomButton
                        title='Sign In'
                        onPress={onSignInPress}
                        className='mt-6'
                    />

                    {/* OAuth */}
                    <OAuth />

                    <Link href="/sign-up" className="text-lg text-center text-general-200 mt-6">
                        <Text>Already have an account?</Text>
                        <Text className="text-primary-500">Sign Up</Text>
                    </Link>
                </View>
            </View>
        </ScrollView>
    )
}

export default SignIn