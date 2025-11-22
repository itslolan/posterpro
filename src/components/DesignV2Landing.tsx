'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload, Loader2, ArrowRight, Download, X, Image as ImageIcon, Sparkles, Zap, Layout, Wand2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Star/Space Animation Component
const SpaceBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let stars: { x: number; y: number; size: number; speed: number; opacity: number }[] = [];
    let width = window.innerWidth;
    let height = window.innerHeight;

    const initStars = () => {
      stars = [];
      const numStars = Math.floor((width * height) / 3000);
      for (let i = 0; i < numStars; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 1.5 + 0.5,
          speed: Math.random() * 0.2 + 0.05,
          opacity: Math.random() * 0.8 + 0.2,
        });
      }
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      initStars();
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Draw Stars
      ctx.fillStyle = '#fff';
      stars.forEach((star) => {
        ctx.globalAlpha = star.opacity;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();

        // Move stars
        star.y -= star.speed;
        if (star.y < 0) {
          star.y = height;
          star.x = Math.random() * width;
        }
      });
      
      // Draw subtle nebula/glow effects
      const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width);
      gradient.addColorStop(0, 'rgba(225, 101, 64, 0.03)'); // Primary color hint
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.globalAlpha = 1;
      ctx.fillRect(0, 0, width, height);

      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    resize();
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ background: 'linear-gradient(to bottom, #0a0a0a, #111111)' }}
    />
  );
};

