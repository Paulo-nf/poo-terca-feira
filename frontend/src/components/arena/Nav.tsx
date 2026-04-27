import { UserMenu } from "@/components/arena/UserMenu";

interface NavProps {
  page: string;
  setPage: (page: string) => void;
  onRequestLogin: () => void;
}

const NAV_LINKS = [
  { key: "home", label: "Home" },
  { key: "eventos", label: "Eventos" },
  { key: "ajuda", label: "Ajuda" },
];

export function Nav({ page, setPage, onRequestLogin }: NavProps) {
  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-12 h-[68px] bg-card border-b border-border shadow-sm max-md:px-5">
      <button
        onClick={() => setPage("home")}
        className="flex items-center gap-2.5 font-heading font-black text-[17px] text-blue-dark tracking-tight"
      >
        <span className="w-9 h-9 bg-blue rounded-[10px] flex items-center justify-center text-lg animate-[pulse-ring_3s_ease_infinite]">
          🏟
        </span>
        ARENA PE
      </button>

      <ul className="flex gap-9 list-none max-md:hidden">
        {NAV_LINKS.map(({ key, label }) => (
          <li
            key={key}
            onClick={() => setPage(key)}
            className={`text-sm font-bold cursor-pointer transition-colors duration-150 ${
              page === key
                ? "text-blue relative after:content-[''] after:absolute after:bottom-[-23px] after:left-0 after:right-0 after:h-[3px] after:bg-blue after:rounded-t"
                : "text-muted-foreground hover:text-blue"
            }`}
          >
            {label}
          </li>
        ))}
      </ul>

      <div className="flex gap-2.5 items-center">
        <button
          aria-label="Menu"
          className="w-[38px] h-[38px] bg-surface2 rounded-[10px] flex items-center justify-center text-[15px] text-muted-foreground hover:bg-blue-light hover:text-blue transition-colors md:hidden"
        >
          ≡
        </button>
        <UserMenu onRequestLogin={onRequestLogin} setPage={setPage} />
      </div>
    </nav>
  );
}
