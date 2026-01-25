import React from 'react';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

interface CampaignFeedItemProps {
  id: string;
  candidateName: string;
  candidateAvatar: string;
  candidateAvatarAlt: string;
  position: string;
  contentType: 'manifesto' | 'video' | 'announcement' | 'qa';
  title: string;
  content: string;
  mediaUrl?: string;
  mediaAlt?: string;
  timestamp: string;
  likes: number;
  comments: number;
  isLiked: boolean;
  onLike: () => void;
  onComment: () => void;
}

const CampaignFeedItem = ({
  candidateName,
  candidateAvatar,
  candidateAvatarAlt,
  position,
  contentType,
  title,
  content,
  mediaUrl,
  mediaAlt,
  timestamp,
  likes,
  comments,
  isLiked,
  onLike,
  onComment,
}: CampaignFeedItemProps) => {
  const getContentTypeIcon = () => {
    switch (contentType) {
      case 'manifesto':
        return 'DocumentTextIcon';
      case 'video':
        return 'VideoCameraIcon';
      case 'announcement':
        return 'MegaphoneIcon';
      case 'qa':
        return 'ChatBubbleLeftRightIcon';
      default:
        return 'DocumentTextIcon';
    }
  };

  const getContentTypeColor = () => {
    switch (contentType) {
      case 'manifesto':
        return 'text-primary';
      case 'video':
        return 'text-error';
      case 'announcement':
        return 'text-accent';
      case 'qa':
        return 'text-success';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-all duration-250 ease-smooth">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
          <AppImage
            src={candidateAvatar}
            alt={candidateAvatarAlt}
            width={48}
            height={48}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-medium text-foreground">{candidateName}</h4>
              <p className="text-sm text-muted-foreground">{position}</p>
            </div>
            <div className={`flex items-center gap-1 ${getContentTypeColor()}`}>
              <Icon name={getContentTypeIcon() as any} size={16} variant="outline" />
              <span className="text-xs font-caption capitalize">{contentType}</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{timestamp}</p>
        </div>
      </div>

      <h3 className="font-heading font-semibold text-lg text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{content}</p>

      {mediaUrl && (
        <div className="mb-4 rounded-lg overflow-hidden bg-muted">
          {contentType === 'video' ? (
            <div className="relative w-full h-64 flex items-center justify-center">
              <AppImage
                src={mediaUrl}
                alt={mediaAlt || 'Campaign video thumbnail'}
                width={800}
                height={450}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
                  <Icon
                    name="PlayIcon"
                    size={32}
                    variant="solid"
                    className="text-primary-foreground ml-1"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full h-64 overflow-hidden">
              <AppImage
                src={mediaUrl}
                alt={mediaAlt || 'Campaign content image'}
                width={800}
                height={450}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-6 pt-4 border-t border-border">
        <button
          onClick={onLike}
          className={`flex items-center gap-2 transition-all duration-250 ease-smooth hover:-translate-y-0.5 ${
            isLiked ? 'text-error' : 'text-muted-foreground hover:text-error'
          }`}
        >
          <Icon name="HeartIcon" size={20} variant={isLiked ? 'solid' : 'outline'} />
          <span className="text-sm font-caption">{likes}</span>
        </button>

        <button
          onClick={onComment}
          className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-all duration-250 ease-smooth hover:-translate-y-0.5"
        >
          <Icon name="ChatBubbleLeftIcon" size={20} variant="outline" />
          <span className="text-sm font-caption">{comments}</span>
        </button>

        <button className="flex items-center gap-2 text-muted-foreground hover:text-accent transition-all duration-250 ease-smooth hover:-translate-y-0.5 ml-auto">
          <Icon name="ShareIcon" size={20} variant="outline" />
          <span className="text-sm font-caption">Share</span>
        </button>
      </div>
    </div>
  );
};

export default CampaignFeedItem;
