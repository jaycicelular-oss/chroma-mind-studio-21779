
-- Migration: 20251104205509

-- Migration: 20251103104303

-- Migration: 20251027232510
-- Create table for storing generated images
CREATE TABLE public.generated_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  style TEXT NOT NULL,
  aspect_ratio TEXT NOT NULL,
  quality TEXT NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.generated_images ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own images" 
ON public.generated_images 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own images" 
ON public.generated_images 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own images" 
ON public.generated_images 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_generated_images_user_id ON public.generated_images(user_id);
CREATE INDEX idx_generated_images_created_at ON public.generated_images(created_at DESC);

-- Migration: 20251029004959
-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create enum for character gender
CREATE TYPE public.character_gender AS ENUM ('male', 'female');

-- Create table for characters
CREATE TABLE public.characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  family_name TEXT,
  gender character_gender NOT NULL,
  age INTEGER,
  personality TEXT,
  height DECIMAL(3,2),
  voice TEXT,
  hair_type TEXT,
  hair_length TEXT,
  hair_color TEXT,
  eye_color TEXT,
  facial_expression TEXT,
  facial_details TEXT,
  body_type TEXT,
  breast_size TEXT,
  butt_size TEXT,
  musculature TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own characters"
  ON public.characters
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own characters"
  ON public.characters
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own characters"
  ON public.characters
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own characters"
  ON public.characters
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_characters_updated_at
  BEFORE UPDATE ON public.characters
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Migration: 20251029005042
-- Fix security issue: Set search_path for update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Migration: 20251029151737
-- Create albums table
CREATE TABLE public.albums (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;

-- Create policies for albums
CREATE POLICY "Users can view their own albums" 
ON public.albums 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own albums" 
ON public.albums 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own albums" 
ON public.albums 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own albums" 
ON public.albums 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for timestamps
CREATE TRIGGER update_albums_updated_at
BEFORE UPDATE ON public.albums
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create album_items table to store relationships between content and albums
CREATE TABLE public.album_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  album_id UUID NOT NULL REFERENCES public.albums(id) ON DELETE CASCADE,
  content_id UUID NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('image', 'gif', 'frames', 'video', 'character')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.album_items ENABLE ROW LEVEL SECURITY;

-- Create policies for album_items
CREATE POLICY "Users can view items in their albums" 
ON public.album_items 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.albums 
    WHERE albums.id = album_items.album_id 
    AND albums.user_id = auth.uid()
  )
);

CREATE POLICY "Users can add items to their albums" 
ON public.album_items 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.albums 
    WHERE albums.id = album_items.album_id 
    AND albums.user_id = auth.uid()
  )
);

CREATE POLICY "Users can remove items from their albums" 
ON public.album_items 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.albums 
    WHERE albums.id = album_items.album_id 
    AND albums.user_id = auth.uid()
  )
);

-- Add saved flag to generated_images
ALTER TABLE public.generated_images 
ADD COLUMN saved BOOLEAN DEFAULT false;

-- Create table for GIFs
CREATE TABLE public.generated_gifs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  prompt TEXT NOT NULL,
  style TEXT NOT NULL,
  aspect_ratio TEXT NOT NULL,
  quality TEXT NOT NULL,
  gif_url TEXT NOT NULL,
  saved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for GIFs
ALTER TABLE public.generated_gifs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own gifs" 
ON public.generated_gifs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own gifs" 
ON public.generated_gifs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own gifs" 
ON public.generated_gifs 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own gifs" 
ON public.generated_gifs 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create table for Frames
CREATE TABLE public.generated_frames (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  character_id UUID REFERENCES public.characters(id) ON DELETE SET NULL,
  prompt TEXT NOT NULL,
  frame_urls TEXT[] NOT NULL,
  saved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for Frames
ALTER TABLE public.generated_frames ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own frames" 
ON public.generated_frames 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own frames" 
ON public.generated_frames 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own frames" 
ON public.generated_frames 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own frames" 
ON public.generated_frames 
FOR DELETE 
USING (auth.uid() = user_id);


-- Migration: 20251103182230
-- Trigger types regeneration
SELECT 1;

