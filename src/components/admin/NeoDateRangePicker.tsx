import React, { useState } from 'react';
import { Calendar } from 'lucide-react';

interface NeoDateRangePickerProps {
  onApply: (start: Date, end: Date) => void;
  defaultStart?: Date;
  defaultEnd?: Date;
}

export const NeoDateRangePicker: React.FC<NeoDateRangePickerProps> = ({
  onApply,
  defaultStart,
  defaultEnd,
}) => {
  // Helpers to format date as YYYY-MM-DD for input value
  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  // Default to today and 7 days ago if not provided
  const [startDate, setStartDate] = useState(
    defaultStart ? formatDate(defaultStart) : formatDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
  );
  const [endDate, setEndDate] = useState(
    defaultEnd ? formatDate(defaultEnd) : formatDate(new Date())
  );

  const handleApply = () => {
    onApply(new Date(startDate), new Date(endDate));
  };

  return (
    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 font-mono">
      <div className="flex items-center gap-2 bg-white border-2 border-black p-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
        <Calendar size={16} className="ml-2" />
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="outline-none text-xs font-bold uppercase bg-transparent p-1 w-28"
        />
        <span className="font-black">-</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="outline-none text-xs font-bold uppercase bg-transparent p-1 w-28"
        />
      </div>

      <button
        onClick={handleApply}
        className="bg-[#FFD700] hover:bg-black hover:text-[#FFD700] text-black border-2 border-black px-4 py-1.5 text-xs font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
      >
        Terapkan
      </button>
    </div>
  );
};
