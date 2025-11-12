"use client";

import { useState, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export interface LightboxImage {
  src: string;
  alt?: string;
  title?: string;
}

interface LightboxProps {
  images: LightboxImage[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

export function Lightbox({ images, initialIndex, isOpen, onClose }: LightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isLoading, setIsLoading] = useState(true);

  // Reset index when lightbox opens with new initial index
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setIsLoading(true);
    }
  }, [isOpen, initialIndex]);

  const goToNext = useCallback(() => {
    setCurrentIndex(prevIndex => {
      if (prevIndex < images.length - 1) {
        setIsLoading(true);
        return prevIndex + 1;
      }
      return prevIndex;
    });
  }, [images.length]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex(prevIndex => {
      if (prevIndex > 0) {
        setIsLoading(true);
        return prevIndex - 1;
      }
      return prevIndex;
    });
  }, []);

  const goToImage = useCallback((index: number) => {
    if (index >= 0 && index < images.length) {
      setCurrentIndex(index);
      setIsLoading(true);
    }
  }, [images.length]);

  // Keyboard navigation
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isOpen) return;

    switch (event.key) {
      case 'Escape':
        onClose();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        goToPrevious();
        break;
      case 'ArrowRight':
        event.preventDefault();
        goToNext();
        break;
    }
  }, [isOpen, onClose, goToPrevious, goToNext]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex];

  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Image lightbox"
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex justify-between items-center p-4">
        <div className="text-white">
          {currentImage.title && (
            <h2 className="text-lg font-medium truncate max-w-md">
              {currentImage.title}
            </h2>
          )}
          <p className="text-sm text-gray-300 dark:text-gray-400">
            {currentIndex + 1} of {images.length}
          </p>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-white hover:bg-white/20 p-2"
          aria-label="Close lightbox"
        >
          <X className="h-6 w-6" />
        </Button>
      </div>

      {/* Main image area */}
      <div 
        className="absolute inset-0 flex items-center justify-center"
        style={{ 
          top: '80px',           // Header height
          bottom: images.length > 1 ? '120px' : '20px',  // Gallery height if present
          left: '20px', 
          right: '20px' 
        }}
      >
        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={goToPrevious}
              disabled={currentIndex === 0}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20 p-3 disabled:opacity-30 disabled:cursor-not-allowed z-10"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={goToNext}
              disabled={currentIndex === images.length - 1}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20 p-3 disabled:opacity-30 disabled:cursor-not-allowed z-10"
              aria-label="Next image"
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
          </>
        )}

        {/* Loading spinner */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        )}

        {/* Main image */}
        <Image
          src={currentImage.src}
          alt={currentImage.alt || currentImage.title || `Image ${currentIndex + 1}`}
          width={1200}
          height={800}
          className={`max-w-full max-h-full object-contain transition-opacity duration-200 select-none ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          onLoad={handleImageLoad}
          onClick={(e) => e.stopPropagation()}
          style={{
            maxWidth: 'calc(100% - 120px)', // Account for navigation arrows
            maxHeight: '100%'
          }}
          unoptimized
        />
      </div>

      {/* Gallery thumbnails at bottom */}
      {images.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 z-10 bg-black bg-opacity-75 p-4">
          <div className="flex justify-center">
            <div className="flex space-x-2 overflow-x-auto max-w-full px-4">
              <div className="flex space-x-2 min-w-max">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => goToImage(index)}
                    className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                      index === currentIndex
                        ? 'border-white shadow-lg scale-110'
                        : 'border-gray-500 dark:border-gray-400 hover:border-gray-300 dark:hover:border-gray-300 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={image.src}
                      alt={image.alt || `Thumbnail ${index + 1}`}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                    {index === currentIndex && (
                      <div className="absolute inset-0 bg-white bg-opacity-20" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Hook to manage lightbox state
export function useLightbox() {
  const [images, setImages] = useState<LightboxImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const openLightbox = (lightboxImages: LightboxImage[], index: number = 0) => {
    setImages(lightboxImages);
    setCurrentIndex(index);
    setIsOpen(true);
  };

  const closeLightbox = () => {
    setIsOpen(false);
  };

  return {
    lightboxProps: {
      images,
      initialIndex: currentIndex,
      isOpen,
      onClose: closeLightbox,
    },
    openLightbox,
    closeLightbox,
  };
}
