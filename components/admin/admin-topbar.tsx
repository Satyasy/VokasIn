import { LogoutButton } from "@/components/logout-button";
import { NotificationDropdown } from "@/components/admin/notification-dropdown";

export function AdminTopbar({ title, context, nama }: { title: string; context?: string; nama: string }) {
  const inisial = nama.trim().charAt(0).toUpperCase() || "A";
  return (
    <div className="flex items-center justify-between border-b border-neutral-200/80 bg-white/80 backdrop-blur-md px-6 sm:px-8 py-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-neutral-900">{title}</h1>
        {context && <p className="text-xs text-neutral-500 mt-0.5">{context}</p>}
      </div>
      <div className="flex items-center gap-3.5">
        <NotificationDropdown />
        <div className="h-6 w-px bg-neutral-200" aria-hidden />
        <div className="flex items-center gap-2">
          <span
            className="flex size-8 items-center justify-center rounded-xl bg-slime-lime-500 text-xs font-black text-neutral-950 shadow-xs"
            aria-hidden
          >
            {inisial}
          </span>
          <span className="hidden text-xs font-bold text-neutral-800 sm:inline">{nama}</span>
        </div>
        <LogoutButton />
      </div>
    </div>
  );
}
