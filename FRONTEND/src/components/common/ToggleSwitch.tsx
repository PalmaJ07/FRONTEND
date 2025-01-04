interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  size?: 'sm' | 'md' | 'lg';
}

export function ToggleSwitch({ 
  checked, 
  onChange,
  size = 'md'
}: ToggleSwitchProps) {
  const sizes = {
    sm: {
      switch: 'w-8 h-4',
      toggle: 'w-3 h-3',
      translate: 'translate-x-4',
    },
    md: {
      switch: 'w-11 h-6',
      toggle: 'w-5 h-5',
      translate: 'translate-x-5',
    },
    lg: {
      switch: 'w-14 h-7',
      toggle: 'w-6 h-6',
      translate: 'translate-x-7',
    },
  };

  return (
    <button
      type="button"
      className={`
        ${sizes[size].switch}
        ${checked ? 'bg-green-500' : 'bg-gray-200'}
        relative inline-flex flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
        transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 
        focus:ring-green-500 focus:ring-offset-2
      `}
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
    >
      <span
        className={`
          ${sizes[size].toggle}
          ${checked ? sizes[size].translate : 'translate-x-0'}
          pointer-events-none inline-block transform rounded-full bg-white shadow 
          ring-0 transition duration-200 ease-in-out
        `}
      />
    </button>
  );
}