"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Bell, CheckCheck, FileText, Wrench, ShieldCheck, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: "skkni" | "lab" | "system";
  href?: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "Unit SKKNI Menunggu Verifikasi",
    description: "Terdapat dokumen kurikulum baru yang diunggah dan membutuhkan tinjauan admin.",
    time: "10 menit lalu",
    read: false,
    type: "skkni",
    href: "/admin/skkni/kandidat",
  },
  {
    id: "notif-2",
    title: "Sinkronisasi Postgres DB Sukses",
    description: "Pembaruan cache in-memory dan pipeline analitik berjalan tanpa hambatan.",
    time: "1 jam lalu",
    read: false,
    type: "system",
  },
  {
    id: "notif-3",
    title: "Supervisi Alokasi Lab Sekolah",
    description: "Jadwal praktikum pekan ini telah terverifikasi oleh Kaprogli terkait.",
    time: "3 jam lalu",
    read: true,
    type: "lab",
  },
];

export function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const menuRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function markAllAsRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function markAsRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label="Buka Notifikasi Sistem"
        className="relative rounded-full p-2 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slime-lime-500"
      >
        <Bell className="size-5" aria-hidden />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex size-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-slime-lime-400 opacity-75" />
            <span className="relative inline-flex size-2.5 rounded-full bg-slime-lime-500 border border-white" />
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-neutral-200 bg-white p-4 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-neutral-900">Pemberitahuan Sistem</span>
              {unreadCount > 0 && (
                <Badge variant="brand" className="text-[10px] font-extrabold px-2 py-0.5">
                  {unreadCount} Baru
                </Badge>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-slime-lime-800 hover:underline"
              >
                <CheckCheck className="size-3.5" />
                Tandai dibaca
              </button>
            )}
          </div>

          <div className="mt-3 flex flex-col gap-2 max-h-80 overflow-y-auto">
            {notifications.map((notif) => {
              const Icon =
                notif.type === "skkni" ? FileText : notif.type === "lab" ? Wrench : ShieldCheck;

              return (
                <div
                  key={notif.id}
                  onClick={() => markAsRead(notif.id)}
                  className={`flex flex-col gap-1 rounded-xl p-3 text-xs transition-colors ${
                    notif.read
                      ? "bg-neutral-50/50 text-neutral-600"
                      : "bg-slime-lime-50/60 border border-slime-lime-200/60 text-neutral-900"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-white shadow-xs text-slime-lime-800">
                        <Icon className="size-3.5" />
                      </div>
                      <span className="font-bold">{notif.title}</span>
                    </div>
                    <span className="text-[10px] text-neutral-400 shrink-0">{notif.time}</span>
                  </div>

                  <p className="mt-1 text-[11px] leading-relaxed text-neutral-600 pl-8">
                    {notif.description}
                  </p>

                  {notif.href && (
                    <div className="pl-8 pt-1">
                      <Link
                        href={notif.href}
                        onClick={() => setOpen(false)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-slime-lime-800 hover:underline"
                      >
                        <span>Buka Tinjau Kandidat</span>
                        <ArrowRight className="size-3" />
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-3 border-t border-neutral-100 pt-2 text-center">
            <Link
              href="/admin/skkni/kandidat"
              onClick={() => setOpen(false)}
              className="text-[11px] font-bold text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              Lihat Seluruh Antrean Kandidat SKKNI &rarr;
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
