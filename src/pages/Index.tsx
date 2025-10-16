import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Por enquanto, redireciona direto para auth
    // Futuramente, pode verificar se o usuário está logado
    navigate("/auth");
  }, [navigate]);

  return null;
};

export default Index;
