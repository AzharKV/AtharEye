// Projects list — portfolio summary + filter chips + searchable project cards.
// RN port of the PWA's ProjectsList. Reads the live persisted set via useAppStore().
import { useState } from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { T } from '@/theme';
import type { Project } from '@/types';
import { useReady } from '@/hooks/useReady';
import { useModalBack } from '@/hooks/useModalBack';
import { useAppStore } from '@/store/AppStore';
import { Icon } from '@/components/Icon';
import { Ring, StatusBadge, Chips, Card, ScreenHeader } from '@/components/primitives';
import { Screen } from '@/components/Screen';
import { RoundBtn } from '@/components/PushHeader';
import { SkeletonList } from '@/components/Skeleton';
import { SearchBar } from '@/components/SearchBar';

export default function ProjectsList() {
  const router = useRouter();
  const { projects } = useAppStore();
  const ready = useReady('projects');
  const [filter, setFilter] = useState('All');
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const closeSearch = () => {
    setSearchOpen(false);
    setQuery('');
  };
  useModalBack(searchOpen, closeSearch);

  const portfolio = projects.length
    ? Math.round(projects.reduce((s, p) => s + p.pct, 0) / projects.length)
    : 0;
  const counts = {
    on: projects.filter((p) => p.status === 'On Track').length,
    rev: projects.filter((p) => p.status === 'Needs Review').length,
    done: projects.filter((p) => p.status === 'Complete').length,
  };
  const list = projects.filter((p) =>
    filter === 'All'
      ? true
      : filter === 'On site'
        ? p.status !== 'Complete'
        : filter === 'Needs review'
          ? p.status === 'Needs Review'
          : p.status === 'Complete',
  );
  const q = query.trim().toLowerCase();
  const searchList = q
    ? projects.filter((p) =>
        [p.name, p.location, p.type, p.client].some((s) => (s || '').toLowerCase().includes(q)),
      )
    : projects;

  const renderCards = (arr: Project[], empty: string) => (
    <View style={{ gap: 10, paddingTop: 4, paddingHorizontal: 20, paddingBottom: 8 }}>
      {arr.map((p) => (
        <Card
          key={p.id}
          pressable
          onPress={() => router.push('/projects/' + p.id)}
          style={{ padding: 13, flexDirection: 'row', gap: 14, alignItems: 'center' }}
        >
          <Ring value={p.pct} size={54} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text numberOfLines={1} style={{ fontSize: 16, fontWeight: '700', letterSpacing: -0.3, color: T.text }}>
              {p.name}
            </Text>
            <Text style={{ fontSize: 12.5, color: T.muted, marginTop: 3 }}>
              {p.location} · {p.area} m² · {p.scans} scans
            </Text>
            <View style={{ marginTop: 8 }}>
              <StatusBadge status={p.status} small />
            </View>
          </View>
          <Icon name="chevron" size={18} color="rgba(255,255,255,0.22)" />
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
        title="Projects"
        sub={`${projects.length} projects · Scotland`}
        trailing={
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <RoundBtn icon="search" label="Search" onPress={() => setSearchOpen(true)} />
            <RoundBtn icon="plus" label="New project" onPress={() => router.push('/projects/new')} />
          </View>
        }
      />
      {searchOpen ? (
        <>
          <SearchBar value={query} onChange={setQuery} onCancel={closeSearch} placeholder="Search projects" />
          {renderCards(searchList, q ? `No projects match “${query.trim()}”` : 'Type to search projects.')}
        </>
      ) : (
        <>
          {/* summary strip — teal hero */}
          <View style={{ paddingTop: 2, paddingHorizontal: 20, paddingBottom: 8 }}>
            <Card style={{ padding: 16, flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              <Ring value={portfolio} size={66} stroke={6} accent label="AVG" />
              <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}>
                {(
                  [
                    ['On track', counts.on, T.accent],
                    ['Review', counts.rev, T.warning],
                    ['Complete', counts.done, T.muted],
                  ] as [string, number, string][]
                ).map(([l, n, c]) => (
                  <View key={l}>
                    <Text style={{ fontSize: 22, fontWeight: '800', color: c }}>{n}</Text>
                    <Text style={{ fontSize: 11.5, color: T.muted, fontWeight: '600' }}>{l}</Text>
                  </View>
                ))}
              </View>
            </Card>
          </View>
          <Chips items={['All', 'On site', 'Needs review', 'Complete']} active={filter} onPick={setFilter} />
          {!ready ? <SkeletonList count={5} /> : renderCards(list, 'No projects in this filter.')}
        </>
      )}
    </Screen>
  );
}
