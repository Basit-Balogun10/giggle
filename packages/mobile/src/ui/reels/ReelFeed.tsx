import React from 'react';
import { FlatList, Dimensions, View, ListRenderItemInfo, ViewToken } from 'react-native';
import ReelView from './ReelView';

const { height } = Dimensions.get('window');

type Slide = { id: string; text?: string; bg?: string };
type Reel = { id: string; slides: Slide[] };

export default function ReelFeed({ data }: { data: Reel[] }) {
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const renderItem = ({ item, index }: ListRenderItemInfo<Reel>) => (
    <View style={{ height, width: '100%' }}>
      <ReelView slides={item.slides} autoplay={index === currentIndex} />
    </View>
  );

  // onViewableItemsChanged to detect which item is visible and enable autoplay only for that item
  const onViewRef = React.useRef((info: { viewableItems: ViewToken<Reel>[]; changed: ViewToken<Reel>[] }) => {
    const first = info.viewableItems[0];
    if (first && typeof first.index === 'number') setCurrentIndex(first.index);
  });
  const viewConfigRef = React.useRef({ viewAreaCoveragePercentThreshold: 50 });

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
      onViewableItemsChanged={onViewRef.current}
      viewabilityConfig={viewConfigRef.current}
    />
  );
}
