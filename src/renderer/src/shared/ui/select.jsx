import { useState, useRef, useEffect } from 'react';
import { IoIosArrowDown as Arrow } from "react-icons/io";
import { cn } from '../utils';

const useClickOutside = (ref, handler) => {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };
    document.addEventListener('mousedown', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
    };
  }, [ref, handler]);
};

export default function Select({ label, options, value, onChange, isDisabled }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  useClickOutside(selectRef, () => setIsOpen(false));

  const selectedOption = options.find(option => option.value === value);

  const handleOptionClick = (newValue) => {
    onChange(newValue);
    setIsOpen(false);
  };

  return (
    <div
      ref={selectRef}
      onClick={() => !isDisabled && setIsOpen(!isOpen)}
      className="relative font-sans  bg-base-200 rounded-md shadow-md shadow-base-100/30 border border-base-content/10 p-3">
      {/* Label */}
      <div className={cn("text-[11px] uppercase tracking-wide text-base-content/60 font-medium pb-1")}>
        {label.toUpperCase()}
      </div>

      {/* The visible part of the select button */}
      <button
        type="button"
        className="flex justify-between items-center w-full text-left"
      >
        <span className="text-sm text-base-content font-semibold">
          {selectedOption ? selectedOption.label : 'Select...'}
        </span>
        <Arrow className={`size-3 text-base-content/50 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} ${isDisabled && 'hidden'}`} />
      </button>

      <div className={cn("absolute left-0 z-10 w-full bg-base-200 border border-base-content/10 rounded-md transition-all duration-150 ease-linear shadow-lg", isOpen ? 'opacity-100 top-[105%] pointer-events-auto' : 'opacity-0 top-full pointer-events-none')}>
        <ul className="max-h-60 overflow-auto p-1">
          {options.map((option) => (
            <li
              key={option.value}
              onClick={() => handleOptionClick(option.value)}
              className="p-2 text-sm font-medium text-base-content/80 rounded-md cursor-pointer hover:bg-primary hover:text-primary-content"
            >
              {option.label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
