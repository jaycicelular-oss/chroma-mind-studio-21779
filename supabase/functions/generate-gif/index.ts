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

    console.log('Generating GIF with prompt:', prompt);

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

    // Enhance prompt for GIF generation with movement instructions and content guidelines
    let enhancedPrompt = `Create an animated GIF with realistic movements: ${prompt}. Add subtle, natural motion like breathing, hair moving, slight body sway, or environmental movement. Ensure all subjects are clothed and wearing appropriate clothing, no nudity.`;
    
    switch (style) {
      case 'photorealistic':
        enhancedPrompt += ' Ultra realistic animation, smooth motion, cinematic quality.';
        break;
      case 'fantasy':
        enhancedPrompt += ' Fantasy art style, magical movement effects, vibrant animated colors.';
        break;
      case 'anime':
        enhancedPrompt += ' Anime style animation, expressive movements, dynamic action.';
        break;
      case 'concept':
        enhancedPrompt += ' Concept art style, professional animation, detailed movement.';
        break;
    }

    // Generate multiple frames for GIF animation
    const frames = [];
    for (let i = 0; i < 4; i++) {
      const framePrompt = `${enhancedPrompt} Frame ${i + 1} of animated sequence.`;
      
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
              role: 'user',
              content: framePrompt
            }
          ],
          modalities: ['image', 'text']
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('AI Gateway error:', response.status, errorText);
        
        if (response.status === 429) {
          return new Response(
            JSON.stringify({ error: 'Limite de requisições excedido. Tente novamente em alguns minutos.' }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        return new Response(
          JSON.stringify({ error: `Erro na API de IA: ${response.status}` }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const data = await response.json();
      const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

      if (!imageUrl) {
        console.error('No image URL found in response');
        throw new Error('No image generated for frame ' + (i + 1));
      }

      frames.push(imageUrl);
    }

    console.log('GIF frames generated successfully:', frames.length);

    // Get user ID from JWT token
    const authHeader = req.headers.get('authorization');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const token = authHeader?.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);

    if (!user) {
      throw new Error('User not authenticated');
    }

    // For now, we'll save the first frame as the GIF URL
    // In a production environment, you'd combine frames into an actual GIF
    const { data: savedGif, error: dbError } = await supabase
      .from('generated_gifs')
      .insert({
        user_id: user.id,
        prompt,
        style,
        aspect_ratio: aspectRatio,
        quality,
        gif_url: frames[0] // Using first frame as placeholder
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
        gif: savedGif,
        frames // Return all frames for client-side animation
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error in generate-gif function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Erro ao gerar GIF' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});