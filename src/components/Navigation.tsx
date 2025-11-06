import { Button } from "@/components/ui/button";
import { Home, Images, FolderOpen, LogOut } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-glass bg-card/40 border-b border-gradient">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              AI Creator
            </h1>
          </div>

          {user && (
            <div className="flex items-center gap-2">
              <Button
                variant={isActive("/") ? "default" : "ghost"}
                size="sm"
                onClick={() => navigate("/")}
                className="gap-2"
              >
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Início</span>
              </Button>

              <Button
                variant={isActive("/gallery") ? "default" : "ghost"}
                size="sm"
                onClick={() => navigate("/gallery")}
                className="gap-2"
              >
                <Images className="h-4 w-4" />
                <span className="hidden sm:inline">Galeria</span>
              </Button>

              <Button
                variant={isActive("/albums") ? "default" : "ghost"}
                size="sm"
                onClick={() => navigate("/albums")}
                className="gap-2"
              >
                <FolderOpen className="h-4 w-4" />
                <span className="hidden sm:inline">Álbuns</span>
              </Button>

              <div className="h-6 w-px bg-border mx-2" />

              <Button
                variant="ghost"
                size="sm"
                onClick={signOut}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
