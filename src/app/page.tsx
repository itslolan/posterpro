'use client';

import { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Loader2, Wand2, Download, X, Zap, Layout, Sparkles } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const generatorRef = useRef<HTMLDivElement>(null);

  const scrollToGenerator = () => {
    generatorRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt) return;

    setLoading(true);
    setError(null);
    setGeneratedImages([]);

    const formData = new FormData();
    formData.append('prompt', prompt);
    if (image) {
      formData.append('image', image);
    }
    // Default params
    formData.append('size', '2K');
    formData.append('width', '2048');
    formData.append('height', '2048');
    formData.append('aspect_ratio', '4:3');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate images');
      }

      if (data.success && data.images) {
        setGeneratedImages(data.images);
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      {/* Navigation / Header */}
      <nav className="sticky top-0 z-50 border-b border-gray-200 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Wand2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">PosterPro</span>
          </div>
          <div className="flex items-center gap-6 text-sm font-medium text-gray-600">
            <button 
              onClick={scrollToGenerator}
              className="hover:text-primary transition-colors"
            >
              Try Now
            </button>
            <a href="#how-it-works" className="hover:text-primary transition-colors hidden md:block">How it works</a>
            <a href="#examples" className="hover:text-primary transition-colors hidden md:block">Examples</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        {/* Light gradient background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-gray-200 text-gray-600 text-sm mb-8 shadow-sm">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>AI-Powered Ad Generation</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 max-w-4xl mx-auto leading-tight text-gray-900">
            Turn Product Photos into <br />
            <span className="text-primary">Stunning Ads</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-12 leading-relaxed">
            Upload your product image, describe your vision, and let our AI generate professional advertising creatives in seconds. No design skills required.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <button 
              onClick={scrollToGenerator}
              className="px-8 py-4 bg-primary text-white text-lg font-bold rounded-xl hover:bg-primary/90 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2 shadow-lg shadow-primary/20"
            >
              <Wand2 className="w-5 h-5" />
              Start Creating Free
            </button>
            <a href="#how-it-works" className="px-8 py-4 bg-white text-gray-900 text-lg font-medium rounded-xl hover:bg-gray-50 transition-all border border-gray-200 shadow-sm">
              See How It Works
            </a>
          </div>
        </div>
      </section>

      {/* Generator Section (Moved Below Hero) */}
      <section ref={generatorRef} id="generate" className="py-12 bg-white border-y border-gray-100 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Try it yourself</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Ready to transform your product images? Start creating now.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Input Section */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-background border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold mb-6 text-gray-900">Configuration</h3>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Image Upload */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-600">
                      Product Image (Optional)
                    </label>
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className={cn(
                        "relative border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer hover:border-primary/50 group",
                        imagePreview ? "border-primary/50 bg-primary/5" : "border-gray-200 hover:bg-gray-50"
                      )}
                    >
                      {/* Move input outside of the styled div to ensure it's clickable, or ensure proper pointer-events */}
                      <input 
                        ref={fileInputRef}
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      
                      {imagePreview ? (
                        <div className="relative w-full aspect-square md:aspect-video lg:aspect-square rounded-lg overflow-hidden shadow-sm">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={imagePreview} 
                            alt="Preview" 
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              clearImage();
                            }}
                            className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-white text-gray-700 rounded-full shadow-sm transition-colors border border-gray-200 z-10"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-gray-400 group-hover:text-primary/80 transition-colors pointer-events-none">
                          <Upload className="w-8 h-8 mb-3" />
                          <p className="text-sm text-center text-gray-600">Click to upload</p>
                          <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Prompt Input */}
                  <div className="space-y-2">
                    <label htmlFor="prompt" className="block text-sm font-medium text-gray-600">
                      Prompt
                    </label>
                    <textarea
                      id="prompt"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Describe your ad... e.g. A cinematic shot of a perfume bottle on a marble table with rose petals"
                      className="w-full h-32 bg-white border border-gray-200 rounded-xl p-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 resize-none transition-all"
                      required
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading || !prompt}
                    className="w-full bg-primary text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/20"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-5 h-5" />
                        Generate Ads
                      </>
                    )}
                  </button>
                  
                  {error && (
                    <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm">
                      {error}
                    </div>
                  )}
                </form>
              </div>
            </div>

            {/* Results Section */}
            <div className="lg:col-span-8">
              {generatedImages.length > 0 ? (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-900">Generated Results</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {generatedImages.map((url, index) => (
                      <div key={index} className="group relative bg-white border border-gray-200 rounded-2xl overflow-hidden aspect-[4/3] shadow-sm hover:shadow-md transition-shadow">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={url}
                          alt={`Generated ad ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-[2px]">
                          <a 
                            href={url} 
            target="_blank"
            rel="noopener noreferrer"
                            className="p-3 bg-white text-gray-900 rounded-full hover:bg-gray-50 transition-colors shadow-lg"
                            title="Open full size"
                          >
                            <ImageIcon className="w-5 h-5" />
          </a>
          <a
                            href={url} 
                            download={`poster-pro-${index}.jpg`}
                            className="p-3 bg-white text-gray-900 rounded-full hover:bg-gray-50 transition-colors shadow-lg"
                            title="Download"
                          >
                            <Download className="w-5 h-5" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl bg-white/50">
                  {loading ? (
                    <div className="text-center space-y-4">
                      <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
                      <p className="text-gray-600">Dreaming up your ad...</p>
                    </div>
                  ) : (
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto">
                        <Layout className="w-8 h-8 text-gray-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-600">No images generated yet</p>
                        <p className="text-sm text-gray-400 mt-1">Fill out the form to start creating</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-24 border-b border-gray-200 bg-background">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">How It Works</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Three simple steps to generate professional ad creatives.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Upload,
                title: "Upload Product",
                description: "Upload a clean image of your product. We support JPG, PNG, and WEBP formats."
              },
              {
                icon: Zap,
                title: "Describe Vision",
                description: "Tell AI what you want. 'On a beach at sunset', 'In a futuristic neon city', etc."
              },
              {
                icon: Download,
                title: "Download Ads",
                description: "Get multiple high-quality variations instantly. Download and use them anywhere."
              }
            ].map((step, i) => (
              <div key={i} className="p-8 rounded-2xl bg-white border border-gray-200 hover:border-primary/30 hover:shadow-lg transition-all relative group">
                <div className="absolute top-8 right-8 text-6xl font-bold text-gray-100 pointer-events-none select-none group-hover:text-primary/5 transition-colors">
                  {i + 1}
                </div>
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <step.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">{step.title}</h3>
                <p className="text-gray-500 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Examples Section */}
      <section id="examples" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Made with PosterPro</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">See what others are creating with our AI ad generator.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Cosmetic Elegance",
                prompt: "Luxury perfume bottle on a marble podium with floating rose petals, cinematic lighting",
                color: "bg-rose-950"
              },
              {
                title: "Tech Minimal",
                prompt: "Modern headphones floating in a dark void with neon blue rim lighting, cyber aesthetic",
                color: "bg-blue-950"
              },
              {
                title: "Fresh Organic",
                prompt: "Organic juice bottle surrounded by fresh fruits and water splashes in sunlight",
                color: "bg-orange-950"
              }
            ].map((example, i) => (
              <div key={i} className="group relative aspect-[4/5] rounded-2xl overflow-hidden border border-gray-200 bg-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className={cn("absolute inset-0 opacity-50", example.color)} />
                <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black via-black/50 to-transparent">
                  <h3 className="text-lg font-bold mb-2 text-white">{example.title}</h3>
                  <p className="text-sm text-gray-200 line-clamp-2 italic">"{example.prompt}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="border-t border-gray-200 py-12 bg-background">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
              <Wand2 className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold text-gray-900">PosterPro</span>
          </div>
          <p className="text-gray-500 text-sm">© 2024 PosterPro. All rights reserved.</p>
        </div>
      </footer>
      </main>
  );
}
