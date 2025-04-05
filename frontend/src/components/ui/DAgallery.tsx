"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Cookies from "js-cookie";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { UploadCloud, Camera, Video, Trash2, Loader2, ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, Pause, Play, Info } from "lucide-react";
import Image from "next/image";
import { API_BASE_URL } from "@/config/api"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import ModalPortal from "./modalPortal";

// Interface para representar os arquivos de mídia
interface MediaFile {
  id: string;
  aws_url: string;
  category: string;
  filename: string;
  type: "image" | "video";
}

export default function Gallery() {
  const [imageFiles, setImageFiles] = useState<MediaFile[]>([]);
  const [videoFiles, setVideoFiles] = useState<MediaFile[]>([]);
  const [preview, setPreview] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<"image" | "video" | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploadType, setUploadType] = useState<"image" | "video" | null>(null);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const focusedIndexRef = useRef(focusedIndex);
  const [zoom, setZoom] = useState(1); // Zoom inicial
  const [isPaused, setIsPaused] = useState(false); // Controle do autoplay
  const searchParams = useSearchParams();
  const actionId = searchParams.get("action_id");

  useEffect(() => {
    setZoom(1); // reseta o zoom sempre que a imagem muda
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
    focusedIndexRef.current = focusedIndex;
  }, [focusedIndex]);

  useEffect(() => {
    if (expandedImage === null || imageFiles.length < 2 || isPaused) return;
  
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        const nextProgress = prevProgress + 2;
        if (nextProgress > 100) {
          const nextIndex = (focusedIndexRef.current + 1) % imageFiles.length;
          setFocusedIndex(nextIndex);
          return 0;
        }
        return nextProgress;
      });
    }, 100);
  
    return () => clearInterval(interval);
  }, [expandedImage, imageFiles.length, isPaused]);

  useEffect(() => {
    const authToken = Cookies.get("auth_token");

    if (!actionId || !authToken) {
      console.error("Erro: action_id ou Token não encontrado.");
      return;
    }

    console.log("Buscando imagens e vídeos...");

    // Busca as imagens
    fetch(`${API_BASE_URL}/ongs/actions/${actionId}/files/images`, {
      headers: { Authorization: `Bearer ${authToken}` },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Erro ${res.status}: ${res.statusText}`);
        }
        return res.json();
      })
      .then((data) => {
        if (!Array.isArray(data)) {
          console.log("Erro: Resposta de imagens não é um array.");
          return;
        }
        console.log("Imagens recebidas:", data);
        const typedImages = data.map((item) => ({ ...item, type: "image" as const }));
        setImageFiles(typedImages);
      })
      .catch((error) => {
        console.log("Erro ao buscar imagens:", error);
        setImageFiles([]);
      });

    // Busca os vídeos
    fetch(`${API_BASE_URL}/ongs/actions/${actionId}/files/videos`, {
      headers: { Authorization: `Bearer ${authToken}` },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Erro ${res.status}: ${res.statusText}`);
        }
        return res.json();
      })
      .then((data) => {
        if (!Array.isArray(data)) {
          console.log("Erro: Resposta de vídeos não é um array.");
          return;
        }
        console.log("Vídeos recebidos:", data);
        const typedVideos = data.map((item) => ({ ...item, type: "video" as const }));
        setVideoFiles(typedVideos);
      })
      .catch((error) => {
        console.log("Erro ao buscar vídeos:", error);
        setVideoFiles([]);
      });
  }, [actionId]);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
    type: "image" | "video"
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if file exceeds 10MB (10 * 1024 * 1024 bytes)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("O arquivo excede o limite de 10MB");
      return;
    }

    setUploadType(type);
    setFile(file);
    setPreview(URL.createObjectURL(file));
    setPreviewType(type);
    setIsDialogOpen(true);
  };

  const handleUpload = async () => {
    if (!file || !uploadType) {
      toast.warning("Selecione um arquivo antes de confirmar o upload.");
      return;
    }

    // Additional safety check for file size
    if (file.size > 10 * 1024 * 1024) {
      toast.error("O arquivo excede o limite de 10MB");
      return;
    }

    const authToken = Cookies.get("auth_token");
    if (!actionId || !authToken) {
      toast.error("Erro de autenticação. Faça login novamente.");
      return;
    }

    setIsUploading(true); // Iniciar loading

    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", uploadType);

    try {
      const response = await fetch(`${API_BASE_URL}/ongs/actions/${actionId}/files/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${authToken}` },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Erro ao enviar o arquivo.");
      }

      const uploadedFile = await response.json();
      console.log("Resposta do backend:", uploadedFile);
      toast.success("Upload concluído com sucesso!");

      setIsDialogOpen(false);
      setFile(null);
      setPreview(null);

      const newFile = { ...uploadedFile, type: uploadType };

      if (uploadType === "image") {
        setImageFiles((prev) => [...prev, newFile]);
      } else {
        setVideoFiles((prev) => [...prev, newFile]);
      }
    } catch (error) {
      console.log("Erro no upload:", error);
      toast.error("Falha ao enviar o arquivo. Tente novamente.");
    } finally {
      setIsUploading(false); // Finalizar loading independente do resultado
    }
  };

  const handleExpandImage = (img: string, index: number) => {
    setFocusedIndex(index);
    setExpandedImage(img);
    setProgress(0);
  };

  const handleDeleteFile = async (fileId: string) => {
    const authToken = Cookies.get("auth_token");

    if (!actionId || !authToken) {
      toast.error("Erro de autenticação ou ação não identificada.");
      return;
    }

    // Find the file in our arrays to determine its type
    const imageFile = imageFiles.find(img => img.id === fileId);
    const videoFile = videoFiles.find(vid => vid.id === fileId);
    
    if (!imageFile && !videoFile) {
      toast.error("Arquivo não encontrado.");
      return;
    }

    const isImage = !!imageFile;

    try {
      const response = await fetch(
        `${API_BASE_URL}/ongs/actions/${actionId}/files/${fileId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      if (!response.ok) {
        throw new Error(`Erro ao deletar ${isImage ? "a imagem" : "o vídeo"}.`);
      }

      toast.success(`${isImage ? "Imagem" : "Vídeo"} removido com sucesso!`);

      if (isImage) {
        setImageFiles((prev) => prev.filter((img) => img.id !== fileId));
      } else {
        setVideoFiles((prev) => prev.filter((vid) => vid.id !== fileId));
      }

    } catch (error) {
      console.error(`Erro ao deletar arquivo:`, error);
      toast.error(`Falha ao remover ${isImage ? "a imagem" : "o vídeo"}. Tente novamente.`);
    }
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
        <p className="text-sm text-gray-500 mb-2 flex items-center gap-1 text-center">
          <Info className="w-4 h-4 text-blue-500" />
          Máximo de 10MB por arquivo
        </p>
        <div className="grid grid-cols-3 gap-6 max-lg:grid-cols-2 max-sm:grid-cols-1">
          <label className="border-2 border-dashed border-gray-300 w-full h-64 flex flex-col justify-center items-center cursor-pointer rounded-[16px] hover:shadow-lg transition">
            <UploadCloud className="text-blue-600 mb-2" size={32} />
            <span className="text-lg font-semibold text-gray-600">Carregar Imagem</span>
            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileSelect(e, "image")} />
          </label>
          {imageFiles.map((imgFile, index) => (
            <div key={index} className="relative group">
              <img
                src={imgFile.aws_url}
                alt={`Imagem ${index}`}
                className="w-full h-64 object-cover rounded-[16px] shadow-md cursor-pointer hover:shadow-lg transition"
                onClick={() => handleExpandImage(imgFile.aws_url, index)}
              />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-2xl shadow-lg p-6 w-[380px] flex flex-col items-center bg-white">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-lg font-semibold text-gray-900 text-center">
                      Deseja excluir esta imagem?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-600 text-center mt-2">
                      Esta operação não poderá ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="flex gap-4 mt-4">
                    <AlertDialogCancel className="bg-gray-200 text-gray-800 rounded-full px-6 py-3 hover:bg-gray-300 transition-all w-full sm:w-auto">
                      Cancelar
                    </AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-red-500 text-white rounded-full px-6 py-3 hover:bg-red-600 transition-all w-full sm:w-auto"
                      onClick={() => handleDeleteFile(imgFile.id)}
                    >
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))}
        </div>
        <h2 className="text-xl font-bold mt-12 mb-4 flex items-center gap-2 text-gray-700">
          <Video className="text-blue-600 mr-2" size={28} />
          Vídeos
        </h2>
        <p className="text-sm text-gray-500 mb-2 flex items-center gap-1 text-center">
          <Info className="w-4 h-4 text-blue-500" />
          Máximo de 10MB por arquivo
        </p>
        <div className="grid grid-cols-3 gap-6 max-lg:grid-cols-2 max-sm:grid-cols-1 mb-20">
          <label className="border-2 border-dashed border-gray-300 w-full h-64 flex flex-col justify-center items-center cursor-pointer rounded-[16px] hover:shadow-lg transition">
            <UploadCloud className="text-blue-600 mb-2" size={32} />
            <span className="text-lg font-semibold text-gray-600">Carregar Vídeo</span>
            <input type="file" accept="video/*" className="hidden" onChange={(e) => handleFileSelect(e, "video")} />
          </label>
          {videoFiles.map((vidFile, index) => (
            <div key={index} className="relative group">
              <video
                src={vidFile.aws_url}
                className="w-full h-64 object-cover rounded-[16px] shadow-md hover:shadow-lg transition"
                controls
              />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-2xl shadow-lg p-6 w-[380px] flex flex-col items-center bg-white">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-lg font-semibold text-gray-900 text-center">
                      Deseja excluir este vídeo?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-600 text-center mt-2">
                      Esta operação não poderá ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="flex gap-4 mt-4">
                    <AlertDialogCancel className="bg-gray-200 text-gray-800 rounded-full px-6 py-3 hover:bg-gray-300 transition-all w-full sm:w-auto">
                      Cancelar
                    </AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-red-500 text-white rounded-full px-6 py-3 hover:bg-red-600 transition-all w-full sm:w-auto"
                      onClick={() => handleDeleteFile(vidFile.id)}
                    >
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))}
        </div>
      </div>
      
      {isDialogOpen && (
        <ModalPortal>
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in px-4">
            <div className="relative w-full max-w-2xl bg-white rounded-[24px] shadow-xl border border-gray-200 p-8 sm:p-10 max-h-[90vh] overflow-y-auto font-sans">
              
              {/* Botão de fechar */}
              <button
                onClick={() => setIsDialogOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-3xl"
                aria-label="Fechar modal"
              >
                ×
              </button>

              {/* Título */}
              <h2 className="text-2xl font-semibold text-center text-blue-900 mb-6">
                Pré-visualização do Arquivo
              </h2>

              {/* Conteúdo */}
              <div className="flex flex-col gap-6 items-center">
                {previewType === "image" && preview && (
                  <Image
                    src={preview}
                    alt="Preview da imagem"
                    width={600}
                    height={400}
                    className="rounded-[16px] shadow-md object-contain max-w-full h-auto border border-gray-200"
                  />
                )}

                {previewType === "video" && preview && (
                  <video
                    src={preview}
                    controls
                    autoPlay
                    playsInline
                    className="w-full rounded-[16px] shadow-md border border-gray-200"
                    onLoadedMetadata={(e) => {
                      const video = e.currentTarget;
                      video.muted = false;
                      video.volume = 1;
                    }}
                  />
                )}

                <button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-semibold text-lg py-3 px-8 rounded-[24px] transition disabled:opacity-50"
                >
                  {isUploading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Enviando...
                    </span>
                  ) : (
                    "Confirmar Upload"
                  )}
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* Modal de visualização avançada */}
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
                setFocusedIndex((prev) => (prev - 1 + imageFiles.length) % imageFiles.length);
                setProgress(0);
              }}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              className="hidden sm:flex absolute right-6 top-1/2 -translate-y-1/2 z-30 text-white bg-white/10 hover:bg-white/20 p-3 rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                setFocusedIndex((prev) => (prev + 1) % imageFiles.length);
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
                  setFocusedIndex((prev) => (prev - 1 + imageFiles.length) % imageFiles.length);
                  setProgress(0);
                }}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                className="text-white bg-white/10 hover:bg-white/20 p-3 rounded-full pointer-events-auto"
                onClick={(e) => {
                  e.stopPropagation();
                  setFocusedIndex((prev) => (prev + 1) % imageFiles.length);
                  setProgress(0);
                }}
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Carrossel */}
            <div className="relative z-20 flex items-center justify-center w-full h-full px-4 overflow-hidden">
              {imageFiles.map((img, index) => {
                const total = imageFiles.length;
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
                          src={img.aws_url}
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
