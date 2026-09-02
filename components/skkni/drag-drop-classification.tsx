"use client";

import { useState } from "react";
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  UniqueIdentifier
} from "@dnd-kit/core";
import { 
  SortableContext, 
  arrayMove, 
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface KandidatItem {
  id: string;
  kode_unit: string;
  judul_unit: string;
  skor_ai?: number; // 0 to 1
  saran_program_keahlian_id?: string;
  elemen_kompetensi: any[]; // JSON of Elemen & KUK
}

interface ColumnProps {
  id: string;
  title: string;
  items: KandidatItem[];
  onItemClick: (item: KandidatItem) => void;
}

function SortableItem({ item, onClick }: { item: KandidatItem, onClick: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const scorePct = item.skor_ai ? Math.round(item.skor_ai * 100) : 0;
  const badgeColor = scorePct >= 75 ? "bg-slime-lime-500 text-slime-lime-950" : (scorePct > 0 ? "bg-amber-400 text-amber-950" : "bg-neutral-200 text-neutral-800");

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        // Biarkan onClick jalan kalau tidak sedang drag
        onClick();
      }}
      className="bg-white border border-neutral-200 shadow-sm rounded-xl p-4 mb-3 cursor-grab hover:border-slime-lime-500 transition-colors"
    >
      <div className="flex justify-between items-start gap-2 mb-2">
        <span className="text-xs font-semibold text-neutral-500">{item.kode_unit}</span>
        {item.skor_ai ? (
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${badgeColor}`}>
            {scorePct}% AI Match
          </span>
        ) : null}
      </div>
      <h4 className="text-sm font-semibold text-neutral-800 line-clamp-2">{item.judul_unit}</h4>
    </div>
  );
}

function Column({ id, title, items, onItemClick }: ColumnProps) {
  const { setNodeRef } = useSortable({ id, data: { isColumn: true } });

  return (
    <div className="flex flex-col bg-neutral-50/50 rounded-2xl border border-neutral-200 w-1/3 min-w-[300px] h-[75vh] overflow-hidden">
      <div className="p-4 border-b border-neutral-200 bg-white sticky top-0 z-10 flex justify-between items-center">
        <h3 className="font-semibold text-neutral-800">{title}</h3>
        <span className="bg-neutral-100 text-neutral-600 text-xs px-2 py-1 rounded-full font-medium">
          {items.length} Unit
        </span>
      </div>
      <div 
        ref={setNodeRef}
        className="p-4 overflow-y-auto flex-1 min-h-[150px]"
      >
        <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
          {items.map((item) => (
            <SortableItem key={item.id} item={item} onClick={() => onItemClick(item)} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

export function DragDropClassification({ 
  initialItems, 
  onSave 
}: { 
  initialItems: KandidatItem[],
  onSave: (mapped: Record<string, string>) => void 
}) {
  // Items dikelompokkan ke 3 kolom: unassigned, rpl, tkj
  const [items, setItems] = useState<KandidatItem[]>(initialItems);
  
  // Mapping dari id item -> kolom (kolom: "unassigned", "pk-rpl", "pk-tkj")
  const [itemColumns, setItemColumns] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    initialItems.forEach(i => {
      if (i.saran_program_keahlian_id === "pk-rpl" || i.saran_program_keahlian_id === "pk-tkj") {
        map[i.id] = i.saran_program_keahlian_id;
      } else {
        map[i.id] = "unassigned";
      }
    });
    return map;
  });

  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [selectedItem, setSelectedItem] = useState<KandidatItem | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const columns = [
    { id: "unassigned", title: "Belum Ditetapkan" },
    { id: "pk-rpl", title: "Jurusan RPL" },
    { id: "pk-tkj", title: "Jurusan TKJ" }
  ];

  const handleDragStart = (e: DragStartEvent) => {
    setActiveId(e.active.id);
  };

  const handleDragOver = (e: DragOverEvent) => {
    const { active, over } = e;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeColumn = itemColumns[activeId];
    const overColumn = columns.find(c => c.id === overId) ? overId : itemColumns[overId];

    if (!activeColumn || !overColumn || activeColumn === overColumn) {
      return;
    }

    setItemColumns((prev) => ({
      ...prev,
      [activeId]: overColumn,
    }));
  };

  const handleDragEnd = (e: DragEndEvent) => {
    setActiveId(null);
  };

  const activeItem = activeId ? items.find(i => i.id === activeId) : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold text-neutral-800">Validasi Klasifikasi AI</h2>
        <button 
          onClick={() => onSave(itemColumns)}
          className="bg-slime-lime-500 hover:bg-slime-lime-600 text-slime-lime-950 font-bold px-6 py-2 rounded-full transition-colors"
        >
          Simpan Validasi
        </button>
      </div>

      <div className="flex gap-4">
        {/* Board Area */}
        <div className={`flex gap-4 transition-all duration-300 ${selectedItem ? 'w-2/3' : 'w-full'}`}>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            {columns.map(col => (
              <Column 
                key={col.id}
                id={col.id}
                title={col.title}
                items={items.filter(i => itemColumns[i.id] === col.id)}
                onItemClick={setSelectedItem}
              />
            ))}

            <DragOverlay>
              {activeItem ? (
                <div className="bg-white border-2 border-slime-lime-500 shadow-xl rounded-xl p-4 opacity-90 scale-105">
                  <div className="text-xs font-semibold text-neutral-500 mb-2">{activeItem.kode_unit}</div>
                  <h4 className="text-sm font-semibold text-neutral-800">{activeItem.judul_unit}</h4>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>

        {/* Side Drawer untuk KUK Detail */}
        {selectedItem && (
          <div className="w-1/3 bg-white border border-neutral-200 rounded-2xl flex flex-col overflow-hidden h-[75vh]">
            <div className="p-4 border-b border-neutral-200 flex justify-between items-start bg-neutral-50/50">
              <div>
                <span className="text-xs font-mono text-neutral-500">{selectedItem.kode_unit}</span>
                <h3 className="font-bold text-neutral-800 text-lg leading-tight mt-1">{selectedItem.judul_unit}</h3>
              </div>
              <button 
                onClick={() => setSelectedItem(null)}
                className="text-neutral-400 hover:text-neutral-700 bg-neutral-100 hover:bg-neutral-200 p-1.5 rounded-full"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto flex-1 bg-white">
              <h4 className="font-semibold text-neutral-800 mb-4 border-b pb-2">Elemen & Kriteria Unjuk Kerja</h4>
              {selectedItem.elemen_kompetensi && selectedItem.elemen_kompetensi.map((ek: any, i: number) => (
                <div key={i} className="mb-6">
                  <h5 className="font-semibold text-sm text-slime-lime-900 bg-slime-lime-100/50 p-2 rounded-lg mb-2">
                    {i + 1}. {ek.judul}
                  </h5>
                  <ul className="space-y-2">
                    {ek.kriteriaUnjukKerja.map((kuk: any, j: number) => (
                      <li key={j} className="text-sm text-neutral-600 flex gap-3 pl-2">
                        <span className="font-mono text-xs text-neutral-400 pt-0.5">{kuk.kode}</span>
                        <span className="leading-snug">{kuk.teks}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
