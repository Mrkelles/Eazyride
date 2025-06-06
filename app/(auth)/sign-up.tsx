import CustomButton from '@/components/CustomButton'
import InputField from '@/components/InputField'
import OAuth from '@/components/OAuth'
import { icons, images } from '@/constants'
import { fetchAPI } from '@/lib/fetch'
import { useSignUp } from '@clerk/clerk-expo'
import { Link, useRouter } from 'expo-router'
import React, { useState } from 'react'
import { Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import ReactNativeModal from "react-native-modal"


const SignUp = () => {
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const { isLoaded, signUp, setActive } = useSignUp()
    const router = useRouter()

    const [emailAddress, setEmailAddress] = useState('')
    const [password, setPassword] = useState('')
    const [pendingVerification, setPendingVerification] = useState(false)
    const [code, setCode] = useState('')

    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
    });

    const [verification, setVerification] = useState({
        state: "default",
        error: "",
        code: "",
    });

    const onSignUpPress = async () => {
        if (!isLoaded) return

        console.log(emailAddress, password)

        // Start sign-up process using email and password provided
        try {
            await signUp.create({
                emailAddress: form.email,
                password: form.password,
            })

            // Send user an email with verification code
            await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })

            // Set 'pendingVerification' to true to display second form
            // and capture OTP code
            setVerification({ ...verification, state: 'pending', });
        } catch (err) {
            // See https://clerk.com/docs/custom-flows/error-handling
            // for more info on error handling
            console.error(JSON.stringify(err, null, 2))
        }
    }

    // Handle submission of verification form
    const onVerifyPress = async () => {
        if (!isLoaded) return;

        try {
            // Use the code the user provided to attempt verification
            const completeSignUp = await signUp.attemptEmailAddressVerification({
                code: verification.code,
            });

            // If verification was completed, set the session to active
            // and redirect the user
            if (completeSignUp.status === 'complete') {
                //Create a DB User
                await fetchAPI('/(api)/user', {
                    method: "POST",
                    body: JSON.stringify({
                        name: form.name,
                        email: form.email,
                        clerkId: completeSignUp.createdUserId,
                    }),
                })

                await setActive({ session: completeSignUp.createdSessionId })
                setVerification({ ...verification, state: 'success' })
            } else {
                setVerification({
                    ...verification,
                    error: 'Verification Failed',
                    state: 'failed'
                });
                console.error(JSON.stringify(completeSignUp, null, 2))
            }
        } catch (err: any) {
            setVerification({
                ...verification,
                error: err.errors[0].longMessage,
                state: 'failed'
            })
            console.error(JSON.stringify(err, null, 2))
        }
    }

    if (pendingVerification) {
        return (
            <>
                <Text>Verify your email</Text>
                <TextInput
                    value={code}
                    placeholder="Enter your verification code"
                    onChangeText={(code) => setCode(code)}
                />
                <TouchableOpacity onPress={onVerifyPress}>
                    <Text>Verify</Text>
                </TouchableOpacity>
            </>
        )
    }

    return (
        <ScrollView className='flex-1 bg-white'>
            <View className='flex-1 bg-white'>
                <View className='relative w-full h-[350px]'>
                    <Image source={images.signUpCar} className='z-0 w-full' />
                    <Text className='text-4xl text-black font-JakartaBold absolute bottom-0 left-5'>Create Your Account</Text>
                </View>
                <View className='mt-10 p-5'>
                    <InputField
                        label="Name"
                        placeholder="Enter your name"
                        icon={icons.person}
                        value={form.name}
                        onChangeText={(value) => setForm({ ...form, name: value })}
                    />
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
                        title='Sign Up'
                        onPress={onSignUpPress}
                        className='mt-6'
                    />

                    {/* OAuth */}
                    <OAuth />

                    <Link href="/sign-in" className="text-lg text-center text-general-200 mt-6">
                        <Text>Already have an account?</Text>
                        <Text className="text-primary-500">Log In</Text>
                    </Link>
                </View>

                {/* VERIFICATION MODAL */}

            </View>

            <ReactNativeModal
                isVisible={verification.state === "pending"}
                // onBackdropPress={() =>
                //   setVerification({ ...verification, state: "default" })
                // }
                onModalHide={() => {
                    if (verification.state === "success") {
                        setShowSuccessModal(true);
                    }
                }}
            >
                <View className="bg-white px-7 py-9 rounded-2xl min-h-[300px]">
                    <Text className="font-JakartaExtraBold text-2xl mb-2">
                        Verification
                    </Text>
                    <Text className="font-Jakarta mb-5">
                        We&apos;ve sent a verification code to {form.email}.
                    </Text>
                    <InputField
                        label={"Code"}
                        icon={icons.lock}
                        placeholder={"12345"}
                        value={verification.code}
                        keyboardType="numeric"
                        onChangeText={(code) => setVerification({ ...verification, code })}
                    />
                    {verification.error && (
                        <Text className="text-red-500 text-sm mt-1">
                            {verification.error}
                        </Text>
                    )}
                    <CustomButton
                        title="Verify Email"
                        onPress={onVerifyPress}
                        className="mt-5 bg-success-500"
                    />
                </View>
            </ReactNativeModal>

            <ReactNativeModal isVisible={showSuccessModal}>
                <View className="bg-white px-7 py-9 rounded-2xl min-h-[300px]">
                    <Image
                        source={images.check}
                        className="w-[110px] h-[110px] mx-auto my-5"
                    />
                    <Text className="text-3xl font-JakartaBold text-center">
                        Verified
                    </Text>
                    <Text className="text-base text-gray-400 font-Jakarta text-center mt-2">
                        You have successfully verified your account.
                    </Text>
                    <CustomButton
                        title="Browse Home"
                        onPress={() => {
                            setShowSuccessModal(false);
                            router.push(`/(root)/(tabs)/home`);
                        }}
                        className="mt-5"
                    />
                </View>
            </ReactNativeModal>
        </ScrollView>
    );
};



export default SignUp