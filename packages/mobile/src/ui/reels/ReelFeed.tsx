import React from 'react';
import { FlatList, Dimensions, View, ListRenderItemInfo } from 'react-native';
import ReelView from './ReelView';

const { height } = Dimensions.get('window');

type Slide = { id: string; text?: string; bg?: string };
type Reel = { id: string; slides: Slide[] };

export default function ReelFeed({ data }: { data: Reel[] }) {
  const renderItem = ({ item }: ListRenderItemInfo<Reel>) => (
    <View style={{ height, width: '100%' }}>
      <ReelView slides={item.slides} />
    </View>
  );

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={(r) => r.id}
      pagingEnabled
      snapToAlignment="start"
      decelerationRate="fast"
      showsVerticalScrollIndicator={false}
      style={{ flex: 1 }}
    />
  );
}
