import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, SearchX } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="text-center space-y-6 p-8 max-w-md animate-fade-in">
        <SearchX className="h-24 w-24 mx-auto text-muted-foreground" />
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-foreground">404</h1>
          <h2 className="text-2xl font-semibold text-foreground">Página não encontrada</h2>
          <p className="text-muted-foreground">
            A página que você está procurando não existe ou foi movida.
          </p>
        </div>
        <Button 
          onClick={() => navigate('/dashboard')} 
          className="gap-2"
        >
          <Home className="h-4 w-4" />
          Voltar ao Início
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
