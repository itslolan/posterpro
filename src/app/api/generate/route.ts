import { NextResponse } from 'next/server';
import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const prompt = formData.get('prompt') as string;
    const file = formData.get('image') as File | null;
    const size = formData.get('size') as string || '2K';
    const width = parseInt(formData.get('width') as string || '2048');
    const height = parseInt(formData.get('height') as string || '2048');
    const aspect_ratio = formData.get('aspect_ratio') as string || '4:3';

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Prepare input for Replicate
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const input: any = {
      size: size,
      width: width,
      height: height,
      prompt: prompt,
      max_images: 4, // Generate 4 variations
      aspect_ratio: aspect_ratio,
      enhance_prompt: true,
      sequential_image_generation: 'disabled'
    };

    if (file && file.size > 0) {
      console.log('Converting image to base64...');
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64Image = buffer.toString('base64');
      const mimeType = file.type || 'image/jpeg';
      const dataUrl = `data:${mimeType};base64,${base64Image}`;
      
      console.log('Image converted to base64, size:', Math.round(base64Image.length / 1024), 'KB');
      input.image_input = [dataUrl];
    }

    console.log('Generating images with input:', { ...input, image_input: input.image_input ? '[image provided]' : undefined });

    // Run the model
    const output = await replicate.run("bytedance/seedream-4", { input });

    // Process the output to get URLs
    const imageUrls: string[] = [];
    
    if (Array.isArray(output)) {
       // eslint-disable-next-line @typescript-eslint/no-explicit-any
       for (const item of output) {
        if (typeof item === 'object' && item !== null && 'url' in item && typeof (item as any).url === 'function') {
           // eslint-disable-next-line @typescript-eslint/no-explicit-any
           imageUrls.push((item as any).url());
        } else if (typeof item === 'string') {
           imageUrls.push(item);
        } else if (typeof item === 'object' && item !== null && (item as any).url) {
           // eslint-disable-next-line @typescript-eslint/no-explicit-any
           imageUrls.push((item as any).url);
        }
      }
    }

    return NextResponse.json({
      success: true,
      images: imageUrls,
      count: imageUrls.length
    });

  } catch (error: any) {
    console.error('Error generating images:', error);
    return NextResponse.json(
      { error: 'Failed to generate images', message: error.message },
      { status: 500 }
    );
  }
}

