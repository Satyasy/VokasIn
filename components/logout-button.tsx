import { LogOut } from "lucide-react";
import { logoutAction } from "@/app/login/actions";

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-100/80 px-3.5 py-1.5 text-xs font-bold text-neutral-700 shadow-sm transition-all duration-200 ease-out hover:scale-105 hover:border-red-300 hover:bg-red-50 hover:text-red-700 active:scale-95"
      >
        <LogOut className="size-3.5 shrink-0" aria-hidden />
        <span>Keluar</span>
      </button>
    </form>
  );
}
