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
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    const STABILITY_API_KEY = Deno.env.get('STABILITY_API_KEY');

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

    console.log('Starting multi-API image generation...');

    let imageUrl = null;
    let lastError = null;

    // Size maps per provider to satisfy each API's constraints
    const sizeMapGPT: Record<string, string> = {
      '1:1': '1024x1024',
      '16:9': '1536x1024', // gpt-image-1 supported wide
      '9:16': '1024x1536',
    };
    const sizeMapDalle: Record<string, string> = {
      '1:1': '1024x1024',
      '16:9': '1792x1024', // DALL-E 3 wide
      '9:16': '1024x1792',
    };
    const sizeMapStability: Record<string, { width: number; height: number }> = {
      '1:1': { width: 1024, height: 1024 },
      '16:9': { width: 1024, height: 576 }, // multiples of 64, <= 1024
      '9:16': { width: 576, height: 1024 },
    };

    const gptSize = sizeMapGPT[aspectRatio] || sizeMapGPT['1:1'];
    const dalleSize = sizeMapDalle[aspectRatio] || sizeMapDalle['1:1'];
    const stabilitySize = sizeMapStability[aspectRatio] || sizeMapStability['1:1'];

    // Strategy 1: Try OpenAI gpt-image-1 (best quality)
    if (OPENAI_API_KEY) {
      try {
        console.log('Trying OpenAI gpt-image-1...');
        const response = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-image-1',
            prompt: enhancedPrompt,
            size: gptSize,
            quality: quality === 'high' ? 'high' : 'auto',
            output_format: 'png',
            n: 1
          }),
        });

        if (response.ok) {
          const data = await response.json();
          imageUrl = data.data?.[0]?.b64_json ? `data:image/png;base64,${data.data[0].b64_json}` : data.data?.[0]?.url;
          if (imageUrl) {
            console.log('✓ Image generated with OpenAI gpt-image-1');
          }
        } else {
          const errorText = await response.text();
          console.error('OpenAI gpt-image-1 error:', response.status, errorText);
          if (response.status === 429) {
            lastError = 'OpenAI: Limite de requisições atingido';
          } else if (errorText.includes('billing_hard_limit_reached') || errorText.includes('insufficient_quota')) {
            lastError = 'OpenAI: Limite de créditos atingido. Por favor, adicione créditos na sua conta OpenAI.';
          } else {
            lastError = `OpenAI error: ${response.status}`;
          }
        }
      } catch (error) {
        console.error('OpenAI gpt-image-1 exception:', error);
        lastError = error instanceof Error ? error.message : 'OpenAI error';
      }
    }

    // Strategy 2: Try Stability AI SDXL
    if (!imageUrl && STABILITY_API_KEY) {
      try {
        console.log('Trying Stability AI SDXL...');
        const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${STABILITY_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text_prompts: [{ text: enhancedPrompt }],
            cfg_scale: 7,
            width: stabilitySize.width,
            height: stabilitySize.height,
            samples: 1,
            steps: 30,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          imageUrl = data.artifacts?.[0]?.base64 ? `data:image/png;base64,${data.artifacts[0].base64}` : null;
          if (imageUrl) {
            console.log('✓ Image generated with Stability AI');
          }
        } else {
          const errorText = await response.text();
          console.error('Stability AI error:', response.status, errorText);
          lastError = `Stability AI error: ${response.status}`;
        }
      } catch (error) {
        console.error('Stability AI exception:', error);
        lastError = error instanceof Error ? error.message : 'Stability AI error';
      }
    }

    // Strategy 3: Try OpenAI DALL-E 3 (backup)
    if (!imageUrl && OPENAI_API_KEY) {
      try {
        console.log('Trying OpenAI DALL-E 3...');
        const response = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'dall-e-3',
            prompt: enhancedPrompt,
            size: dalleSize,
            quality: quality === 'high' ? 'hd' : 'standard',
            n: 1
          }),
        });

        if (response.ok) {
          const data = await response.json();
          imageUrl = data.data?.[0]?.url;
          if (imageUrl) {
            console.log('✓ Image generated with DALL-E 3');
          }
        } else {
          const errorText = await response.text();
          console.error('DALL-E 3 error:', response.status, errorText);
          lastError = `DALL-E 3 error: ${response.status}`;
        }
      } catch (error) {
        console.error('DALL-E 3 exception:', error);
        lastError = error instanceof Error ? error.message : 'DALL-E 3 error';
      }
    }

    if (!imageUrl) {
      console.error('All APIs failed:', lastError);
      return new Response(
        JSON.stringify({ error: lastError || 'Falha ao gerar imagem com todas as APIs disponíveis' }),
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
