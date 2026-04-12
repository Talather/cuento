
import React, { useState, useEffect, useRef } from "react";
import { AdSlot } from "./AdSlot";
import { getStoryMiddleImages } from "@/utils/config";

interface StoryContentBodyProps {
  body: string;
  middleImages: string[];
  finalImageUrl: string | null;
  isUppercase?: boolean;
  status?: string;
  cuentito_uid?: number;
  featuredImageUrl?: string;
  middle_images?: string[] | null;
  isPaidUser?: boolean;
  onUpgradeClick?: () => void;
  currentHighlightedWord?: number;
}

export function StoryContentBody({
  body,
  middleImages,
  finalImageUrl,
  isUppercase = false,
  status,
  cuentito_uid,
  featuredImageUrl,
  middle_images,
  isPaidUser = false,
  onUpgradeClick,
  currentHighlightedWord = -1
}: StoryContentBodyProps) {
  const paragraphs = body
    .split(/\n+/)
    .filter(p => p.trim() !== '');

  const paragraphsRef = useRef<(HTMLParagraphElement | null)[]>([]);

  useEffect(() => {
    if (currentHighlightedWord >= 0 && currentHighlightedWord < paragraphs.length) {
      const paragraphElement = paragraphsRef.current[currentHighlightedWord];
      
      if (paragraphElement) {
        paragraphElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center'
        });
      }
    }
  }, [currentHighlightedWord, paragraphs.length]);

  let allImages: string[] = [];
  if (middle_images) {
    if (typeof middle_images === 'string') {
      try {
        const parsedImages = JSON.parse(middle_images);
        allImages = Array.isArray(parsedImages) ? parsedImages : [];
      } catch (error) {
        allImages = [];
      }
    } else if (Array.isArray(middle_images)) {
      allImages = middle_images;
    }
  } else if (middleImages && middleImages.length > 0) {
    allImages = middleImages.filter(img => img !== featuredImageUrl);
  } else if (cuentito_uid) {
    allImages = getStoryMiddleImages({ cuentito_uid });
  }

  if (finalImageUrl) {
    const finalImages = finalImageUrl.split(',').filter(Boolean);
    allImages = [...allImages, ...finalImages];
  }

  const spacing = Math.max(1, Math.floor(paragraphs.length / (allImages.length || 1)));
  const textStyle = isUppercase ? { textTransform: 'uppercase' as const } : undefined;

  if (status === 'flagged') {
    return (
      <div className="text-center text-muted-foreground py-8">
        Story content is hidden while under review.
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      {paragraphs.map((paragraph, index) => (
        <React.Fragment key={index}>
          <p 
            ref={el => paragraphsRef.current[index] = el}
            className={`leading-relaxed text-lg text-gray-800 ${currentHighlightedWord === index ? 'bg-yellow-100 rounded p-2' : ''}`}
            style={textStyle}
          >
            {paragraph}
          </p>
          
          {/* In-story ad after every 3rd paragraph */}
          {(index === 2 || index === 5 || index === 8) && !isPaidUser && (
            <AdSlot format="fluid" className="my-6" />
          )}

          {allImages.length > 0 && (index + 1) % spacing === 0 && index < (spacing * allImages.length) && (
            <div className="my-8">
              <img
                src={allImages[Math.floor(index / spacing)]}
                alt={`Story illustration ${Math.floor(index / spacing) + 1}`}
                className="w-full h-auto rounded-lg shadow-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              
              {!isPaidUser && (
                <div className="mt-2 text-center p-2 bg-gray-100 rounded-md text-sm">
                  Si quieres imágenes de mayor calidad e impacto, {' '}
                  <button 
                    onClick={onUpgradeClick}
                    className="text-primary font-medium hover:underline focus:outline-none"
                  >
                    sube de nivel
                  </button>
                </div>
              )}
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
