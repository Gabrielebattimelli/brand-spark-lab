
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  Plus,
  Settings,
  User
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

interface NavbarProps {
  isAuthenticated?: boolean;
}

export const Navbar = ({ isAuthenticated: propIsAuthenticated }: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  // Use the authentication context to determine if the user is authenticated
  const isAuthenticated = propIsAuthenticated !== undefined ? propIsAuthenticated : !!user;

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
      navigate("/login");
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while logging out",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center ml-2 md:ml-4 lg:ml-8">
          <img src="/logo_brandit.png" alt="BrandIt Logo" className="h-12 w-auto object-contain" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {isAuthenticated ? (
            <>
              <NavLink to="/dashboard">
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </NavLink>
              <Button onClick={() => navigate("/projects/new")} size="sm">
                <Plus size={16} className="mr-1" />
                New Project
              </Button>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate("/settings")}
                >
                  <Settings size={20} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                >
                  <LogOut size={20} />
                </Button>
              </div>
            </>
          ) : (
            <>
              <NavLink to="/features">Features</NavLink>
              <NavLink to="/pricing">Pricing</NavLink>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  onClick={() => navigate("/login")}
                  className="font-medium"
                >
                  Sign In
                </Button>
                <Button onClick={() => navigate("/register")}>Sign Up</Button>
              </div>
            </>
          )}
        </nav>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-gray-600 focus:outline-none"
          onClick={toggleMenu}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 py-2 px-4 animate-fade-in">
          <nav className="flex flex-col space-y-3 py-3">
            {isAuthenticated ? (
              <>
                <MobileNavLink
                  to="/dashboard"
                  icon={<LayoutDashboard size={18} />}
                  onClick={toggleMenu}
                >
                  Dashboard
                </MobileNavLink>
                <MobileNavLink
                  to="/settings"
                  icon={<Settings size={18} />}
                  onClick={toggleMenu}
                >
                  Settings
                </MobileNavLink>
                <MobileNavLink
                  to="/projects/new"
                  icon={<Plus size={18} />}
                  onClick={toggleMenu}
                >
                  New Project
                </MobileNavLink>
                <Button
                  variant="ghost"
                  className="justify-start px-2 py-2 h-auto font-normal"
                  onClick={() => {
                    handleLogout();
                    toggleMenu();
                  }}
                >
                  <LogOut size={18} className="mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <MobileNavLink to="/features" onClick={toggleMenu}>
                  Features
                </MobileNavLink>
                <MobileNavLink to="/pricing" onClick={toggleMenu}>
                  Pricing
                </MobileNavLink>
                <div className="pt-2 flex flex-col space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-center"
                    onClick={() => {
                      navigate("/login");
                      toggleMenu();
                    }}
                  >
                    Sign In
                  </Button>
                  <Button
                    className="w-full justify-center"
                    onClick={() => {
                      navigate("/register");
                      toggleMenu();
                    }}
                  >
                    Sign Up
                  </Button>
                </div>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

const NavLink = ({
  to,
  children,
}: {
  to: string;
  children: React.ReactNode;
}) => (
  <Link
    to={to}
    className="text-gray-700 hover:text-primary flex items-center space-x-1 font-medium transition-colors"
  >
    {children}
  </Link>
);

const MobileNavLink = ({
  to,
  children,
  icon,
  onClick,
}: {
  to: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: () => void;
}) => (
  <Link
    to={to}
    className="flex items-center space-x-2 px-2 py-2 text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md transition-colors"
    onClick={onClick}
  >
    {icon && <span>{icon}</span>}
    <span>{children}</span>
  </Link>
);
