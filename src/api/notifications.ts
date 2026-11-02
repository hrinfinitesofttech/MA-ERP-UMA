import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from './client';
import { purchaseApi } from './purchase';
import { inventoryApi } from './inventory';
import { dashboardApi } from './dashboard';

export type NotificationKind = 'approval' | 'stock' | 'project' | 'task' | 'general';

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  message: string;
  /** Module route to open when the notification is tapped. */
  route?: string;
  time?: string;
  /** Read state reported by the server, when available. */
  serverRead?: boolean;
}

const READ_KEY = 'UMA_ERP_READ_NOTIFICATIONS';

const list = (data: any): any[] => (Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : []);
const has = (v: unknown, ...needles: string[]) => needles.some((n) => String(v ?? '').toLowerCase().includes(n));

/** Server-side notifications, if the backend exposes them. */
const fetchServerNotifications = async (): Promise<AppNotification[] | null> => {
  try {
    const res = await apiClient.get('/notifications/');
    const items = list(res.data);
    return items.map((n: any, i: number) => ({
      id: `srv-${n.id ?? i}`,
      kind: 'general' as NotificationKind,
      title: String(n.title ?? n.subject ?? 'Notification'),
      message: String(n.message ?? n.body ?? n.description ?? ''),
      time: n.created_at ?? n.createdAt ?? n.timestamp ?? n.time,
      serverRead: [n.is_read, n.isRead, n.read].find((v) => typeof v === 'boolean'),
    }));
  } catch {
    return null;
  }
};

/** Live alerts derived from ERP data the signed-in user can already see. */
const buildDerivedNotifications = async (userId?: string): Promise<AppNotification[]> => {
  const [orders, items, projects, employee] = await Promise.allSettled([
    purchaseApi.getPurchaseOrders(),
    inventoryApi.getItems(),
    apiClient.get('/projects/').then((r) => list(r.data)),
    dashboardApi.getEmployeeDashboard(userId),
  ]);

  const out: AppNotification[] = [];

  if (orders.status === 'fulfilled') {
    orders.value
      .filter((po) => has(po.status, 'pending', 'submitted'))
      .slice(0, 10)
      .forEach((po: any) =>
        out.push({
          id: `po-${po.id}`,
          kind: 'approval',
          title: `PO ${po.po_number || po.poNumber || po.id} awaiting approval`,
          message: `${po.supplier_name || po.supplierName || 'Supplier'} • ₹${Number(po.grand_total || po.grandTotal || 0).toLocaleString('en-IN')}`,
          route: 'purchase_management',
          time: po.order_date || po.created_at,
        })
      );
  }

  if (items.status === 'fulfilled') {
    items.value.forEach((it: any) => {
      const reorder = Number(it.reorder_level || it.reorderLevel || it.minimum_stock || 0);
      const current = Number(it.current_stock || it.currentStock || 0);
      if (reorder > 0 && current <= reorder) {
        out.push({
          id: `stock-${it.id}`,
          kind: 'stock',
          title: `Low stock: ${it.item_name || it.itemName || it.item_code || it.id}`,
          message: `Stock ${current} ${it.uom || ''} • reorder level ${reorder}`,
          route: 'store_warehouse',
        });
      }
    });
  }

  if (projects.status === 'fulfilled') {
    projects.value
      .filter((p: any) => has(p.health_status, 'delayed', 'critical') || has(p.priority, 'urgent'))
      .slice(0, 10)
      .forEach((p: any) =>
        out.push({
          id: `prj-${p.id}`,
          kind: 'project',
          title: `${p.job_number || p.project_number || p.id} needs attention`,
          message: `${p.customer_name || '—'} • due ${p.target_delivery_date || '—'}`,
          route: 'project_management',
        })
      );
  }

  if (employee.status === 'fulfilled') {
    (employee.value.tasksSummary?.recentTasks ?? [])
      .filter((t) => t.progressPercent < 100)
      .forEach((t) =>
        out.push({
          id: `task-${t.id}`,
          kind: 'task',
          title: t.title,
          message: `${t.isOverdue ? 'Overdue • ' : ''}Due ${t.dueDate || '—'} • ${t.progressPercent}% done`,
          route: 'dashboard',
        })
      );
  }

  return out;
};

export const notificationsApi = {
  async getAll(userId?: string): Promise<AppNotification[]> {
    const server = await fetchServerNotifications();
    const derived = await buildDerivedNotifications(userId);
    // Actionable live alerts first, then the latest server notifications.
    return [...derived, ...(server ?? []).slice(0, 100)];
  },

  async getReadIds(): Promise<string[]> {
    try {
      return JSON.parse((await AsyncStorage.getItem(READ_KEY)) || '[]');
    } catch {
      return [];
    }
  },

  async saveReadIds(ids: string[]): Promise<void> {
    try {
      await AsyncStorage.setItem(READ_KEY, JSON.stringify(ids.slice(-500)));
    } catch {
      // read state is a convenience only
    }
  },
};
