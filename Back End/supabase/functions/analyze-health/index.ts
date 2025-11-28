import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { bloodPressureData, weightData, glucoseData, goals } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const prompt = `Você é um assistente de saúde especializado em análise de sinais vitais. Analise os seguintes dados e forneça insights personalizados:

DADOS DE PRESSÃO ARTERIAL:
${bloodPressureData.map((d: any) => `Data: ${d.date}, Sistólica: ${d.systolic}mmHg, Diastólica: ${d.diastolic}mmHg`).join('\n')}
Meta: Sistólica ${goals.bloodPressure.systolic}mmHg, Diastólica ${goals.bloodPressure.diastolic}mmHg

DADOS DE PESO:
${weightData.map((d: any) => `Data: ${d.date}, Peso: ${d.value}kg`).join('\n')}
Meta: ${goals.weight}kg

DADOS DE GLICEMIA:
${glucoseData.map((d: any) => `Data: ${d.date}, Glicemia: ${d.value}mg/dL`).join('\n')}
Meta: ${goals.glucose}mg/dL

Forneça uma análise estruturada em formato JSON com a seguinte estrutura:
{
  "summary": "Resumo geral do estado de saúde",
  "trends": {
    "bloodPressure": "Análise da tendência da pressão arterial",
    "weight": "Análise da tendência do peso",
    "glucose": "Análise da tendência da glicemia"
  },
  "recommendations": [
    "Recomendação 1",
    "Recomendação 2",
    "Recomendação 3"
  ],
  "alerts": [
    "Alerta importante 1 (se houver)",
    "Alerta importante 2 (se houver)"
  ]
}

Seja objetivo, claro e forneça insights acionáveis. Considere as metas definidas pelo usuário.`;

    console.log('Calling Lovable AI with prompt:', prompt);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'Você é um assistente de saúde especializado. Sempre responda em português e forneça análises baseadas em dados médicos.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Limite de requisições excedido. Tente novamente em alguns instantes.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Créditos esgotados. Por favor, adicione créditos ao workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`AI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    console.log('AI response:', aiResponse);

    // Parse JSON from AI response
    let insights;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/) || aiResponse.match(/```\n([\s\S]*?)\n```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : aiResponse;
      insights = JSON.parse(jsonStr);
    } catch (e) {
      console.error('Failed to parse AI response as JSON:', e);
      // Fallback response
      insights = {
        summary: aiResponse,
        trends: {
          bloodPressure: "Análise em processamento",
          weight: "Análise em processamento",
          glucose: "Análise em processamento"
        },
        recommendations: ["Consulte seu médico para uma avaliação detalhada"],
        alerts: []
      };
    }

    return new Response(
      JSON.stringify({ insights }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-health function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
