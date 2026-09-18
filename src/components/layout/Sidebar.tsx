import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronsLeft, ChevronsRight } from 'lucide-react';
import { clsx } from 'clsx';
import { NAV_ITEMS } from './navConfig';

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={clsx(
        'hidden md:flex flex-col shrink-0 border-r border-border bg-surface/60 backdrop-blur-glass transition-all duration-300',
        collapsed ? 'w-[76px]' : 'w-[240px]'
      )}
    >
      <div className="flex items-center gap-2 px-4 py-5">
        <div className="h-8 w-8 rounded-control bg-accent" aria-hidden />
        {!collapsed && <span className="font-display text-lg font-semibold text-ink">Tracker</span>}
      </div>

      <nav className="flex-1 space-y-1 px-2">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            title={item.label}
            className={({ isActive }) =>
              clsx(
                'group flex items-center gap-3 rounded-control px-3 py-2.5 text-sm font-medium transition-colors',
                isActive ? 'bg-accent/15 text-accent' : 'text-ink-muted hover:bg-white/5 hover:text-ink'
              )
            }
          >
            <item.icon size={20} className="shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={() => setCollapsed((c) => !c)}
        className="m-2 flex items-center justify-center gap-2 rounded-control py-2 text-ink-muted hover:bg-white/5 hover:text-ink"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
      </button>
    </aside>
  );
}
