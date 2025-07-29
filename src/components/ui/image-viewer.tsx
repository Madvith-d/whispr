import { useState } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ImageViewerProps {
  src: string;
  alt: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ImageViewer = ({ src, alt, open, onOpenChange }: ImageViewerProps) => {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleReset = () => {
    setScale(1);
    setRotation(0);
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset transformations when closing
    setTimeout(() => {
      setScale(1);
      setRotation(0);
    }, 150);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-0">
        {/* Controls */}
        <div className="absolute top-4 right-4 z-50 flex items-center space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleZoomOut}
            disabled={scale <= 0.5}
            className="bg-black/50 hover:bg-black/70 text-white border-0"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          
          <Button
            variant="secondary"
            size="sm"
            onClick={handleZoomIn}
            disabled={scale >= 3}
            className="bg-black/50 hover:bg-black/70 text-white border-0"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRotate}
            className="bg-black/50 hover:bg-black/70 text-white border-0"
          >
            <RotateCw className="h-4 w-4" />
          </Button>
          
          <Button
            variant="secondary"
            size="sm"
            onClick={handleReset}
            className="bg-black/50 hover:bg-black/70 text-white border-0"
          >
            Reset
          </Button>
          
          <Button
            variant="secondary"
            size="sm"
            onClick={handleClose}
            className="bg-black/50 hover:bg-black/70 text-white border-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Image */}
        <div className="flex items-center justify-center w-full h-full p-4 overflow-hidden">
          <img
            src={src}
            alt={alt}
            className="max-w-full max-h-full object-contain transition-transform duration-200 cursor-grab active:cursor-grabbing"
            style={{
              transform: `scale(${scale}) rotate(${rotation}deg)`,
            }}
            draggable={false}
          />
        </div>

        {/* Scale indicator */}
        <div className="absolute bottom-4 left-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
          {Math.round(scale * 100)}%
        </div>
      </DialogContent>
    </Dialog>
  );
};
