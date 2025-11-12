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
    const { imageUrl, editPrompt } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY não configurada');
    }

    console.log('Editing image with prompt:', editPrompt);

    // Multi-API strategy: Try multiple AI models for better reliability
    const models = [
      'google/gemini-2.5-flash-image-preview',
      'google/gemini-2.5-pro-image-preview',
      'google/gemini-2.5-flash-lite-image-preview'
    ];

    let editedImageUrl = null;
    let lastError = null;

    const systemPrompt = `Você é um editor de imagens avançado com precisão cirúrgica. Siga estas regras críticas:

1. ALTERAÇÕES PRECISAS: Faça APENAS as modificações explicitamente solicitadas. Se pedirem "mudar para gordo", altere SOMENTE o tipo físico, mantendo tudo mais idêntico.

2. PRESERVAÇÃO TOTAL: Mantenha 100% de:
   - Identidade facial (rosto, traços, cor da pele)
   - Características não mencionadas (cabelo, olhos, roupas, acessórios)
   - Qualidade visual (resolução, iluminação, cores, textura)
   - Composição e enquadramento da cena
   - Fundo e contexto ambiental

3. CONSISTÊNCIA: A pessoa editada deve ser reconhecível como a mesma pessoa, apenas com as alterações específicas aplicadas.

4. QUALIDADE: Mantenha alta fidelidade visual. Nada de artefatos, distorções ou perda de qualidade.

5. NATURALIDADE: As alterações devem parecer naturais e coerentes com o resto da imagem.`;

    // Try each model until one succeeds
    for (const model of models) {
      try {
        console.log(`Trying edit with model: ${model}`);
        
        const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: model,
            messages: [
              {
                role: 'system',
                content: systemPrompt
              },
              {
                role: 'user',
                content: [
                  {
                    type: 'text',
                    text: `Aplique estas modificações de forma precisa e cirúrgica: ${editPrompt}

IMPORTANTE: Faça APENAS estas alterações. Todo o resto da imagem deve permanecer idêntico ao original.`
                  },
                  {
                    type: 'image_url',
                    image_url: {
                      url: imageUrl
                    }
                  }
                ]
              }
            ],
            modalities: ['image', 'text'],
            quality: 'high'
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`${model} error:`, response.status, errorText);
          
          if (response.status === 429) {
            lastError = 'Limite de requisições excedido. Tente novamente em alguns minutos.';
            continue; // Try next model
          }
          
          lastError = `Erro da API: ${response.status}`;
          continue; // Try next model
        }

        const data = await response.json();
        editedImageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

        if (editedImageUrl) {
          console.log(`Image edited successfully with ${model}`);
          break; // Success! Exit loop
        } else {
          console.error(`No image URL found in ${model} response`);
          lastError = 'Nenhuma imagem retornada pela API';
          continue; // Try next model
        }
      } catch (error) {
        console.error(`Error with ${model}:`, error);
        lastError = error instanceof Error ? error.message : 'Unknown error';
        continue; // Try next model
      }
    }

    // If all models failed, return error
    if (!editedImageUrl) {
      return new Response(
        JSON.stringify({ error: lastError || 'Falha ao editar imagem com todos os modelos disponíveis' }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify({ editedImageUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in edit-image:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
