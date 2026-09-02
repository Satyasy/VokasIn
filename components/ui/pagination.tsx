"use client";

import { useState, useMemo, useEffect, useRef, type ReactNode } from "react";
import { Search, X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface PaginatedListProps<T> {
  items: T[];
  itemsPerPage?: number;
  searchPlaceholder?: string;
  searchFilter: (item: T, query: string) => boolean;
  renderItem: (item: T, index: number) => ReactNode;
  emptyState?: ReactNode;
  headerContent?: ReactNode;
  className?: string;
  id?: string;
}

export function PaginatedList<T>({
  items,
  itemsPerPage = 10,
  searchPlaceholder = "Cari data...",
  searchFilter,
  renderItem,
  emptyState,
  headerContent,
  className,
  id,
}: PaginatedListProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter data berdasarkan kata kunci pencarian
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase().trim();
    return items.filter((item) => searchFilter(item, q));
  }, [items, searchQuery, searchFilter]);

  // Reset ke halaman 1 saat query pencarian berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Hitung paginasi
  const totalItems = filteredItems.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const currentItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    // Smooth scroll ke atas kontainer kartu
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Generate array tombol nomor halaman yang ramah pengguna
  const pageNumbers = useMemo(() => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (safeCurrentPage > 3) pages.push("...");

      const start = Math.max(2, safeCurrentPage - 1);
      const end = Math.min(totalPages - 1, safeCurrentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);

      if (safeCurrentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  }, [totalPages, safeCurrentPage]);

  return (
    <div ref={containerRef} id={id} className={cn("space-y-4", className)}>
      {/* Search Bar & Header Filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-neutral-400" aria-hidden />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-10 w-full rounded-2xl border border-neutral-300 bg-white pl-10 pr-9 text-xs font-semibold text-neutral-900 placeholder:text-neutral-400 focus:border-slime-lime-600 focus:outline-none focus:ring-2 focus:ring-slime-lime-500/20"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
              title="Hapus pencarian"
            >
              <X className="size-4" aria-hidden />
            </button>
          )}
        </div>

        {/* Counter Info & Slot Konten Ekstra */}
        <div className="flex items-center justify-between sm:justify-end gap-3">
          {headerContent}
          <div className="text-xs font-bold text-neutral-600">
            {totalItems > 0 ? (
              <span>
                Menampilkan <strong className="text-neutral-900">{startIndex + 1}–{endIndex}</strong> dari{" "}
                <strong className="text-neutral-900">{totalItems}</strong> data
              </span>
            ) : (
              <span className="text-neutral-400">0 data ditemukan</span>
            )}
          </div>
        </div>
      </div>

      {/* Konten Kartu */}
      <div className="space-y-3">
        {currentItems.length > 0 ? (
          currentItems.map((item, idx) => renderItem(item, startIndex + idx))
        ) : (
          emptyState ?? (
            <div className="rounded-2xl border border-dashed border-neutral-200 bg-white p-8 text-center text-xs text-neutral-500">
              Tidak ada data yang cocok dengan pencarian &ldquo;{searchQuery}&rdquo;.
            </div>
          )
        )}
      </div>

      {/* Kontrol Navigasi Paginasi Bernomor (Hanya muncul jika totalPages > 1) */}
      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-100 pt-4">
          <Button
            size="sm"
            variant="secondary"
            disabled={safeCurrentPage <= 1}
            onClick={() => handlePageChange(safeCurrentPage - 1)}
            className="text-xs font-bold text-neutral-700"
          >
            <ChevronLeft className="size-3.5 mr-1" aria-hidden />
            Sebelumnya
          </Button>

          <div className="flex items-center gap-1">
            {pageNumbers.map((p, i) =>
              p === "..." ? (
                <span key={`ellipsis-${i}`} className="px-2 text-xs font-bold text-neutral-400">
                  ...
                </span>
              ) : (
                <button
                  key={`page-${p}`}
                  type="button"
                  onClick={() => handlePageChange(p as number)}
                  className={cn(
                    "flex size-8 items-center justify-center rounded-xl text-xs font-bold transition-colors",
                    safeCurrentPage === p
                      ? "bg-slime-lime-500 text-neutral-950 shadow-sm"
                      : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                  )}
                >
                  {p}
                </button>
              )
            )}
          </div>

          <Button
            size="sm"
            variant="secondary"
            disabled={safeCurrentPage >= totalPages}
            onClick={() => handlePageChange(safeCurrentPage + 1)}
            className="text-xs font-bold text-neutral-700"
          >
            Berikutnya
            <ChevronRight className="size-3.5 ml-1" aria-hidden />
          </Button>
        </div>
      )}
    </div>
  );
}
