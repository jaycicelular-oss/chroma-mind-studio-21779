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

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          {
            role: 'system',
            content: `Você é um editor de imagens avançado com precisão cirúrgica. Siga estas regras críticas:

1. ALTERAÇÕES PRECISAS: Faça APENAS as modificações explicitamente solicitadas. Se pedirem "mudar para gordo", altere SOMENTE o tipo físico, mantendo tudo mais idêntico.

2. PRESERVAÇÃO TOTAL: Mantenha 100% de:
   - Identidade facial (rosto, traços, cor da pele)
   - Características não mencionadas (cabelo, olhos, roupas, acessórios)
   - Qualidade visual (resolução, iluminação, cores, textura)
   - Composição e enquadramento da cena
   - Fundo e contexto ambiental

3. CONSISTÊNCIA: A pessoa editada deve ser reconhecível como a mesma pessoa, apenas com as alterações específicas aplicadas.

4. QUALIDADE: Mantenha alta fidelidade visual. Nada de artefatos, distorções ou perda de qualidade.

5. NATURALIDADE: As alterações devem parecer naturais e coerentes com o resto da imagem.`
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
        // Parâmetros para manter qualidade máxima
        quality: 'high'
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Limite de requisições excedido. Tente novamente em alguns minutos.' }),
          { 
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      return new Response(
        JSON.stringify({ error: `Erro da API: ${response.status}` }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const data = await response.json();
    const editedImageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!editedImageUrl) {
      throw new Error('Nenhuma imagem retornada pela API');
    }

    console.log('Image edited successfully');

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
