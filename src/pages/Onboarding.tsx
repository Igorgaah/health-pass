import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft } from "lucide-react";
import onboarding1 from "@/assets/onboarding-1.jpg";
import onboarding2 from "@/assets/onboarding-2.jpg";
import onboarding3 from "@/assets/onboarding-3.jpg";

const Onboarding = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      image: onboarding1,
      title: "Gerencie sua saúde em um só lugar",
      description: "Acesse todas as suas informações médicas de forma rápida e segura",
    },
    {
      image: onboarding2,
      title: "Agende consultas facilmente",
      description: "Encontre médicos, escolha horários e confirme suas consultas em poucos cliques",
    },
    {
      image: onboarding3,
      title: "Histórico médico digital",
      description: "Mantenha seus exames, receitas e prontuários sempre à mão",
    },
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      localStorage.setItem("hasSeenOnboarding", "true");
      navigate("/auth");
    }
  };

  const handlePrevious = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem("hasSeenOnboarding", "true");
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-background flex flex-col">
      {/* Skip Button */}
      <div className="p-4 flex justify-end">
        <Button variant="ghost" onClick={handleSkip}>
          Pular
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          {/* Image */}
          <div className="relative aspect-video rounded-2xl overflow-hidden shadow-large">
            <img
              src={slides[currentSlide].image}
              alt={slides[currentSlide].title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Text Content */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-foreground">
              {slides[currentSlide].title}
            </h2>
            <p className="text-lg text-muted-foreground">
              {slides[currentSlide].description}
            </p>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentSlide
                    ? "w-8 bg-primary"
                    : "w-2 bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="p-6 flex justify-between gap-4 max-w-md mx-auto w-full">
        {currentSlide > 0 ? (
          <Button
            variant="outline"
            size="lg"
            onClick={handlePrevious}
            className="flex-1"
          >
            <ChevronLeft className="h-5 w-5 mr-2" />
            Anterior
          </Button>
        ) : (
          <div className="flex-1" />
        )}
        
        <Button
          size="lg"
          onClick={handleNext}
          className="flex-1"
        >
          {currentSlide === slides.length - 1 ? "Começar" : "Próximo"}
          {currentSlide < slides.length - 1 && (
            <ChevronRight className="h-5 w-5 ml-2" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default Onboarding;
