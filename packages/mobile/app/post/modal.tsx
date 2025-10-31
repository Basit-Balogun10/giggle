import React from 'react'
import {View, TouchableOpacity, Text} from 'react-native'
import PostForm from '../../components/ui/PostForm'
import {useRouter} from 'expo-router'

export default function PostModal() {
  const router = useRouter()

  return (
    <View style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center'}}>
      <View style={{margin: 20, borderRadius: 12, overflow: 'hidden', backgroundColor: 'white'}}>
        <View style={{flexDirection: 'row', justifyContent: 'flex-end', padding: 8}}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{padding: 6}}>Close</Text>
          </TouchableOpacity>
        </View>
        <PostForm onDone={() => router.back()} />
      </View>
    </View>
  )
}
