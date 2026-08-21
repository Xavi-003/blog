import { 
  Users, 
  Briefcase, 
  LayoutGrid, 
  Table, 
  Filter, 
  TrendingUp,
  ShieldCheck,
  Cpu
} from 'lucide-react';

interface RoleFilterBarProps {
  selectedRole?: string;
  activeRole?: string;
  onSelectRole: (role: string) => void;
  selectedCategory?: string | null;
  onSelectCategory?: (category: string | null) => void;
  categories?: string[];
  viewMode?: 'grid' | 'matrix';
  onToggleViewMode?: (mode: 'grid' | 'matrix') => void;
}

const ROLES = [
  { id: 'All', label: 'All Decision-Makers', icon: Users },
  { id: 'CTO', label: 'CTO & Engineering', icon: Cpu },
  { id: 'CFO', label: 'CFO & Finance', icon: TrendingUp },
  { id: 'Founders', label: 'Founders & Investors', icon: Briefcase },
  { id: 'Security', label: 'Security & Compliance', icon: ShieldCheck },
];

export const RoleFilterBar = ({
  selectedRole,
  activeRole,
  onSelectRole,
  selectedCategory,
  onSelectCategory,
  categories = [],
  viewMode = 'grid',
  onToggleViewMode,
}: RoleFilterBarProps) => {
  const currentRole = activeRole || selectedRole || 'All';

  return (
    <div className="executive-filter-wrapper">
      {/* Role Tabs */}
      <div className="role-filter-strip">
        <div className="filter-label-group">
          <Filter size={15} />
          <span>FILTER BY EXECUTIVE ROLE:</span>
        </div>

        <div className="role-buttons-row">
          {ROLES.map(role => {
            const Icon = role.icon;
            const isActive = currentRole.toLowerCase() === role.id.toLowerCase();

            return (
              <button
                key={role.id}
                type="button"
                className={`role-pill-btn ${isActive ? 'active' : ''}`}
                onClick={() => onSelectRole(role.id)}
              >
                <Icon size={14} />
                <span>{role.label}</span>
              </button>
            );
          })}
        </div>

        {/* View Mode Switcher */}
        {onToggleViewMode && (
          <div className="view-mode-toggle">
            <button
              type="button"
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => onToggleViewMode('grid')}
              title="Card Grid View"
            >
              <LayoutGrid size={15} />
              <span>Grid</span>
            </button>
            <button
              type="button"
              className={`view-btn ${viewMode === 'matrix' ? 'active' : ''}`}
              onClick={() => onToggleViewMode('matrix')}
              title="Analyst Matrix Table View"
            >
              <Table size={15} />
              <span>Analyst Matrix</span>
            </button>
          </div>
        )}
      </div>

      {/* Category Pills (if provided) */}
      {categories.length > 0 && onSelectCategory && (
        <div className="category-filter-strip">
          <button
            type="button"
            className={`category-pill ${selectedCategory === null ? 'active' : ''}`}
            onClick={() => onSelectCategory(null)}
          >
            All Topics ({categories.length})
          </button>

          {categories.map(cat => (
            <button
              key={cat}
              type="button"
              className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => onSelectCategory(selectedCategory === cat ? null : cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
