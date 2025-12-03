import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Verifica se é a primeira visita
    const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding");
    
    if (!hasSeenOnboarding) {
      navigate("/onboarding");
    } else {
      // Por enquanto, redireciona para auth
      // Futuramente, pode verificar se o usuário está logado
      navigate("/auth");
    }
  }, [navigate]);

  return null;
};

export default Index;
