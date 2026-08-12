import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface DropdownProps {
  options: Option[];
  value: string;
  onChange: (val: string) => void;
  className?: string;
  align?: 'left' | 'right' | 'center';
}

export default function Dropdown({ options, value, onChange, className = '', align = 'center' }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(o => o.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getAlignmentClass = () => {
    if (align === 'left') return 'left-0';
    if (align === 'right') return 'right-0';
    return 'left-1/2 -translate-x-1/2';
  };

  return (
    <div ref={dropdownRef} className={`relative cursor-pointer ${className}`} onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsOpen(!isOpen); }}>
      <div className="flex items-center justify-between gap-1 text-slate-700 font-medium select-none">
        <span className="truncate">{selectedOption?.label}</span>
        <ChevronDown size={14} className={`text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className={`absolute top-full mt-3 min-w-[140px] bg-white/95 backdrop-blur-xl border border-white/60 rounded-xl shadow-xl z-[9999] overflow-hidden max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-200 ${getAlignmentClass()}`}>
          <div className="p-1">
            {options.map(option => (
              <div
                key={option.value}
                className={`px-3 py-2 text-sm cursor-pointer rounded-lg flex items-center justify-between hover:bg-indigo-50 transition-colors ${value === option.value ? 'text-indigo-600 font-semibold bg-indigo-50/50' : 'text-slate-700'}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onChange(option.value);
                  setIsOpen(false);
                }}
              >
                <span className="whitespace-nowrap">{option.label}</span>
                {value === option.value && <Check size={14} className="text-indigo-600 shrink-0 ml-3" />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
