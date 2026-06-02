// Reports tab — list of latest scan reports (RN port of pwa ReportsList).
// Filter chips + toggled inline search (live filter by name/location/type/client);
// each report card → /reports/[id]. Reads the live persisted list from the store.
import { useState } from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { T } from '@/theme';
import type { Project } from '@/types';
import { useAppStore } from '@/store/AppStore';
import { useReady } from '@/hooks/useReady';
import { useModalBack } from '@/hooks/useModalBack';
import { Screen } from '@/components/Screen';
import { RoundBtn } from '@/components/PushHeader';
import { Card, Chips, ScreenHeader, StatusBadge, BlueprintTile } from '@/components/primitives';
import { Icon } from '@/components/Icon';
import { SearchBar } from '@/components/SearchBar';
import { SkeletonList } from '@/components/Skeleton';

export default function ReportsList() {
  const router = useRouter();
  const ready = useReady('reports');
  const { projects } = useAppStore();
  const [filter, setFilter] = useState('All');
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const closeSearch = () => {
    setSearchOpen(false);
    setQuery('');
  };
  useModalBack(searchOpen, closeSearch);

  const list = projects.filter((p) =>
    filter === 'All'
      ? true
      : filter === 'Needs review'
        ? p.status === 'Needs Review'
        : filter === 'On track'
          ? p.status === 'On Track'
          : p.status === 'Complete',
  );
  const q = query.trim().toLowerCase();
  const searchList = q
    ? projects.filter((p) =>
        [p.name, p.location, p.type, p.client].some((s) => (s || '').toLowerCase().includes(q)),
      )
    : projects;

  const renderCards = (arr: Project[], empty: string) => (
    <View style={{ gap: 10, paddingHorizontal: 20, paddingTop: 4, paddingBottom: 8 }}>
      {arr.map((p) => (
        <Card
          key={p.id}
          pressable
          onPress={() => router.push('/reports/' + p.id)}
          style={{ padding: 14, flexDirection: 'row', gap: 13, alignItems: 'center' }}
        >
          <BlueprintTile type={p.type} w={48} h={48} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text numberOfLines={1} style={{ fontSize: 15.5, fontWeight: '700', letterSpacing: -0.3, color: T.text }}>
              {p.name}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3 }}>
              <Icon name="clock" size={13} color={T.muted} />
              <Text style={{ fontSize: 12.5, color: T.muted }}>
                Scanned {p.last} · {p.area} m²
              </Text>
            </View>
            <View style={{ marginTop: 8 }}>
              <StatusBadge status={p.status} small />
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 20, fontWeight: '800', color: T.accent, letterSpacing: -0.5 }}>
              {p.pct}
              <Text style={{ fontSize: 12, color: T.muted }}>%</Text>
            </Text>
            <View style={{ marginTop: 4 }}>
              <Icon name="chevron" size={16} color="rgba(255,255,255,0.22)" />
            </View>
          </View>
        </Card>
      ))}
      {arr.length === 0 ? (
        <Text style={{ textAlign: 'center', color: T.faint, fontSize: 14, paddingVertical: 40 }}>{empty}</Text>
      ) : null}
    </View>
  );

  return (
    <Screen>
      <ScreenHeader
        title="Reports"
        sub="Latest scan reports"
        trailing={<RoundBtn icon="search" label="Search" onPress={() => setSearchOpen(true)} />}
      />
      {searchOpen ? (
        <>
          <SearchBar value={query} onChange={setQuery} onCancel={closeSearch} placeholder="Search reports" />
          {renderCards(searchList, q ? `No reports match “${query.trim()}”` : 'Type to search reports.')}
        </>
      ) : (
        <>
          <Chips items={['All', 'Needs review', 'On track', 'Complete']} active={filter} onPick={setFilter} />
          {!ready ? <SkeletonList count={6} /> : renderCards(list, 'No reports in this filter.')}
        </>
      )}
    </Screen>
  );
}
