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
            content: 'Você é um editor de imagens especializado. Sua função é fazer APENAS as alterações solicitadas, mantendo 100% da qualidade, integridade visual e gráfica da imagem original. Preserve todos os detalhes, cores, texturas e características não mencionadas na solicitação.'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: editPrompt
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
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Créditos insuficientes. Por favor, adicione créditos em Settings -> Workspace -> Usage.' }),
          { 
            status: 402,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      throw new Error(`Erro da API: ${response.status}`);
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
