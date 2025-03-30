"use client"

import React, { useEffect, useState } from 'react';
import { useSearchParams } from "next/navigation";
import { Camera, Video } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { API_BASE_URL } from "@/config/api"

interface MediaItem {
	id: string;
	aws_url: string;
}

export default function VisitorGallery() {
	const searchParams = useSearchParams();
	const actionId = searchParams?.get("action_id");
	const [images, setImages] = useState<MediaItem[]>([]);
	const [videos, setVideos] = useState<MediaItem[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [expandedImage, setExpandedImage] = useState<string | null>(null);

	useEffect(() => {
		if (!actionId) return;
		const fetchImages = async () => {
			try {
				const res = await fetch(`${API_BASE_URL}/ongs/actions/${actionId}/files/images`);
				const data = await res.json();
				setImages(data);
			} catch (error) {
				console.error("Error fetching images:", error);
			}
		};
		const fetchVideos = async () => {
			try {
				const res = await fetch(`${API_BASE_URL}/ongs/actions/${actionId}/files/videos`);
				const data = await res.json();
				
				const videosArr = data.data ? data.data : (Array.isArray(data) ? data : [data]);
				setVideos(videosArr);
			} catch (error) {
				console.error("Error fetching videos:", error);
			}
		};
		(async () => {
			await Promise.all([fetchImages(), fetchVideos()]);
			setIsLoading(false);
		})();
	}, [actionId]);

	const handleImageClick = (image: MediaItem) => {
		setExpandedImage(image.aws_url);
	};

	return (
		<div className="flex flex-col items-center w-11/12 max-w-6xl m-auto">
            <h2 className="text-3xl font-bold mb-6 mt-10 w-full text-center">Galeria de Fotos e Vídeos</h2>
            <div className="w-full border-b border-gray-300 mb-8"></div>
            
            <div className="flex flex-col w-full">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-700">
                    <Camera className="text-blue-600 mr-2" size={28}/>
                    <span>Imagens</span>
                </h2>

                <div className="grid grid-cols-3 gap-6 max-lg:grid-cols-2 max-sm:grid-cols-1">
                    {!isLoading && (images.length > 0 ? (
                        images.map(image => (
                            <img 
                                key={image.id}
                                className="w-full h-64 object-cover rounded-[16px] shadow-md cursor-pointer hover:shadow-lg transition"  
                                src={encodeURI(image.aws_url)} 
                                alt={`Image ${image.id}`}
                                onClick={() => handleImageClick(image)}
                            />
                        ))
                    ) : (
                        <p className="text-gray-500">Nenhuma imagem disponível</p>
                    ))}
                </div>

                <h2 className="text-xl font-bold mt-12 mb-4 flex items-center gap-2 text-gray-700">
                    <Video className="text-blue-600 mr-2" size={28}/>
                    <span>Vídeos</span>
                </h2>
                
                <div className="grid grid-cols-3 gap-6 max-lg:grid-cols-2 max-sm:grid-cols-1 mb-20">
                    {!isLoading && (videos.length > 0 ? (
                        videos.map(video => (
                            <video 
                                key={video.id}
                                className="w-full h-64 object-cover rounded-[16px] shadow-md hover:shadow-lg transition"
                                src={video.aws_url} 
                                controls
                            >
                                Your browser does not support the video tag.
                            </video>
                        ))
                    ) : (
                        <p className="text-gray-500">Nenhum vídeo disponível</p>
                    ))}
                </div>
            </div>

			<Dialog open={expandedImage !== null} onOpenChange={() => setExpandedImage(null)}>
				<DialogContent className="bg-white rounded-[16px] shadow-xl p-6">
					{expandedImage && (
						<img 
							src={encodeURI(expandedImage)} 
							alt="Imagem Expandida" 
							className="w-full h-auto rounded-[16px]" 
						/>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}
