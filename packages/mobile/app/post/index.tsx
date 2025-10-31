import React from 'react'
import {View} from 'react-native'
import PostForm from '../../components/ui/PostForm'
import {useRouter} from 'expo-router'

export default function PostScreen() {
  const router = useRouter()

  return (
    <View className="flex-1 bg-background">
      <PostForm onDone={() => router.back()} />
    </View>
  )
}
