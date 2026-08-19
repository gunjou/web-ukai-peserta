"use client";

const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

export default function CalendarHeader() {
  return (
    <div className="grid grid-cols-7 border-b bg-muted">
      {days.map((day) => (
        <div
          key={day}
          className=" border-r px-1 py-2.5 text-center text-[10px] font-semibold text-muted-foreground last:border-r-0 sm:px-2 sm:text-xs"
        >
          <span className="hidden sm:inline">{day}</span>

          <span className="sm:hidden">{day.substring(0, 3)}</span>
        </div>
      ))}
    </div>
  );
}
