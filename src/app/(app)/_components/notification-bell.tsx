import { createClient } from "@/lib/supabase/server";
import { getRecentNotifications, getUnreadNotificationsCount } from "@/lib/queries";
import { NotificationBellClient } from "./notification-bell-client";

export async function NotificationBell() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [count, items] = await Promise.all([
    getUnreadNotificationsCount(user.id),
    getRecentNotifications(user.id, 10),
  ]);

  return <NotificationBellClient count={count} items={items} />;
}
