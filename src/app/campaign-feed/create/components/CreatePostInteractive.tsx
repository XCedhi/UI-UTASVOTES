'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/common/Header';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

type PostType = 'text' | 'image' | 'video' | 'gif' | 'link';

interface MediaFile {
  file: File;
  preview: string;
  type: 'image' | 'video' | 'gif';
}

const CreatePostInteractive = () => {
  const router = useRouter();
  const [postType, setPostType] = useState<PostType>('text');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Media editing states
  const [selectedMediaIndex, setSelectedMediaIndex] = useState<number | null>(null);
  const [cropMode, setCropMode] = useState(false);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newMediaFiles: MediaFile[] = [];
    
    Array.from(files).forEach((file) => {
      const preview = URL.createObjectURL(file);
      let type: 'image' | 'video' | 'gif' = 'image';
      
      if (file.type.startsWith('video/')) {
        type = 'video';
      } else if (file.type === 'image/gif') {
        type = 'gif';
      }
      
      newMediaFiles.push({ file, preview, type });
    });

    setMediaFiles([...mediaFiles, ...newMediaFiles]);
    setPostType(newMediaFiles[0].type);
  };

  const removeMedia = (index: number) => {
    const newMediaFiles = mediaFiles.filter((_, i) => i !== index);
    setMediaFiles(newMediaFiles);
    if (newMediaFiles.length === 0) {
      setPostType('text');
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() && !content.trim() && mediaFiles.length === 0 && !linkUrl.trim()) {
      alert('Please add some content to your post');
      return;
    }

    setIsSubmitting(true);

    // Extract hashtags
    const extractedHashtags = hashtags
      .split(' ')
      .filter((tag) => tag.startsWith('#'))
      .map((tag) => tag.trim());

    // Here you would upload media files to storage and create post in database
    // For now, we'll just simulate the process
    
    setTimeout(() => {
      alert('Post created successfully!');
      router.push('/campaign-feed');
    }, 1500);
  };

  const getFilterStyle = (index: number) => {
    if (selectedMediaIndex !== index) return {};
    return {
      filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`,
    };
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        userRole="student"
        userName="John Mensah"
        userAvatar="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop"
        notificationCount={3}
      />

      <main className="pt-24 pb-12 px-4 lg:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-heading font-bold text-3xl text-foreground mb-2">
                Create Post
              </h1>
              <p className="text-muted-foreground">
                Share your thoughts, ideas, and updates with the community
              </p>
            </div>
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-md hover:bg-muted/80 transition-all duration-250"
            >
              <Icon name="XMarkIcon" size={20} variant="outline" />
              Cancel
            </button>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 space-y-6">
            {/* Post Type Selector */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                Post Type
              </label>
              <div className="flex flex-wrap gap-3">
                {[
                  { type: 'text', icon: 'DocumentTextIcon', label: 'Text' },
                  { type: 'image', icon: 'PhotoIcon', label: 'Image' },
                  { type: 'video', icon: 'VideoCameraIcon', label: 'Video' },
                  { type: 'gif', icon: 'GifIcon', label: 'GIF' },
                  { type: 'link', icon: 'LinkIcon', label: 'Link' },
                ].map((item) => (
                  <button
                    key={item.type}
                    onClick={() => setPostType(item.type as PostType)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all duration-250 ${
                      postType === item.type
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground hover:bg-muted/80'
                    }`}
                  >
                    <Icon name={item.icon as any} size={20} variant="outline" />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your post a catchy title..."
                className="w-full px-4 py-3 bg-background border border-border rounded-md text-foreground outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Content
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What&apos;s on your mind? Share your thoughts..."
                rows={6}
                className="w-full px-4 py-3 bg-background border border-border rounded-md text-foreground outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            {/* Media Upload for Images/Videos/GIFs */}
            {(postType === 'image' || postType === 'video' || postType === 'gif') && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Upload {postType === 'image' ? 'Images' : postType === 'video' ? 'Videos' : 'GIFs'}
                </label>
                
                <input
                  ref={postType === 'video' ? videoInputRef : fileInputRef}
                  type="file"
                  accept={
                    postType === 'image'
                      ? 'image/*'
                      : postType === 'video'
                        ? 'video/*'
                        : 'image/gif'
                  }
                  multiple={postType !== 'video'}
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <button
                  onClick={() => {
                    if (postType === 'video') {
                      videoInputRef.current?.click();
                    } else {
                      fileInputRef.current?.click();
                    }
                  }}
                  className="w-full px-4 py-8 border-2 border-dashed border-border rounded-md hover:border-primary transition-all duration-250 flex flex-col items-center gap-3"
                >
                  <Icon
                    name={postType === 'video' ? 'VideoCameraIcon' : 'PhotoIcon'}
                    size={48}
                    variant="outline"
                    className="text-muted-foreground"
                  />
                  <div className="text-center">
                    <p className="text-foreground font-medium">
                      Click to upload {postType}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {postType === 'video'
                        ? 'MP4, MOV, AVI up to 100MB'
                        : 'PNG, JPG, GIF up to 10MB each'}
                    </p>
                  </div>
                </button>

                {/* Media Preview Grid */}
                {mediaFiles.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                    {mediaFiles.map((media, index) => (
                      <div
                        key={index}
                        className="relative group rounded-lg overflow-hidden bg-muted"
                      >
                        {media.type === 'video' ? (
                          <video
                            src={media.preview}
                            className="w-full h-48 object-cover"
                            style={getFilterStyle(index)}
                            controls
                          />
                        ) : (
                          <AppImage
                            src={media.preview}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-48 object-cover"
                            style={getFilterStyle(index)}
                          />
                        )}
                        
                        {/* Media Actions */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-250 flex items-center justify-center gap-2">
                          <button
                            onClick={() => setSelectedMediaIndex(index)}
                            className="p-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                          >
                            <Icon name="PencilIcon" size={20} variant="outline" />
                          </button>
                          <button
                            onClick={() => removeMedia(index)}
                            className="p-2 bg-error text-white rounded-md hover:bg-error/90"
                          >
                            <Icon name="TrashIcon" size={20} variant="outline" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Media Editor */}
                {selectedMediaIndex !== null && (
                  <div className="mt-4 p-4 bg-muted rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-foreground">Edit Media</h3>
                      <button
                        onClick={() => {
                          setSelectedMediaIndex(null);
                          setBrightness(100);
                          setContrast(100);
                          setSaturation(100);
                        }}
                        className="text-sm text-muted-foreground hover:text-foreground"
                      >
                        Done
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-foreground flex items-center justify-between mb-1">
                          <span>Brightness</span>
                          <span className="text-muted-foreground">{brightness}%</span>
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="200"
                          value={brightness}
                          onChange={(e) => setBrightness(Number(e.target.value))}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label className="text-sm text-foreground flex items-center justify-between mb-1">
                          <span>Contrast</span>
                          <span className="text-muted-foreground">{contrast}%</span>
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="200"
                          value={contrast}
                          onChange={(e) => setContrast(Number(e.target.value))}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label className="text-sm text-foreground flex items-center justify-between mb-1">
                          <span>Saturation</span>
                          <span className="text-muted-foreground">{saturation}%</span>
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="200"
                          value={saturation}
                          onChange={(e) => setSaturation(Number(e.target.value))}
                          className="w-full"
                        />
                      </div>

                      <button
                        onClick={() => {
                          setBrightness(100);
                          setContrast(100);
                          setSaturation(100);
                        }}
                        className="w-full px-4 py-2 bg-background text-foreground rounded-md hover:bg-background/80 transition-all duration-250"
                      >
                        Reset Filters
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Link URL */}
            {postType === 'link' && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Link URL
                </label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-4 py-3 bg-background border border-border rounded-md text-foreground outline-none focus:ring-2 focus:ring-primary"
                />
                {linkUrl && (
                  <div className="mt-3 p-4 bg-muted rounded-md">
                    <p className="text-sm text-muted-foreground mb-1">Link Preview</p>
                    <a
                      href={linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline break-all"
                    >
                      {linkUrl}
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Hashtags */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Hashtags
              </label>
              <input
                type="text"
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                placeholder="#ComputerScience #UTAS #StudentLife"
                className="w-full px-4 py-3 bg-background border border-border rounded-md text-foreground outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Separate hashtags with spaces. Use hashtags to categorize your post.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-4">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-all duration-250 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Publishing...' : 'Publish Post'}
              </button>
              <button
                onClick={() => router.back()}
                className="px-6 py-3 bg-muted text-foreground rounded-md hover:bg-muted/80 transition-all duration-250 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreatePostInteractive;
