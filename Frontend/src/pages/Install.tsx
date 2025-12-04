import { useState, useEffect } from "react";
import { Download, Check, Smartphone, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { isPWAInstalled } from "@/utils/registerSW";

const Install = () => {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    setIsInstalled(isPWAInstalled());

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsInstalled(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background pb-20">
      <div className="container max-w-2xl mx-auto p-4 pt-8">
        <div className="text-center mb-8">
          <img 
            src="/Health Pass.jpg" 
            alt="HealthPass" 
            className="w-24 h-24 mx-auto mb-4 rounded-2xl shadow-lg"
          />
          <h1 className="text-3xl font-bold mb-2">Instalar HealthPass</h1>
          <p className="text-muted-foreground">
            Acesse seu histórico de saúde offline, a qualquer momento
          </p>
        </div>

        {isInstalled ? (
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Check className="h-6 w-6 text-primary" />
                <CardTitle>App já instalado!</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                O HealthPass já está instalado no seu dispositivo. Você pode acessá-lo a qualquer momento pela tela inicial.
              </p>
              <Button onClick={() => navigate("/")} className="w-full">
                Ir para o Dashboard
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  Por que instalar?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Bell className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Notificações Push</h3>
                    <p className="text-sm text-muted-foreground">
                      Receba lembretes de medicamentos e consultas mesmo com o app fechado
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Download className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Acesso Offline</h3>
                    <p className="text-sm text-muted-foreground">
                      Consulte seus dados de saúde sem precisar de internet
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Smartphone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Acesso Rápido</h3>
                    <p className="text-sm text-muted-foreground">
                      Abra direto da tela inicial, como um app nativo
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {deferredPrompt ? (
              <Button onClick={handleInstall} className="w-full" size="lg">
                <Download className="mr-2 h-5 w-5" />
                Instalar Agora
              </Button>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Como instalar</CardTitle>
                  <CardDescription>
                    Siga as instruções do seu navegador
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">📱 No iPhone/iPad (Safari)</h3>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                      <li>Toque no botão de compartilhar (quadrado com seta)</li>
                      <li>Role para baixo e toque em "Adicionar à Tela Inicial"</li>
                      <li>Toque em "Adicionar"</li>
                    </ol>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">🤖 No Android (Chrome)</h3>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                      <li>Toque no menu (três pontos) no canto superior direito</li>
                      <li>Toque em "Instalar app" ou "Adicionar à tela inicial"</li>
                      <li>Confirme a instalação</li>
                    </ol>
                  </div>
                  <Button onClick={() => navigate("/")} variant="outline" className="w-full">
                    Continuar no navegador
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Install;