export function DesignV2Landing() {
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
    // Also focus input if available
    const textarea = document.querySelector('textarea');
    if (textarea) textarea.focus();
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
    <div className="min-h-screen bg-[#0a0a0a] text-[#E8E8E6] font-sans selection:bg-[#E16540]/30 overflow-x-hidden">
      <SpaceBackground />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 p-6 flex justify-between items-center z-50 bg-gradient-to-b from-[#0a0a0a] to-transparent">
        <div className="flex items-center gap-2 opacity-90 hover:opacity-100 transition-opacity cursor-pointer">
          <div className="w-8 h-8 bg-white/10 backdrop-blur-md rounded-lg flex items-center justify-center border border-white/5">
             <Sparkles className="w-4 h-4 text-[#E16540]" />
          </div>
          <span className="font-medium tracking-wide text-lg">Adphex</span>
        </div>
        <div className="flex gap-6 text-sm font-medium text-[#888]">
          <button onClick={scrollToGenerator} className="hover:text-[#E8E8E6] transition-colors hidden md:block">Try Now</button>
          <a href="#how-it-works" className="hover:text-[#E8E8E6] transition-colors hidden md:block">How it works</a>
          <a href="#examples" className="hover:text-[#E8E8E6] transition-colors hidden md:block">Examples</a>
        </div>
      </header>

      <main className="relative z-10 flex flex-col min-h-screen">
        
        {/* Hero / Generator Section */}
        <section ref={generatorRef} className="flex-grow flex flex-col items-center justify-center px-4 py-32 min-h-[90vh]">
          <div className={cn(
            "w-full max-w-3xl transition-all duration-700 ease-in-out flex flex-col gap-8",
            generatedImages.length > 0 || loading ? "mt-0" : "mt-0"
          )}>
            
            {/* Headline */}
            {!loading && generatedImages.length === 0 && (
              <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#888] text-xs mb-4 backdrop-blur-md">
                  <Sparkles className="w-3 h-3 text-[#E16540]" />
                  <span>AI-Powered Ad Generation</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-light tracking-tight text-white leading-tight">
                  Turn Product Photos into <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E16540] to-[#FF8E53]">Stunning Ads</span>
                </h1>
                <p className="text-[#888] text-lg max-w-xl mx-auto leading-relaxed">
                  Upload your product image, describe your vision, and let our AI generate professional advertising creatives in seconds.
                </p>
              </div>
            )}

            {/* Input Container */}
            <div className="w-full bg-[#1a1a1a]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl shadow-black/50 transition-all hover:border-white/20 focus-within:border-white/30 focus-within:bg-[#202020]/90 group">
              <form onSubmit={handleSubmit} className="flex flex-col">
                <div className="relative">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
                    placeholder="Describe your ad vision... (e.g., Perfume bottle on a marble table with rose petals)"
                    className="w-full bg-transparent border-none text-[#E8E8E6] text-lg p-6 placeholder:text-[#555] focus:ring-0 resize-none min-h-[80px] max-h-[300px] overflow-y-auto"
                    rows={1}
                    style={{ height: 'auto', minHeight: '80px' }}
                  />
                  
                  {/* Image Upload Preview inside Input */}
                  {imagePreview && (
                    <div className="px-6 pb-6 animate-in fade-in zoom-in duration-300">
                      <div className="relative inline-block group/preview">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="h-24 w-24 object-cover rounded-xl border border-white/10 shadow-lg"
                        />
                        <button
                          type="button"
                          onClick={clearImage}
                          className="absolute -top-2 -right-2 bg-[#333] text-[#888] hover:text-white rounded-full p-1.5 border border-[#444] shadow-md opacity-0 group-hover/preview:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center px-6 pb-4 pt-2 border-t border-white/5">
                  <div className="flex items-center gap-2">
                     <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 text-xs font-medium text-[#888] hover:text-[#E8E8E6] transition-colors px-4 py-2 rounded-full hover:bg-white/5 border border-transparent hover:border-white/5"
                     >
                      <Upload className="w-4 h-4" />
                      <span>Upload Image</span>
                     </button>
                     <input 
                      ref={fileInputRef}
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={!prompt || loading}
                    className={cn(
                      "bg-[#E8E8E6] text-[#0a0a0a] rounded-full p-3 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]",
                      !prompt && "opacity-50 cursor-not-allowed shadow-none"
                    )}
                  >
                     {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                  </button>
                </div>
              </form>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-12 space-y-6 text-[#888] animate-in fade-in duration-500">
                <div className="relative">
                  <div className="absolute inset-0 bg-[#E16540] blur-xl opacity-20 animate-pulse"></div>
                  <Loader2 className="w-12 h-12 animate-spin text-[#E16540] relative z-10" />
                </div>
                <p className="text-sm tracking-widest uppercase opacity-70">Generating your vision...</p>
              </div>
            )}

            {/* Results Grid */}
            {generatedImages.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
                {generatedImages.map((url, index) => (
                  <div key={index} className="group relative bg-[#1a1a1a] rounded-2xl overflow-hidden aspect-[4/3] border border-white/10 shadow-2xl hover:border-white/20 transition-all duration-500">
                    <img
                      src={url}
                      alt={`Generated ad ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
                       <a 
                        href={url} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-4 bg-white/10 backdrop-blur-md text-white rounded-full hover:bg-white/20 transition-all hover:scale-110"
                        title="View"
                      >
                        <ImageIcon className="w-5 h-5" />
                      </a>
                      <a
                        href={url} 
                        download={`adphex-${index}.jpg`}
                        className="p-4 bg-white text-black rounded-full hover:bg-gray-200 transition-all hover:scale-110"
                        title="Download"
                      >
                        <Download className="w-5 h-5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}

             {/* Footer info / Stats */}
             {!loading && generatedImages.length === 0 && (
               <div className="flex justify-center gap-8 md:gap-12 mt-8 text-[#444] text-xs md:text-sm animate-in fade-in delay-300 duration-1000">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#E16540] rounded-full shadow-[0_0_10px_#E16540]"></div>
                    <span>Fast Generation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#E16540] rounded-full shadow-[0_0_10px_#E16540]"></div>
                    <span>Pro Quality</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <div className="w-1.5 h-1.5 bg-[#E16540] rounded-full shadow-[0_0_10px_#E16540]"></div>
                     <span>AI Powered</span>
                  </div>
               </div>
             )}
          </div>
        </section>

        {/* How It Works Section (Dark Mode) */}
        <section id="how-it-works" className="py-32 relative border-t border-white/5 bg-black/20 backdrop-blur-sm">
           <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white tracking-tight">How It Works</h2>
              <p className="text-[#888] max-w-2xl mx-auto text-lg">Three simple steps to generate professional ad creatives.</p>
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
                <div key={i} className="p-10 rounded-3xl bg-white/5 border border-white/5 hover:border-[#E16540]/30 hover:bg-white/[0.07] transition-all duration-500 relative group">
                  <div className="absolute top-8 right-8 text-6xl font-bold text-white/5 pointer-events-none select-none group-hover:text-[#E16540]/10 transition-colors">
                    {i + 1}
                  </div>
                  <div className="w-16 h-16 bg-[#E16540]/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 border border-[#E16540]/20">
                    <step.icon className="w-8 h-8 text-[#E16540]" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-white">{step.title}</h3>
                  <p className="text-[#888] leading-relaxed text-lg">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Examples Section (Dark Mode) */}
        <section id="examples" className="py-32 relative border-t border-white/5">
          <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white tracking-tight">Made with Adphex</h2>
              <p className="text-[#888] max-w-2xl mx-auto text-lg">See what others are creating with our AI ad generator.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: "Cosmetic Elegance",
                  prompt: "Luxury perfume bottle on a marble podium with floating rose petals, cinematic lighting",
                  color: "from-rose-950/50 to-black"
                },
                {
                  title: "Tech Minimal",
                  prompt: "Modern headphones floating in a dark void with neon blue rim lighting, cyber aesthetic",
                  color: "from-blue-950/50 to-black"
                },
                {
                  title: "Fresh Organic",
                  prompt: "Organic juice bottle surrounded by fresh fruits and water splashes in sunlight",
                  color: "from-orange-950/50 to-black"
                }
              ].map((example, i) => (
                <div key={i} className="group relative aspect-[4/5] rounded-3xl overflow-hidden border border-white/10 bg-[#111] shadow-2xl hover:border-white/20 transition-all duration-500 hover:-translate-y-2">
                  <div className={cn("absolute inset-0 bg-gradient-to-b opacity-50", example.color)} />
                  <div className="absolute inset-0 flex flex-col justify-end p-8 bg-gradient-to-t from-black via-black/60 to-transparent opacity-80 group-hover:opacity-100 transition-opacity">
                    <h3 className="text-xl font-bold mb-3 text-white">{example.title}</h3>
                    <p className="text-sm text-[#ccc] line-clamp-3 italic font-light leading-relaxed">"{example.prompt}"</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer (Dark Mode) */}
        <footer className="border-t border-white/5 py-12 bg-[#050505] relative z-10">
          <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#E16540] rounded-lg flex items-center justify-center shadow-[0_0_15px_#E16540]">
                <Wand2 className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white text-lg tracking-tight">Adphex</span>
            </div>
            <p className="text-[#666] text-sm">© 2024 Adphex. All rights reserved.</p>
          </div>
        </footer>

      </main>
    </div>
  );
}