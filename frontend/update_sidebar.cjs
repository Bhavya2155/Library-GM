const fs = require('fs');
let code = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

// Add imports
code = code.replace(/import { BookOpen, Users, LayoutDashboard, Library, LogOut, Bell, UserCircle, Settings, Eye, EyeOff, ChevronDown } from 'lucide-react';/, 
  `import { BookOpen, Users, LayoutDashboard, Library, LogOut, Bell, UserCircle, Settings, Eye, EyeOff, ChevronDown, Menu, X } from 'lucide-react';`);

// Add state
code = code.replace(/const \[showDropdown, setShowDropdown\] = useState\(false\);/, 
  `const [showDropdown, setShowDropdown] = useState(false);\n  const [isMobileOpen, setIsMobileOpen] = useState(false);`);

// Modify return wrapper
code = code.replace(/return \(\n\s*<div className="w-56 bg-white\/70 backdrop-blur-2xl border-r border-white\/50 flex flex-col h-full shadow-\[4px_0_24px_rgba\(0,0,0,0\.02\)\] relative z-10">\n\s*<div className="p-6 border-b border-white\/50 flex flex-col items-center gap-2">/,
`return (
    <>
      <button onClick={() => setIsMobileOpen(true)} className="md:hidden fixed top-4 left-4 z-40 p-2 bg-white/90 backdrop-blur-md rounded-xl shadow-md text-slate-700 hover:text-indigo-600 transition-colors">
        <Menu size={24} />
      </button>

      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm" onClick={() => setIsMobileOpen(false)}></div>
      )}

      <div className={\`\${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed inset-y-0 left-0 md:relative z-50 w-64 bg-white/70 backdrop-blur-2xl border-r border-white/50 flex flex-col h-full shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-transform duration-300 ease-in-out\`}>
        <div className="p-6 border-b border-white/50 flex flex-col items-center gap-2 relative">
          <button onClick={() => setIsMobileOpen(false)} className="md:hidden absolute top-4 right-4 text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>`);

// Fix <NavLink onClick closing Sidebar on mobile
code = code.replace(/<NavLink /g, `<NavLink onClick={() => setIsMobileOpen(false)} `);

// Also need to close the wrapping <> for return statement at the end of file!
// The last line of Sidebar is `    </div>\n  );\n};\n\nexport default Sidebar;`
code = code.replace(/    <\/div>\n  \);\n};\n\nexport default Sidebar;/g, `    </div>\n    </>\n  );\n};\n\nexport default Sidebar;`);

fs.writeFileSync('src/components/Sidebar.tsx', code);
console.log('Sidebar updated for mobile!');
