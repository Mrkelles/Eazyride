import CustomButton from '@/components/CustomButton'
import InputField from '@/components/InputField'
import OAuth from '@/components/OAuth'
import { icons, images } from '@/constants'
import { Link } from 'expo-router'
import React, { useState } from 'react'
import { Image, ScrollView, Text, View } from 'react-native'

const SignIn = () => {
    const [form, setForm] = useState({
        email: '',
        password: '',
    });

    const onSignInPress = async () => { }

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

                {/* VERIFICATION MODAL */}

            </View>
        </ScrollView>
    )
}

export default SignIn