import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const email = urlParams.get("email");
    const nome = urlParams.get("nome");
    const role = urlParams.get("role");

    if (token) {
      apiClient.setToken(token);
      toast.success(`Bem-vindo, ${nome || "usuário"}!`);
      navigate("/");
    } else {
      toast.error("Erro ao processar autenticação. Tente novamente.");
      navigate("/auth");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Processando autenticação...</p>
    </div>
  );
};

export default AuthCallback;