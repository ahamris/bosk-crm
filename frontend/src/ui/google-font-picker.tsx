import { useState, useMemo, useEffect } from 'react';
import { Combobox, ComboboxInput, ComboboxOptions, ComboboxOption } from '@headlessui/react';
import clsx from 'clsx';

// Top 80 Google Fonts — geen API key nodig, gewoon embed
const GOOGLE_FONTS = [
  'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins', 'Raleway',
  'Nunito', 'Nunito Sans', 'Source Sans 3', 'Ubuntu', 'Rubik', 'Work Sans',
  'Mulish', 'Noto Sans', 'Fira Sans', 'Manrope', 'DM Sans', 'Plus Jakarta Sans',
  'Outfit', 'Urbanist', 'Lexend', 'Space Grotesk', 'Albert Sans', 'Figtree',
  'Geist', 'Onest', 'Instrument Sans',
  'Playfair Display', 'Merriweather', 'Lora', 'PT Serif', 'Libre Baskerville',
  'Crimson Text', 'EB Garamond', 'Cormorant Garamond', 'Source Serif 4',
  'Noto Serif', 'Bitter', 'Vollkorn', 'Alegreya',
  'JetBrains Mono', 'Fira Code', 'Source Code Pro', 'IBM Plex Mono',
  'Roboto Mono', 'Space Mono', 'DM Mono',
  'Oswald', 'Barlow', 'Barlow Condensed', 'Anton', 'Archivo', 'Bebas Neue',
  'Cabin', 'Catamaran', 'Exo 2', 'Heebo', 'Hind', 'Jost', 'Karla',
  'Maven Pro', 'Mukta', 'Nanum Gothic', 'Overpass', 'Oxygen', 'Quicksand',
  'Rajdhani', 'Saira', 'Sora', 'Titillium Web', 'Varela Round',
  'Zilla Slab', 'IBM Plex Sans', 'Asap', 'Assistant', 'Comfortaa',
  'Dosis', 'Encode Sans', 'Josefin Sans', 'Kanit', 'Prompt',
  'Public Sans', 'Red Hat Display', 'Signika', 'Yanone Kaffeesatz',
];

interface GoogleFontPickerProps {
  value: string;
  onChange: (font: string) => void;
  label?: string;
  className?: string;
}

function loadGoogleFont(font: string) {
  if (!font || font === 'system-ui') return;
  const id = `gf-${font.replace(/\s+/g, '-').toLowerCase()}`;
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(font)}:wght@300;400;500;600;700&display=swap`;
  document.head.appendChild(link);
}

export function GoogleFontPicker({ value, onChange, label, className }: GoogleFontPickerProps) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const fonts = ['system-ui', ...GOOGLE_FONTS];
    if (!query) return fonts.slice(0, 30);
    return fonts.filter(f => f.toLowerCase().includes(query.toLowerCase())).slice(0, 30);
  }, [query]);

  // Load selected font for preview
  useEffect(() => { loadGoogleFont(value); }, [value]);

  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium text-zinc-700 mb-1">{label}</label>}
      <Combobox value={value} onChange={(v) => { if (v) { onChange(v); loadGoogleFont(v); } }} immediate>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <i className="far fa-font text-zinc-400 text-sm" />
          </div>
          <ComboboxInput
            onChange={(e) => setQuery(e.target.value)}
            displayValue={(v: string) => v}
            placeholder="Zoek Google Font..."
            className="block w-full rounded-md border-0 py-2 pl-9 pr-10 text-sm text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 placeholder:text-zinc-400 focus:ring-2 focus:ring-zinc-900"
            style={{ fontFamily: value !== 'system-ui' ? `"${value}", system-ui` : 'system-ui' }}
          />
          <ComboboxOptions className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 shadow-lg ring-1 ring-zinc-900/5">
            {filtered.map(font => (
              <ComboboxOption key={font} value={font}
                className={({ focus }) => clsx('flex items-center justify-between px-3 py-2 text-sm cursor-pointer transition-colors', focus ? 'bg-zinc-50' : '')}>
                {({ selected }) => {
                  if (font !== 'system-ui') loadGoogleFont(font);
                  return (
                    <>
                      <span style={{ fontFamily: font !== 'system-ui' ? `"${font}", system-ui` : 'system-ui' }}
                        className={clsx(selected && 'font-semibold')}>
                        {font}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-mono">{font === 'system-ui' ? 'default' : 'Google'}</span>
                    </>
                  );
                }}
              </ComboboxOption>
            ))}
            {filtered.length === 0 && <div className="px-3 py-2 text-sm text-zinc-500">Geen fonts gevonden</div>}
          </ComboboxOptions>
        </div>
      </Combobox>
      {value && value !== 'system-ui' && (
        <p className="mt-1.5 text-xs text-zinc-400" style={{ fontFamily: `"${value}", system-ui` }}>
          Preview: Het snelle bruine vos springt over de luie hond. 0123456789
        </p>
      )}
    </div>
  );
}

export { loadGoogleFont, GOOGLE_FONTS };
