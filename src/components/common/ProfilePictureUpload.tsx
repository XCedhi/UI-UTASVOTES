'use client';

import React, { useState, useCallback, useRef } from 'react';
import Cropper from 'react-easy-crop';
import Icon from '@/components/ui/AppIcon';

interface ProfilePictureUploadProps {
  currentImage?: string;
  onSave: (croppedImage: string) => void;
  userName: string;
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

const ProfilePictureUpload = ({ currentImage, onSave, userName }: ProfilePictureUploadProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: CropArea) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageSrc(reader.result as string);
        setIsOpen(true);
      });
      reader.readAsDataURL(file);
    }
  };

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.src = url;
    });

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: CropArea,
    rotation = 0
  ): Promise<string> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No 2d context');
    }

    const maxSize = Math.max(image.width, image.height);
    const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

    canvas.width = safeArea;
    canvas.height = safeArea;

    ctx.translate(safeArea / 2, safeArea / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-safeArea / 2, -safeArea / 2);

    ctx.drawImage(image, safeArea / 2 - image.width * 0.5, safeArea / 2 - image.height * 0.5);

    const data = ctx.getImageData(0, 0, safeArea, safeArea);

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.putImageData(
      data,
      Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
      Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
    );

    return canvas.toDataURL('image/jpeg', 0.9);
  };

  const handleSave = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    setIsProcessing(true);
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels, rotation);
      onSave(croppedImage);
      setIsOpen(false);
      setImageSrc(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
    } catch (error) {
      console.error('Error cropping image:', error);
      alert('Failed to process image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    setImageSrc(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];

      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageSrc(reader.result as string);
        setIsOpen(true);
      });
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      {/* Upload Button */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative group">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-muted border-4 border-border">
            {currentImage ? (
              <img src={currentImage} alt={userName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary/10">
                <Icon name="UserIcon" size={48} variant="outline" className="text-primary" />
              </div>
            )}
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 p-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-all duration-250 ease-smooth"
          >
            <Icon name="CameraIcon" size={20} variant="outline" />
          </button>
        </div>

        <div className="text-center">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
          >
            Change Profile Picture
          </button>
          <p className="text-xs text-muted-foreground mt-1">JPG, PNG or WebP. Max 5MB.</p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Crop Modal */}
      {isOpen && imageSrc && (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-[1300] flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-md w-full max-w-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="text-xl font-heading font-semibold text-foreground">
                Crop Profile Picture
              </h3>
              <button
                onClick={handleCancel}
                className="p-2 hover:bg-muted rounded-md transition-all duration-250 ease-smooth"
              >
                <Icon name="XMarkIcon" size={20} variant="outline" className="text-foreground" />
              </button>
            </div>

            {/* Cropper */}
            <div className="p-6">
              <div className="relative w-full h-96 bg-muted rounded-md overflow-hidden">
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  rotation={rotation}
                  aspect={1}
                  cropShape="round"
                  showGrid={false}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                  onRotationChange={setRotation}
                />
              </div>

              {/* Controls */}
              <div className="mt-6 space-y-4">
                {/* Zoom */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-foreground">Zoom</label>
                    <span className="text-sm text-muted-foreground">{Math.round(zoom * 100)}%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Icon
                      name="MagnifyingGlassMinusIcon"
                      size={20}
                      variant="outline"
                      className="text-muted-foreground"
                    />
                    <input
                      type="range"
                      min={1}
                      max={3}
                      step={0.1}
                      value={zoom}
                      onChange={(e) => setZoom(Number(e.target.value))}
                      className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                    />
                    <Icon
                      name="MagnifyingGlassPlusIcon"
                      size={20}
                      variant="outline"
                      className="text-muted-foreground"
                    />
                  </div>
                </div>

                {/* Rotation */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-foreground">Rotation</label>
                    <span className="text-sm text-muted-foreground">{rotation}°</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Icon
                      name="ArrowPathIcon"
                      size={20}
                      variant="outline"
                      className="text-muted-foreground"
                    />
                    <input
                      type="range"
                      min={0}
                      max={360}
                      step={1}
                      value={rotation}
                      onChange={(e) => setRotation(Number(e.target.value))}
                      className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-sm text-muted-foreground">360°</span>
                  </div>
                </div>
              </div>

              {/* Drag & Drop Area */}
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="mt-6 p-4 border-2 border-dashed border-border rounded-md text-center"
              >
                <Icon
                  name="ArrowUpTrayIcon"
                  size={24}
                  variant="outline"
                  className="mx-auto text-muted-foreground mb-2"
                />
                <p className="text-sm text-muted-foreground">
                  Drag & drop a new image here, or{' '}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-primary hover:text-primary/80 font-medium"
                  >
                    browse
                  </button>
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
              <button
                onClick={handleCancel}
                disabled={isProcessing}
                className="px-6 py-2 bg-muted text-foreground rounded-md hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-250 ease-smooth"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isProcessing}
                className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-250 ease-smooth"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Icon name="CheckIcon" size={16} variant="outline" />
                    <span>Save Picture</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfilePictureUpload;
