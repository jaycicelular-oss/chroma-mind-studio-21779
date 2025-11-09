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
    const { message, characterData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY não configurada');
    }

    const systemPrompt = `Você é um assistente especializado em criar prompts detalhados para geração de imagens de personagens. 
Ajude o usuário a criar descrições visuais ricas e detalhadas baseadas nas informações do personagem fornecidas.
Seja criativo e sugira detalhes visuais como expressões faciais, poses, roupas, iluminação e cenário.

IMPORTANTE: 
- Permita qualquer tipo de pose ou posição corporal (sentado, deitado, de pé, agachado, dançando, etc.)
- SEMPRE inclua descrições de roupas apropriadas para os personagens
- NUNCA sugira ou permita nudez, conteúdo explícito ou inadequado
- Todos os personagens devem estar vestidos de forma apropriada

${characterData ? `Informações do personagem atual:
- Nome: ${characterData.name || 'Não definido'}
- Gênero: ${characterData.gender || 'Não definido'}
- Cor do cabelo: ${characterData.hair_color || 'Não definido'}
- Cor dos olhos: ${characterData.eye_color || 'Não definido'}
- Idade: ${characterData.age || 'Não definido'}
- Tipo de corpo: ${characterData.body_type || 'Não definido'}
` : ''}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      throw new Error(`Erro da API: ${response.status}`);
    }

    const data = await response.json();
    const suggestion = data.choices?.[0]?.message?.content;

    return new Response(
      JSON.stringify({ suggestion }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in character-ai-assistant:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
