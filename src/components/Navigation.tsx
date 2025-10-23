import { Link, useLocation } from "react-router-dom";
import { Landmark, Search, Calendar, Building2, Users, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/artifacts", label: "Artifacts", icon: Landmark },
    { path: "/exhibitions", label: "Exhibitions", icon: Calendar },
    { path: "/museums", label: "Museums", icon: Building2 },
    { path: "/sponsors", label: "Sponsors", icon: Users },
  ];

  return (
    <nav className="border-b bg-card shadow-card sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 font-serif text-xl font-semibold text-primary">
            <Landmark className="h-6 w-6 text-accent" />
            Museum Archive
          </Link>
          
          <div className="hidden md:flex items-center gap-1">
            {navItems.map(({ path, label, icon: Icon }) => {
              const isActive = location.pathname === path;
              return (
                <Link key={path} to={path}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className="gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
