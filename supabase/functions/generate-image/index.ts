import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const { prompt, style, aspectRatio, quality } = await req.json();
    
    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Generating image with prompt:', prompt);

    // Content moderation - block nudity but allow all poses
    const nudityKeywords = [
      'nude', 'naked', 'nudity', 'nude body', 'sem roupa', 'sem roupas', 'nu', 'nua', 
      'pelado', 'pelada', 'despido', 'despida', 'genitals', 'genitalia', 'genital',
      'topless', 'bottomless', 'explicit', 'nsfw', 'pornographic', 'porn'
    ];
    
    const promptLower = prompt.toLowerCase();
    const hasNudity = nudityKeywords.some(keyword => promptLower.includes(keyword));
    
    if (hasNudity) {
      return new Response(
        JSON.stringify({ error: 'Conteúdo inadequado detectado. Por favor, remova referências a nudez do prompt.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Enhance prompt based on style with explicit content guidelines
    let enhancedPrompt = `${prompt}, clothed, wearing clothes, no nudity, appropriate content`;
    switch (style) {
      case 'photorealistic':
        enhancedPrompt += ', ultra high resolution, photorealistic, cinematic lighting, 8K quality';
        break;
      case 'fantasy':
        enhancedPrompt += ', fantasy art, magical atmosphere, detailed, vibrant colors';
        break;
      case 'anime':
        enhancedPrompt += ', anime style, vibrant colors, detailed characters';
        break;
      case 'linear':
        enhancedPrompt += ', semi-realistic digital illustration, strong anime/manga influence, detailed character art, professional digital painting, anime-inspired aesthetic';
        break;
      case 'art-linear-x':
        enhancedPrompt += ', semi-realistic digital illustration with strong anime and manga influence, detailed character art style, professional digital painting with clean lines and smooth shading, vibrant colors, anime-inspired aesthetic, high quality digital art with soft lighting and elegant composition';
        break;
      case 'concept':
        enhancedPrompt += ', concept art, professional, detailed, digital art';
        break;
    }

    // Multi-API strategy: Try multiple AI models for better reliability
    const models = [
      'google/gemini-2.5-flash-image-preview',
      'google/gemini-2.5-pro-image-preview',
      'google/gemini-2.5-flash-lite-image-preview'
    ];

    let imageUrl = null;
    let lastError = null;

    // Try each model until one succeeds
    for (const model of models) {
      try {
        console.log(`Trying model: ${model}`);
        
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
                role: 'user',
                content: enhancedPrompt
              }
            ],
            modalities: ['image', 'text']
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`${model} error:`, response.status, errorText);
          
          if (response.status === 429) {
            lastError = 'Limite de requisições excedido. Tente novamente em alguns minutos.';
            continue; // Try next model
          }
          
          lastError = `Erro na API de IA: ${response.status}`;
          continue; // Try next model
        }

        const data = await response.json();
        console.log(`${model} response:`, JSON.stringify(data, null, 2));
        
        imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

        if (imageUrl) {
          console.log(`Image generated successfully with ${model}`);
          break; // Success! Exit loop
        } else {
          console.error(`No image URL found in ${model} response`);
          lastError = 'No image generated - response format invalid';
          continue; // Try next model
        }
      } catch (error) {
        console.error(`Error with ${model}:`, error);
        lastError = error instanceof Error ? error.message : 'Unknown error';
        continue; // Try next model
      }
    }

    // If all models failed, return error
    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: lastError || 'Falha ao gerar imagem com todos os modelos disponíveis' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user ID from JWT token
    const authHeader = req.headers.get('authorization');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Extract user from token
    const token = authHeader?.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);

    if (!user) {
      throw new Error('User not authenticated');
    }

    // Save to database
    const { data: savedImage, error: dbError } = await supabase
      .from('generated_images')
      .insert({
        user_id: user.id,
        prompt,
        style,
        aspect_ratio: aspectRatio,
        quality,
        image_url: imageUrl
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw dbError;
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        image: savedImage
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error in generate-image function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Erro ao gerar imagem' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
