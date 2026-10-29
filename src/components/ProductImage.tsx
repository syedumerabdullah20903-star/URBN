import React, { useState } from 'react';
import { HERO_IMAGE } from '../data/products';

interface ProductImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

export const ProductImage: React.FC<ProductImageProps> = ({
  src,
  alt = 'Product Image',
  className = '',
  fallbackSrc = HERO_IMAGE || '/images/hero.jpg',
  ...props
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const currentSrc = hasError || !src ? fallbackSrc : src;

  return (
    <div className="relative w-full h-full overflow-hidden bg-neutral-100 flex items-center justify-center">
      {/* Loading placeholder skeleton */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-neutral-200/60 animate-pulse" />
      )}

      <img
        src={currentSrc}
        alt={alt}
        referrerPolicy="no-referrer"
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          if (!hasError) {
            setHasError(true);
          }
        }}
        className={`${className} transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        {...props}
      />
    </div>
  );
};
