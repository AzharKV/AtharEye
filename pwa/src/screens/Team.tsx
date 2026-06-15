// Team & access — the org roster (Cairn) with app roles (Owner / Admin / Editor / Viewer). Invite,
// edit, remove. Account-level; distinct from each project's site-team labels. Writes data.team.
import { useState } from 'react';
import { T } from '../theme';
import type { Role, TeamMember } from '../types';
import { useStore } from '../lib/store';
import { Screen } from '../navigation/Navigator';
import { PushHeader, RoundBtn } from '../navigation/PushHeader';
import { Avatar, Card, mono } from '../components/primitives';
import { Sheet, TextField, SelectField } from '../components/Sheet';
import { Button, SaveButton } from '../components/primitives';
import { Icon } from '../components/Icon';

const ROLES = ['Owner', 'Admin', 'Editor', 'Viewer'] as const;
const ROLE_C: Record<Role, string> = { Owner: T.navy, Admin: T.blue, Editor: T.teal, Viewer: T.muted };
const initialsOf = (name: string) =>
  name.split(/[\s.]+/).filter(Boolean).map((s) => s[0]).slice(0, 2).join('').toUpperCase();

export function Team() {
  const { data } = useStore();
  const [edit, setEdit] = useState<{ id: string | null } | null>(null);

  return (
    <Screen padTop={0}>
      <PushHeader title="Team & access" trailing={<RoundBtn icon="plus" label="Invite" onClick={() => setEdit({ id: null })} />} />
      <div style={{ padding: '14px 16px 28px' }}>
        <div style={{ fontSize: 13, color: T.muted, margin: '0 2px 12px', lineHeight: 1.5 }}>
          {data.team.length} members in {data.company.name}.
        </div>
        <Card style={{ padding: '4px 14px' }}>
          {data.team.map((m, i) => (
            <button key={m.id} onClick={() => setEdit({ id: m.id })} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', border: 'none', borderBottom: i < data.team.length - 1 ? `1px solid ${T.hairline2}` : 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }}>
              <Avatar initials={m.initials} size={40} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14.5, fontWeight: 700, color: T.ink }}>{m.name}</div>
                <div style={{ ...mono, fontSize: 12, color: T.muted, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.email}</div>
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: ROLE_C[m.role], background: `${ROLE_C[m.role]}1A`, padding: '4px 10px', borderRadius: 999 }}>{m.role}</span>
              <Icon name="chevron" size={15} color={T.faint} />
            </button>
          ))}
        </Card>
      </div>
      {edit && <MemberSheet id={edit.id} onClose={() => setEdit(null)} />}
    </Screen>
  );
}

function MemberSheet({ id, onClose }: { id: string | null; onClose: () => void }) {
  const { data, patch } = useStore();
  const existing = data.team.find((m) => m.id === id);
  const [name, setName] = useState(existing?.name ?? '');
  const [email, setEmail] = useState(existing?.email ?? '');
  const [role, setRole] = useState<Role>(existing?.role ?? 'Editor');
  const [trade, setTrade] = useState(existing?.trade ?? '');

  const save = () => {
    const m: TeamMember = {
      id: existing?.id ?? `m-${Date.now().toString(36)}`,
      name: name.trim() || 'New member',
      initials: initialsOf(name.trim() || 'NM'),
      email: email.trim(),
      role,
      trade: trade.trim() || undefined,
    };
    patch({ team: existing ? data.team.map((x) => (x.id === existing.id ? m : x)) : [...data.team, m] });
    onClose();
  };
  const remove = () => {
    patch({ team: data.team.filter((x) => x.id !== existing!.id) });
    onClose();
  };

  return (
    <Sheet
      title={existing ? 'Edit member' : 'Invite member'}
      onClose={onClose}
      footer={
        <>
          {existing && existing.role !== 'Owner' && <Button danger onClick={remove} icon="trash">Remove</Button>}
          <SaveButton onSave={save}>{existing ? 'Save' : 'Send invite'}</SaveButton>
        </>
      }
    >
      <TextField label="Name" value={name} onChange={setName} placeholder="Full name" />
      <TextField label="Email" value={email} onChange={setEmail} placeholder="name@company.co.uk" />
      <TextField label="Trade / role label" value={trade} onChange={setTrade} placeholder="e.g. Site manager" />
      <SelectField label="Access role" value={role} options={ROLES} onChange={setRole} />
    </Sheet>
  );
}
