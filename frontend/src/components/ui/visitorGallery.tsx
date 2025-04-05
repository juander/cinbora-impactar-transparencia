"use client"

import React, { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Camera, Video, X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Pause, Play } from "lucide-react";
import { API_BASE_URL } from "@/config/api";
import ModalPortal from "./modalPortal";

interface MediaItem {
  id: string;
  aws_url: string;
  type?: "image" | "video";
}

export default function VisitorGallery() {
  const searchParams = useSearchParams();
  const ongsId = searchParams?.get("ngo_id");
  const [images, setImages] = useState<MediaItem[]>([]);
  const [videos, setVideos] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const [zoom, setZoom] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const focusedIndexRef = useRef(focusedIndex);

  useEffect(() => {
    focusedIndexRef.current = focusedIndex;
  }, [focusedIndex]);

  useEffect(() => {
    setZoom(1); // reset zoom when image changes
  }, [focusedIndex]);

  useEffect(() => {
    if (expandedImage) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [expandedImage]);

  useEffect(() => {
    if (!expandedImage) return;
  
    const handleWheel = (e: WheelEvent) => {
      if (!expandedImage) return;
      e.preventDefault();
      setZoom((prev) => {
        const newZoom = prev + (e.deltaY < 0 ? 0.1 : -0.1);
        return Math.min(Math.max(newZoom, 0.5), 2);
      });
    };
  
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!expandedImage) return;
      if (e.code === "Space") {
        e.preventDefault();
        setIsPaused((prev) => !prev);
      }
    };
  
    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("keydown", handleKeyDown);
  
    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [expandedImage]);

  useEffect(() => {
    if (!expandedImage) return;
  
    let initialZoom = zoom;
  
    const handleGestureStart = (e: any) => {
      e.preventDefault();
      initialZoom = zoom;
    };
  
    const handleGestureChange = (e: any) => {
      e.preventDefault();
      const newZoom = initialZoom * e.scale;
      setZoom(Math.min(Math.max(newZoom, 0.5), 2));
    };
  
    window.addEventListener("gesturestart", handleGestureStart);
    window.addEventListener("gesturechange", handleGestureChange);
  
    return () => {
      window.removeEventListener("gesturestart", handleGestureStart);
      window.removeEventListener("gesturechange", handleGestureChange);
    };
  }, [expandedImage, zoom]);

  useEffect(() => {
    if (expandedImage === null || images.length < 2 || isPaused) return;
  
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        const nextProgress = prevProgress + 2;
        if (nextProgress > 100) {
          const nextIndex = (focusedIndexRef.current + 1) % images.length;
          setFocusedIndex(nextIndex);
          return 0;
        }
        return nextProgress;
      });
    }, 100);
  
    return () => clearInterval(interval);
  }, [expandedImage, images.length, isPaused]);

  useEffect(() => {
    if (!ongsId) return;
    
    const fetchImages = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/ongs/${ongsId}/files/images`);
        const data = await res.json();
        setImages(data.map((item: any) => ({ ...item, type: "image" })));
      } catch (error) {
        console.error("Error fetching images:", error);
        setImages([]);
      }
    };
    
    const fetchVideos = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/ongs/${ongsId}/files/videos`);
        const data = await res.json();
        const videosArr = Array.isArray(data) ? data : [];
        setVideos(videosArr.map((item: any) => ({ ...item, type: "video" })));
      } catch (error) {
        console.error("Error fetching videos:", error);
        setVideos([]);
      }
    };
    
    (async () => {
      await Promise.all([fetchImages(), fetchVideos()]);
      setIsLoading(false);
    })();
  }, [ongsId]);

  const handleExpandImage = (img: string, index: number) => {
    setFocusedIndex(index);
    setExpandedImage(img);
    setProgress(0);
  };

  return (
    <div className="flex flex-col items-center w-11/12 max-w-6xl m-auto">
      <h2 className="text-3xl font-bold mb-6 mt-10 w-full text-center">Galeria de Fotos e Vídeos</h2>
      <div className="w-full border-b border-gray-300 mb-8"></div>

      <div className="flex flex-col w-full">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-700">
          <Camera className="text-blue-600 mr-2" size={28} />
          Imagens
        </h2>

        <div className="grid grid-cols-3 gap-6 max-lg:grid-cols-2 max-sm:grid-cols-1">
          {isLoading ? (
            <div className="col-span-3 py-8 text-center">Carregando imagens...</div>
          ) : images.length > 0 ? (
            images.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={encodeURI(image.aws_url)}
                  alt={`Imagem ${index}`}
                  className="w-full h-64 object-cover rounded-[16px] shadow-md cursor-pointer hover:shadow-lg transition"
                  onClick={() => handleExpandImage(image.aws_url, index)}
                />
              </div>
            ))
          ) : (
            <p className="text-gray-500">Nenhuma imagem disponível</p>
          )}
        </div>

        <h2 className="text-xl font-bold mt-12 mb-4 flex items-center gap-2 text-gray-700">
          <Video className="text-blue-600 mr-2" size={28} />
          Vídeos
        </h2>

        <div className="grid grid-cols-3 gap-6 max-lg:grid-cols-2 max-sm:grid-cols-1 mb-20">
          {isLoading ? (
            <div className="col-span-3 py-8 text-center">Carregando vídeos...</div>
          ) : videos.length > 0 ? (
            videos.map((video, index) => (
              <div key={index} className="relative group">
                <video
                  src={video.aws_url}
                  className="w-full h-64 object-cover rounded-[16px] shadow-md hover:shadow-lg transition"
                  controls
                />
              </div>
            ))
          ) : (
            <p className="text-gray-500 mb-8">Nenhum vídeo disponível</p>
          )}
        </div>
      </div>

      {/* Modal de Imagens Expandidas */}
      {expandedImage && (
        <ModalPortal>
          <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/95">
            {/* Fundo clicável para fechar */}
            <div className="absolute inset-0 z-10" onClick={() => setExpandedImage(null)} />

            {/* Botão de fechar */}
            <button
              className="absolute top-4 right-4 z-30 text-white bg-white/10 hover:bg-white/20 p-2 rounded-full"
              onClick={() => setExpandedImage(null)}
            >
              <X className="w-5 h-5" />
            </button>

            <div className="absolute top-4 left-4 z-50 flex flex-wrap gap-2 sm:gap-3 sm:flex-row flex-col sm:flex-nowrap">
              <button
                className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  setZoom((prev) => Math.min(prev + 0.1, 2));
                }}
              >
                <ZoomIn className="w-5 h-5" />
              </button>
              <button
                className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  setZoom((prev) => Math.max(prev - 0.1, 0.5));
                }}
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              <button
                className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPaused((prev) => !prev);
                }}
              >
                {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
              </button>
            </div>

            <button
              className="hidden sm:flex absolute left-6 top-1/2 -translate-y-1/2 z-30 text-white bg-white/10 hover:bg-white/20 p-3 rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                setFocusedIndex((prev) => (prev - 1 + images.length) % images.length);
                setProgress(0);
              }}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              className="hidden sm:flex absolute right-6 top-1/2 -translate-y-1/2 z-30 text-white bg-white/10 hover:bg-white/20 p-3 rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                setFocusedIndex((prev) => (prev + 1) % images.length);
                setProgress(0);
              }}
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            <div className="flex sm:hidden fixed bottom-36 left-0 right-0 justify-center gap-10 z-50 pointer-events-none">
              <button
                className="text-white bg-white/10 hover:bg-white/20 p-3 rounded-full pointer-events-auto"
                onClick={(e) => {
                  e.stopPropagation();
                  setFocusedIndex((prev) => (prev - 1 + images.length) % images.length);
                  setProgress(0);
                }}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                className="text-white bg-white/10 hover:bg-white/20 p-3 rounded-full pointer-events-auto"
                onClick={(e) => {
                  e.stopPropagation();
                  setFocusedIndex((prev) => (prev + 1) % images.length);
                  setProgress(0);
                }}
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Carrossel */}
            <div className="relative z-20 flex items-center justify-center w-full h-full px-4 overflow-hidden">
              {images.map((img, index) => {
                const total = images.length;
                const isCenter = index === focusedIndex;

                let distance = index - focusedIndex;
                if (distance > total / 2) distance -= total;
                if (distance < -total / 2) distance += total;

                if (distance < -1 || distance > 1) return null;

                const translateX = distance * 320;
                const scale = distance === 0 ? 1.2 : 0.85;
                const zIndex = 100 - Math.abs(distance);
                const opacity = distance === 0 ? 1 : 0.7;

                return (
                  <div
                    key={img.id}
                    onClick={() => {
                      setFocusedIndex(index);
                      setProgress(0);
                    }}
                    className="absolute transition-all duration-700 ease-in-out cursor-pointer flex flex-col items-center"
                    style={{
                      transform: `translateX(${translateX}px) scale(${scale})`,
                      opacity,
                      zIndex,
                    }}
                  >
                    <div className="relative w-[90vw] sm:px-0 px-8 max-w-[420px] h-auto max-h-[85vh] flex items-center justify-center mx-auto">
                      <div className="relative w-full h-full flex items-center justify-center">
                        {isCenter && (
                          <div className="absolute z-0 w-full h-full flex items-center justify-center">
                            <div
                              className="absolute z-0 transition-transform duration-300"
                              style={{
                                borderRadius: '24px',
                                background: `conic-gradient(from -90deg, #1f51ff ${progress}%, transparent ${progress}%)`,
                                transform: isCenter ? `scale(${zoom})` : "scale(1)",
                                zIndex: 1,
                              }}
                            />
                          </div>
                        )}
                        <img
                          src={encodeURI(img.aws_url)}
                          className="relative z-10 w-auto max-w-full max-h-[80vh] object-contain rounded-[20px] transition-transform duration-300"
                          style={{
                            transform: isCenter ? `scale(${zoom})` : "scale(1)",
                          }}
                          alt={`Imagem ${index}`}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
}
