export interface YouTubeVideo {
  id: string
  title: string
  description: string
  thumbnail: string
  duration: string
  publishedAt: string
  channelTitle: string
  viewCount: string
  isLive: boolean
}

export interface TranscriptSegment {
  text: string
  start: number
  duration: number
  offset: number
}

export interface SummaryRequest {
  videoUrl: string
  summaryType: 'brief' | 'detailed' | 'super-detailed' | 'key-points'
  language: string
  maxLength: number
}

export interface SummaryResponse {
  id: string
  videoId: string
  summary: string
  keyPoints: string[]
  topics: string[]
  sentiment: 'positive' | 'negative' | 'neutral'
  duration: number
  createdAt: Date
  summaryType: string
  language: string
  videoInfo?: YouTubeVideo
  transcriptLength?: number
  processingTime?: number
  isFavorite?: boolean
}

export interface ProcessingStatus {
  status: 'idle' | 'processing' | 'completed' | 'error'
  message: string
  progress: number
}

export interface ErrorResponse {
  error: string
  message: string
  details?: unknown
}
