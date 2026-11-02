import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { BellOff, CheckCheck, ShieldCheck, PackageMinus, FolderKanban, ListChecks, Info } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { themedStyles } from '../../theme/themedStyles';
import { borderRadius, shadows, spacing } from '../../theme/spacing';
import { useNotifications } from '../../context/NotificationsContext';
import { NotificationKind } from '../../api/notifications';

const KIND_STYLE: Record<NotificationKind, { icon: React.ComponentType<any>; tone: () => { fg: string; bg: string } }> = {
  approval: { icon: ShieldCheck, tone: () => ({ fg: colors.warning, bg: colors.warningLight }) },
  stock: { icon: PackageMinus, tone: () => ({ fg: colors.danger, bg: colors.dangerLight }) },
  project: { icon: FolderKanban, tone: () => ({ fg: colors.purple, bg: colors.purpleLight }) },
  task: { icon: ListChecks, tone: () => ({ fg: colors.accentDark, bg: colors.accentLight }) },
  general: { icon: Info, tone: () => ({ fg: colors.primaryLight, bg: colors.primarySubtle }) },
};

const timeAgo = (iso?: string): string => {
  if (!iso) return '';
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return '';
  const mins = Math.floor((Date.now() - t) / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return days < 7 ? `${days}d ago` : new Date(t).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

export const NotificationsScreen: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const { items, unreadCount, loading, refresh, markRead, markAllRead } = useNotifications();
  const [onlyUnread, setOnlyUnread] = useState(false);
  const visible = onlyUnread ? items.filter((n) => !n.read) : items;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} colors={[colors.accent]} />}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.topRow}>
        <View style={styles.segment}>
          {[
            { id: false, label: `All (${items.length})` },
            { id: true, label: `Unread (${unreadCount})` },
          ].map((s) => (
            <TouchableOpacity
              key={s.label}
              style={[styles.segmentBtn, onlyUnread === s.id && styles.segmentBtnActive]}
              onPress={() => setOnlyUnread(s.id)}
            >
              <Text style={[styles.segmentText, onlyUnread === s.id && styles.segmentTextActive]}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity style={styles.markAll} onPress={markAllRead} accessibilityLabel="Mark all as read">
            <CheckCheck size={18} color={colors.accent} />
          </TouchableOpacity>
        )}
      </View>

      {visible.length === 0 ? (
        <View style={styles.empty}>
          <BellOff size={40} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>{loading ? 'Checking for updates…' : "You're all caught up"}</Text>
          <Text style={styles.emptySub}>Approvals, low stock, urgent projects and your tasks show up here.</Text>
        </View>
      ) : (
        visible.map((n) => {
          const k = KIND_STYLE[n.kind];
          const tone = k.tone();
          const Icon = k.icon;
          return (
            <TouchableOpacity
              key={n.id}
              activeOpacity={0.85}
              style={[styles.card, !n.read && styles.cardUnread]}
              onPress={() => {
                markRead(n.id);
                if (n.route) onNavigate(n.route);
              }}
            >
              <View style={[styles.iconBox, { backgroundColor: tone.bg }]}>
                <Icon size={18} color={tone.fg} />
              </View>
              <View style={styles.body}>
                <Text style={[styles.title, !n.read && styles.titleUnread]} numberOfLines={2}>
                  {n.title}
                </Text>
                {n.message ? (
                  <Text style={styles.message} numberOfLines={2}>
                    {n.message}
                  </Text>
                ) : null}
                {n.time ? <Text style={styles.time}>{timeAgo(n.time)}</Text> : null}
              </View>
              {!n.read && <View style={styles.dot} />}
            </TouchableOpacity>
          );
        })
      )}
    </ScrollView>
  );
};

const styles = themedStyles(() =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.lg, paddingBottom: spacing.xxxl },
    topRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg },
    segment: { flex: 1, flexDirection: 'row', backgroundColor: colors.surfaceSubtle, borderRadius: borderRadius.md, padding: 4 },
    segmentBtn: { flex: 1, paddingVertical: 9, borderRadius: borderRadius.sm, alignItems: 'center' },
    segmentBtnActive: { backgroundColor: colors.surface, ...shadows.sm },
    segmentText: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
    segmentTextActive: { color: colors.textPrimary },
    markAll: {
      width: 44,
      height: 44,
      borderRadius: borderRadius.md,
      backgroundColor: colors.accentLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginBottom: spacing.sm,
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    cardUnread: { borderColor: colors.accent, ...shadows.sm },
    iconBox: { width: 40, height: 40, borderRadius: borderRadius.md, alignItems: 'center', justifyContent: 'center' },
    body: { flex: 1 },
    title: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
    titleUnread: { fontWeight: '800', color: colors.textPrimary },
    message: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
    time: { fontSize: 11, color: colors.textMuted, marginTop: 4, fontWeight: '600' },
    dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.accent },
    empty: { alignItems: 'center', paddingVertical: spacing.xxxl * 2, gap: spacing.sm },
    emptyTitle: { fontSize: 16, fontWeight: '800', color: colors.textPrimary },
    emptySub: { fontSize: 12, color: colors.textMuted, textAlign: 'center', paddingHorizontal: spacing.xl },
  })
);
