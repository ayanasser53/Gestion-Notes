"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin/enseignants", label: "Enseignants" },
  { href: "/admin/etudiants",   label: "Etudiants"   },
  { href: "/admin/classes",     label: "Classes"      },
  { href: "/admin/matieres",    label: "Matières"     },
  { href: "/admin/planning",    label: "Planification"},
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-44 flex-shrink-0 border-r border-gray-200 bg-gray-50 py-4">
      <p className="px-4 pb-2.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 font-mono">
        Gestion du référentiel
      </p>
      <nav>
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "flex items-center gap-2 px-4 py-2 text-[13px] border-l-2 transition-all duration-100",
                active
                  ? "border-blue-600 bg-blue-50 text-blue-600 font-medium"
                  : "border-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-800",
              ].join(" ")}
            >
              <span
                className={[
                  "w-1.5 h-1.5 rounded-full",
                  active ? "bg-blue-600" : "bg-gray-300",
                ].join(" ")}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
