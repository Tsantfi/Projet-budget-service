import React from "react";

export default function SearchSortBar({ search, onSearchChange, sortOptions, sortValue, onSortChange, placeholder }) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-4">
      <div className="relative flex-1">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        >
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" />
          <path d="M21 21l-4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder || "Rechercher..."}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:border-haigana-blue focus:ring-2 focus:ring-haigana-blue/20 outline-none transition-all bg-white"
        />
      </div>

      {sortOptions && sortOptions.length > 0 && (
        <select
          value={sortValue}
          onChange={(e) => onSortChange(e.target.value)}
          className="px-4 py-2.5 rounded-lg border border-gray-200 bg-white focus:border-haigana-blue outline-none transition-all"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              Trier par {opt.label}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
