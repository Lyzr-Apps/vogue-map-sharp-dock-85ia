'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { callAIAgent } from '@/lib/aiAgent'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  FiMapPin,
  FiHeart,
  FiUser,
  FiCompass,
  FiRefreshCw,
  FiArrowLeft,
  FiCheck,
  FiClock,
  FiPhone,
  FiNavigation,
  FiMap,
  FiStar,
  FiSettings,
  FiX,
} from 'react-icons/fi'

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface StyleProfile {
  vibe_name: string
  style_tags: string[]
  color_preferences: string[]
  silhouette_preferences: string[]
  vibe_description: string
}

interface StoreMatch {
  store_name: string
  match_percentage: number
  match_explanation: string
  shared_tags: string[]
}

interface StyleOption {
  id: string
  name: string
  category: string
  description: string
  tags: string[]
  imageUrl: string
}

interface Collection {
  name: string
  imageUrl: string
  season: string
}

interface Store {
  id: string
  name: string
  description: string
  brand_tags: string[]
  collection_descriptors: string[]
  aesthetic_category: string
  address: string
  distance: string
  hours: string
  phone: string
  imageUrl: string
  collections: Collection[]
}

// ─── AGENT IDS ────────────────────────────────────────────────────────────────

const STYLE_PROFILE_AGENT_ID = '69996315730bbd74d53e8ac3'
const STORE_MATCH_AGENT_ID = '69996316730bbd74d53e8ac5'

// ─── JSON PARSER ──────────────────────────────────────────────────────────────

const parseAgentResult = (result: any): any => {
  if (!result) return null
  const raw = result?.response?.result
  if (!raw) return null
  if (typeof raw === 'object' && !Array.isArray(raw)) return raw
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw)
    } catch {
      const match = raw.match(/\{[\s\S]*\}/)
      if (match) {
        try {
          return JSON.parse(match[0])
        } catch {
          return null
        }
      }
      return null
    }
  }
  return null
}

// ─── MOCK DATA ────────────────────────────────────────────────────────────────

const STYLE_OPTIONS: StyleOption[] = [
  { id: '1', name: 'Minimalist Chic', category: 'Minimalist', description: 'Clean lines, neutral tones, effortless elegance', tags: ['minimalist', 'clean', 'neutral'], imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&h=500&fit=crop' },
  { id: '2', name: 'Street Luxe', category: 'Streetwear', description: 'Urban edge meets high-end fashion', tags: ['streetwear', 'urban', 'edgy'], imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&h=500&fit=crop' },
  { id: '3', name: 'Bohemian Spirit', category: 'Bohemian', description: 'Free-flowing fabrics, earthy tones, artistic flair', tags: ['bohemian', 'boho', 'free-spirited'], imageUrl: 'https://images.unsplash.com/photo-1518622358385-8ea7d0794bf6?w=400&h=500&fit=crop' },
  { id: '4', name: 'Classic Tailored', category: 'Classic', description: 'Timeless cuts, structured silhouettes, refined details', tags: ['classic', 'tailored', 'refined'], imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop' },
  { id: '5', name: 'Avant-Garde', category: 'Avant-Garde', description: 'Experimental shapes, bold statements, artistic expression', tags: ['avant-garde', 'experimental', 'bold'], imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=500&fit=crop' },
  { id: '6', name: 'Scandinavian Ease', category: 'Minimalist', description: 'Nordic simplicity, functional beauty, muted palettes', tags: ['scandinavian', 'minimal', 'functional'], imageUrl: 'https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=400&h=500&fit=crop' },
  { id: '7', name: 'Romantic Feminine', category: 'Romantic', description: 'Soft fabrics, floral motifs, delicate details', tags: ['romantic', 'feminine', 'delicate'], imageUrl: 'https://images.unsplash.com/photo-1502716119720-b23a1e3b3c42?w=400&h=500&fit=crop' },
  { id: '8', name: 'Athleisure Luxe', category: 'Athleisure', description: 'Performance meets luxury, sporty sophistication', tags: ['athleisure', 'sporty', 'luxury'], imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=500&fit=crop' },
  { id: '9', name: 'Vintage Revival', category: 'Vintage', description: 'Retro-inspired pieces, nostalgic charm, curated finds', tags: ['vintage', 'retro', 'nostalgic'], imageUrl: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&h=500&fit=crop' },
  { id: '10', name: 'Power Dressing', category: 'Professional', description: 'Sharp suits, commanding presence, modern authority', tags: ['power', 'professional', 'sharp'], imageUrl: 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=400&h=500&fit=crop' },
  { id: '11', name: 'Coastal Relaxed', category: 'Casual', description: 'Breezy linens, sun-washed tones, effortless cool', tags: ['coastal', 'relaxed', 'casual'], imageUrl: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=500&fit=crop' },
  { id: '12', name: 'Dark Romantic', category: 'Edgy', description: 'Moody palettes, rich textures, dramatic silhouettes', tags: ['dark', 'romantic', 'dramatic'], imageUrl: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&h=500&fit=crop' },
]

const MOCK_STORES: Store[] = [
  {
    id: 's1', name: 'Maison Blanc', description: 'A minimalist boutique focused on clean aesthetics and timeless wardrobe staples.',
    brand_tags: ['minimalist', 'clean', 'neutral', 'tailored', 'scandinavian'],
    collection_descriptors: ['curated basics', 'capsule wardrobe', 'monochrome essentials'],
    aesthetic_category: 'Minimalist',
    address: '42 Bleecker St, SoHo', distance: '0.3 mi', hours: '10AM - 8PM', phone: '(212) 555-0101',
    imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=400&fit=crop',
    collections: [
      { name: 'Winter Essentials', imageUrl: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=300&h=300&fit=crop', season: 'Winter 2026' },
      { name: 'Linen Edit', imageUrl: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=300&h=300&fit=crop', season: 'Spring 2026' },
    ],
  },
  {
    id: 's2', name: 'GRDN Studio', description: 'Urban streetwear meets high fashion. Limited drops and exclusive collaborations.',
    brand_tags: ['streetwear', 'urban', 'edgy', 'bold', 'experimental'],
    collection_descriptors: ['limited editions', 'sneaker collabs', 'graphic art'],
    aesthetic_category: 'Streetwear',
    address: '187 Orchard St, LES', distance: '0.8 mi', hours: '11AM - 9PM', phone: '(212) 555-0202',
    imageUrl: 'https://images.unsplash.com/photo-1528698827591-e19cef51a699?w=600&h=400&fit=crop',
    collections: [
      { name: 'Drop 07', imageUrl: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=300&h=300&fit=crop', season: 'SS26' },
      { name: 'Artist Series', imageUrl: 'https://images.unsplash.com/photo-1523398002811-999ca8dec234?w=300&h=300&fit=crop', season: 'Ongoing' },
    ],
  },
  {
    id: 's3', name: 'Terra & Sage', description: 'Bohemian-inspired boutique with artisan goods and earth-toned fashion.',
    brand_tags: ['bohemian', 'boho', 'free-spirited', 'romantic', 'vintage'],
    collection_descriptors: ['handcrafted textiles', 'artisan jewelry', 'earth-toned dresses'],
    aesthetic_category: 'Bohemian',
    address: '55 Bedford Ave, Williamsburg', distance: '1.2 mi', hours: '10AM - 7PM', phone: '(718) 555-0303',
    imageUrl: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=600&h=400&fit=crop',
    collections: [
      { name: 'Desert Bloom', imageUrl: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=300&h=300&fit=crop', season: 'Spring 2026' },
    ],
  },
  {
    id: 's4', name: 'Atelier Noir', description: 'Dark, dramatic fashion for those who dare. Sculptural silhouettes and luxe textures.',
    brand_tags: ['dark', 'dramatic', 'avant-garde', 'edgy', 'romantic'],
    collection_descriptors: ['sculptural coats', 'dark romanticism', 'architectural accessories'],
    aesthetic_category: 'Avant-Garde',
    address: '12 Crosby St, SoHo', distance: '0.5 mi', hours: '11AM - 8PM', phone: '(212) 555-0404',
    imageUrl: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=600&h=400&fit=crop',
    collections: [
      { name: 'Shadow Line', imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=300&h=300&fit=crop', season: 'FW26' },
      { name: 'Velvet Hours', imageUrl: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=300&h=300&fit=crop', season: 'FW26' },
    ],
  },
  {
    id: 's5', name: 'Form & Function', description: 'Performance luxury. Athleisure elevated with premium fabrics and sharp design.',
    brand_tags: ['athleisure', 'sporty', 'luxury', 'functional', 'minimal'],
    collection_descriptors: ['performance knits', 'luxury activewear', 'travel capsules'],
    aesthetic_category: 'Athleisure',
    address: '90 Prince St, SoHo', distance: '0.4 mi', hours: '9AM - 9PM', phone: '(212) 555-0505',
    imageUrl: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=600&h=400&fit=crop',
    collections: [
      { name: 'Move Collection', imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&h=300&fit=crop', season: 'SS26' },
    ],
  },
  {
    id: 's6', name: 'The Archive', description: 'Curated vintage finds from the 60s through Y2K. Every piece tells a story.',
    brand_tags: ['vintage', 'retro', 'nostalgic', 'curated', 'classic'],
    collection_descriptors: ['vintage denim', 'retro prints', 'designer resale'],
    aesthetic_category: 'Vintage',
    address: '213 Grand St, Chinatown', distance: '0.9 mi', hours: '12PM - 8PM', phone: '(212) 555-0606',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=400&fit=crop',
    collections: [
      { name: '90s Revival', imageUrl: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=300&h=300&fit=crop', season: 'Curated' },
    ],
  },
  {
    id: 's7', name: 'Clarity', description: 'Refined professional wardrobe essentials for the modern power dresser.',
    brand_tags: ['professional', 'sharp', 'tailored', 'classic', 'refined'],
    collection_descriptors: ['power suits', 'boardroom essentials', 'modern workwear'],
    aesthetic_category: 'Professional',
    address: '5 E 57th St, Midtown', distance: '2.1 mi', hours: '10AM - 7PM', phone: '(212) 555-0707',
    imageUrl: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=600&h=400&fit=crop',
    collections: [
      { name: 'Executive Edit', imageUrl: 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=300&h=300&fit=crop', season: 'SS26' },
      { name: 'After Hours', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop', season: 'FW26' },
    ],
  },
  {
    id: 's8', name: 'Dune Collective', description: 'Coastal-inspired relaxed luxury. Effortless pieces for sun-soaked living.',
    brand_tags: ['coastal', 'relaxed', 'casual', 'feminine', 'delicate'],
    collection_descriptors: ['resort wear', 'linen collection', 'beach-to-bar'],
    aesthetic_category: 'Casual',
    address: '78 N 6th St, Williamsburg', distance: '1.5 mi', hours: '10AM - 7PM', phone: '(718) 555-0808',
    imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=400&fit=crop',
    collections: [
      { name: 'Shore Line', imageUrl: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=300&h=300&fit=crop', season: 'SS26' },
    ],
  },
]

// ─── SAMPLE DATA ──────────────────────────────────────────────────────────────

const SAMPLE_STYLE_PROFILE: StyleProfile = {
  vibe_name: 'Urban Minimalist',
  style_tags: ['minimalist', 'clean', 'tailored', 'neutral', 'scandinavian', 'functional'],
  color_preferences: ['ivory', 'charcoal', 'camel', 'slate', 'off-white'],
  silhouette_preferences: ['oversized coats', 'straight-leg trousers', 'structured blazers', 'relaxed knitwear'],
  vibe_description: 'Your style blends Scandinavian restraint with urban sophistication. You gravitate toward neutral palettes and clean architectural lines, preferring quality fabrics and timeless silhouettes over trend-driven pieces. Your wardrobe is a curated capsule of versatile essentials.',
}

const SAMPLE_STORE_MATCHES: StoreMatch[] = [
  { store_name: 'Maison Blanc', match_percentage: 94, match_explanation: 'A near-perfect alignment with your minimalist aesthetic. Their curated basics and capsule wardrobe approach mirrors your preference for clean, versatile pieces.', shared_tags: ['minimalist', 'clean', 'neutral', 'tailored', 'scandinavian'] },
  { store_name: 'Clarity', match_percentage: 82, match_explanation: 'Strong overlap in tailored, refined pieces. Their professional wardrobe essentials complement your structured silhouette preferences.', shared_tags: ['tailored', 'classic', 'refined'] },
  { store_name: 'Form & Function', match_percentage: 75, match_explanation: 'Shared appreciation for functional minimalism. Their performance luxury line aligns with your love for quality and clean design.', shared_tags: ['functional', 'minimal', 'luxury'] },
  { store_name: 'Dune Collective', match_percentage: 58, match_explanation: 'Some crossover in relaxed, neutral-toned pieces, though their coastal aesthetic differs from your urban core.', shared_tags: ['relaxed', 'casual'] },
  { store_name: 'GRDN Studio', match_percentage: 42, match_explanation: 'Limited overlap. Their streetwear-forward aesthetic diverges from your minimalist sensibility.', shared_tags: ['urban'] },
  { store_name: 'The Archive', match_percentage: 38, match_explanation: 'Vintage finds occasionally align with your classic taste, but the retro aesthetic is largely different from your modern approach.', shared_tags: ['classic', 'curated'] },
  { store_name: 'Terra & Sage', match_percentage: 25, match_explanation: 'Earth tones offer some palette overlap, but the bohemian silhouettes diverge significantly from your structured preferences.', shared_tags: ['vintage'] },
  { store_name: 'Atelier Noir', match_percentage: 20, match_explanation: 'Minimal alignment. Their dramatic, avant-garde approach contrasts with your understated minimalism.', shared_tags: ['edgy'] },
]

const SAMPLE_MATCH_SUMMARY = 'Your Urban Minimalist style aligns most strongly with boutiques that prioritize clean lines, neutral palettes, and curated essentials. SoHo emerges as your ideal shopping district, with Maison Blanc and Clarity offering the closest aesthetic matches to your wardrobe vision.'

// ─── MARKDOWN RENDERER ────────────────────────────────────────────────────────

function formatInline(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  if (parts.length === 1) return text
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-medium">
        {part}
      </strong>
    ) : (
      part
    )
  )
}

function renderMarkdown(text: string) {
  if (!text) return null
  return (
    <div className="space-y-2">
      {text.split('\n').map((line, i) => {
        if (line.startsWith('### '))
          return <h4 key={i} className="font-medium text-sm mt-3 mb-1 tracking-wider">{line.slice(4)}</h4>
        if (line.startsWith('## '))
          return <h3 key={i} className="font-medium text-base mt-3 mb-1 tracking-wider">{line.slice(3)}</h3>
        if (line.startsWith('# '))
          return <h2 key={i} className="font-medium text-lg mt-4 mb-2 tracking-wider">{line.slice(2)}</h2>
        if (line.startsWith('- ') || line.startsWith('* '))
          return <li key={i} className="ml-4 list-disc text-sm font-light">{formatInline(line.slice(2))}</li>
        if (/^\d+\.\s/.test(line))
          return <li key={i} className="ml-4 list-decimal text-sm font-light">{formatInline(line.replace(/^\d+\.\s/, ''))}</li>
        if (!line.trim()) return <div key={i} className="h-1" />
        return <p key={i} className="text-sm font-light leading-relaxed">{formatInline(line)}</p>
      })}
    </div>
  )
}

// ─── ERROR BOUNDARY ───────────────────────────────────────────────────────────

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: '' }
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
          <div className="text-center p-8 max-w-md">
            <h2 className="text-xl font-medium mb-2 tracking-wider">Something went wrong</h2>
            <p className="text-muted-foreground mb-4 text-sm font-light">{this.state.error}</p>
            <button
              onClick={() => this.setState({ hasError: false, error: '' })}
              className="px-6 py-2 bg-primary text-primary-foreground text-sm tracking-widest uppercase"
            >
              Try again
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

function OnboardingWelcome({ onStart }: { onStart: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8 text-center">
      <div className="mb-16">
        <p className="uppercase tracking-[0.3em] text-xs text-muted-foreground mb-6 font-light">Personal Style Discovery</p>
        <h1 className="font-serif text-5xl font-light tracking-wider mb-4">STYLEMATCH</h1>
        <div className="w-16 h-px bg-primary mx-auto mb-8" />
        <p className="text-sm text-muted-foreground font-light leading-relaxed max-w-xs mx-auto mb-2">Discover your perfect style match</p>
        <p className="text-xs text-muted-foreground font-light leading-relaxed max-w-xs mx-auto">Take a brief visual quiz to uncover your unique style DNA, then find local boutiques that perfectly align with your aesthetic.</p>
      </div>
      <Button onClick={onStart} className="px-12 py-6 text-xs uppercase tracking-[0.25em] font-normal bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 shadow-sm">
        Get Started
      </Button>
    </div>
  )
}

function StyleQuiz({
  selectedStyles,
  onToggle,
  onSubmit,
  isAnalyzing,
}: {
  selectedStyles: string[]
  onToggle: (id: string) => void
  onSubmit: () => void
  isAnalyzing: boolean
}) {
  if (isAnalyzing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-8 text-center">
        <div className="space-y-8">
          <div className="space-y-3">
            <Skeleton className="h-4 w-48 mx-auto" />
            <Skeleton className="h-8 w-64 mx-auto" />
          </div>
          <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-40 w-full" />
            ))}
          </div>
          <div className="flex items-center justify-center gap-3">
            <FiRefreshCw className="w-4 h-4 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground font-light tracking-wider">Analyzing your style...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="text-center mb-8">
        <p className="uppercase tracking-[0.3em] text-xs text-muted-foreground mb-2 font-light">Style Quiz</p>
        <h2 className="font-serif text-2xl font-light tracking-wider mb-2">Select Your Aesthetic</h2>
        <p className="text-xs text-muted-foreground font-light">Choose 5 to 10 styles that resonate with you</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-24">
        {STYLE_OPTIONS.map((option) => {
          const isSelected = selectedStyles.includes(option.id)
          return (
            <button
              key={option.id}
              onClick={() => onToggle(option.id)}
              className={`relative overflow-hidden text-left transition-all duration-300 ${isSelected ? 'ring-2 ring-primary shadow-sm' : 'ring-1 ring-border'}`}
            >
              <div className="aspect-[4/5] relative">
                <img
                  src={option.imageUrl}
                  alt={option.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                {isSelected && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-primary flex items-center justify-center">
                    <FiCheck className="w-3 h-3 text-primary-foreground" />
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <Badge variant="secondary" className="text-[10px] uppercase tracking-widest mb-1 font-light bg-white/20 text-white border-0">
                    {option.category}
                  </Badge>
                  <p className="text-white text-sm font-normal tracking-wider">{option.name}</p>
                  <p className="text-white/70 text-[10px] font-light tracking-wide">{option.description}</p>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <p className="text-xs text-muted-foreground font-light tracking-wider">
            {selectedStyles.length} of 10 selected
          </p>
          <Button
            onClick={onSubmit}
            disabled={selectedStyles.length < 5}
            className="px-8 py-2 text-xs uppercase tracking-[0.25em] font-normal bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 transition-all duration-300"
          >
            Discover My Style
          </Button>
        </div>
      </div>
    </div>
  )
}

function StyleDNAScreen({
  profile,
  onExplore,
}: {
  profile: StyleProfile
  onExplore: () => void
}) {
  return (
    <div className="min-h-screen px-6 py-12">
      <div className="text-center mb-10">
        <p className="uppercase tracking-[0.3em] text-xs text-muted-foreground mb-4 font-light">Your Style DNA</p>
        <h1 className="font-serif text-4xl font-light tracking-wider mb-4">{profile.vibe_name}</h1>
        <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mb-8" />
      </div>

      <div className="space-y-8 mb-12">
        <div>
          <p className="uppercase tracking-[0.2em] text-[10px] text-muted-foreground mb-3 font-light">Style Tags</p>
          <div className="flex flex-wrap gap-2">
            {Array.isArray(profile?.style_tags) && profile.style_tags.map((tag, i) => (
              <Badge key={i} variant="outline" className="text-xs font-light tracking-wider px-3 py-1 border-primary/30 text-foreground">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <Separator className="bg-border" />

        <div>
          <p className="uppercase tracking-[0.2em] text-[10px] text-muted-foreground mb-3 font-light">Color Palette</p>
          <div className="flex flex-wrap gap-2">
            {Array.isArray(profile?.color_preferences) && profile.color_preferences.map((color, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 text-xs font-light tracking-wider text-foreground bg-secondary px-3 py-1.5 border border-border">
                <span className="w-2 h-2 bg-primary/60" />
                {color}
              </span>
            ))}
          </div>
        </div>

        <Separator className="bg-border" />

        <div>
          <p className="uppercase tracking-[0.2em] text-[10px] text-muted-foreground mb-3 font-light">Silhouettes</p>
          <div className="flex flex-wrap gap-2">
            {Array.isArray(profile?.silhouette_preferences) && profile.silhouette_preferences.map((sil, i) => (
              <Badge key={i} variant="secondary" className="text-xs font-light tracking-wider px-3 py-1">
                {sil}
              </Badge>
            ))}
          </div>
        </div>

        <Separator className="bg-border" />

        <div>
          <p className="uppercase tracking-[0.2em] text-[10px] text-muted-foreground mb-3 font-light">Description</p>
          <p className="text-sm font-light leading-relaxed text-foreground">{profile.vibe_description}</p>
        </div>
      </div>

      <div className="text-center">
        <Button onClick={onExplore} className="px-12 py-6 text-xs uppercase tracking-[0.25em] font-normal bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 shadow-sm">
          Explore Stores
        </Button>
      </div>
    </div>
  )
}

function SimulatedMap({ storeMatches, stores }: { storeMatches: StoreMatch[]; stores: Store[] }) {
  const pinPositions = [
    { top: '30%', left: '25%' },
    { top: '55%', left: '70%' },
    { top: '40%', left: '45%' },
    { top: '20%', left: '60%' },
    { top: '65%', left: '30%' },
    { top: '50%', left: '55%' },
    { top: '35%', left: '80%' },
    { top: '70%', left: '50%' },
  ]

  return (
    <div className="relative w-full aspect-[16/10] bg-secondary border border-border overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-px h-full bg-border" />
        <div className="absolute top-0 left-1/2 w-px h-full bg-border" />
        <div className="absolute top-0 left-3/4 w-px h-full bg-border" />
        <div className="absolute top-1/4 left-0 w-full h-px bg-border" />
        <div className="absolute top-1/2 left-0 w-full h-px bg-border" />
        <div className="absolute top-3/4 left-0 w-full h-px bg-border" />
      </div>
      <div className="absolute top-3 left-3 flex items-center gap-1.5">
        <FiMap className="w-3 h-3 text-muted-foreground" />
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-light">SoHo & Vicinity</span>
      </div>
      {stores.map((store, idx) => {
        const match = storeMatches.find((m) => m.store_name === store.name)
        const pct = match?.match_percentage ?? 0
        const pos = pinPositions[idx % pinPositions.length]
        let dotColor = 'bg-muted-foreground/40'
        if (pct >= 80) dotColor = 'bg-green-600'
        else if (pct >= 50) dotColor = 'bg-yellow-500'

        return (
          <div key={store.id} className="absolute group" style={{ top: pos.top, left: pos.left }}>
            <div className={`w-3 h-3 ${dotColor} border border-white shadow-sm`} />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-card border border-border px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-sm">
              <p className="text-[10px] font-normal tracking-wider">{store.name}</p>
              {pct > 0 && <p className="text-[9px] text-primary font-normal">{pct}%</p>}
            </div>
          </div>
        )
      })}
      <div className="absolute bottom-3 right-3 flex items-center gap-3">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-green-600" />
          <span className="text-[9px] text-muted-foreground font-light tracking-wider">80%+</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-yellow-500" />
          <span className="text-[9px] text-muted-foreground font-light tracking-wider">50-79%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-muted-foreground/40" />
          <span className="text-[9px] text-muted-foreground font-light tracking-wider">&lt;50%</span>
        </div>
      </div>
    </div>
  )
}

function StoreCard({
  store,
  match,
  onSelect,
  isFavorite,
  onToggleFavorite,
}: {
  store: Store
  match: StoreMatch | undefined
  onSelect: () => void
  isFavorite: boolean
  onToggleFavorite: () => void
}) {
  const pct = match?.match_percentage ?? 0
  const sharedTags = Array.isArray(match?.shared_tags) ? match.shared_tags.slice(0, 3) : []

  return (
    <button onClick={onSelect} className="w-full text-left border border-border bg-card transition-all duration-300 hover:shadow-sm">
      <div className="flex gap-3 p-3">
        <div className="w-20 h-20 flex-shrink-0 overflow-hidden">
          <img src={store.imageUrl} alt={store.name} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <div>
              <p className="text-sm font-normal tracking-wider truncate">{store.name}</p>
              <p className="text-[10px] text-muted-foreground font-light tracking-wider flex items-center gap-1">
                <FiMapPin className="w-2.5 h-2.5" />
                {store.distance}
              </p>
            </div>
            <div className="text-right flex-shrink-0 ml-2">
              <p className="text-2xl font-normal text-primary leading-none">{pct}</p>
              <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-light">% Match</p>
            </div>
          </div>
          {sharedTags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {sharedTags.map((tag, i) => (
                <span key={i} className="text-[9px] uppercase tracking-widest text-muted-foreground bg-secondary px-1.5 py-0.5 border border-border font-light">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggleFavorite()
          }}
          className="flex-shrink-0 self-start p-1"
        >
          <FiHeart className={`w-4 h-4 transition-colors ${isFavorite ? 'text-primary fill-primary' : 'text-muted-foreground'}`} />
        </button>
      </div>
    </button>
  )
}

function DiscoverScreen({
  storeMatches,
  matchSummary,
  isMatching,
  activeFilter,
  onFilterChange,
  onRefresh,
  onSelectStore,
  favorites,
  onToggleFavorite,
  styleProfile,
}: {
  storeMatches: StoreMatch[]
  matchSummary: string
  isMatching: boolean
  activeFilter: string
  onFilterChange: (f: string) => void
  onRefresh: () => void
  onSelectStore: (store: Store) => void
  favorites: string[]
  onToggleFavorite: (id: string) => void
  styleProfile: StyleProfile | null
}) {
  const categories = ['All', 'Nearest', 'Best Match', ...Array.from(new Set(MOCK_STORES.map((s) => s.aesthetic_category)))]

  const sortedStores = React.useMemo(() => {
    let stores = [...MOCK_STORES]

    if (activeFilter === 'Nearest') {
      stores.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance))
    } else if (activeFilter === 'Best Match') {
      stores.sort((a, b) => {
        const matchA = storeMatches.find((m) => m.store_name === a.name)?.match_percentage ?? 0
        const matchB = storeMatches.find((m) => m.store_name === b.name)?.match_percentage ?? 0
        return matchB - matchA
      })
    } else if (activeFilter !== 'All') {
      stores = stores.filter((s) => s.aesthetic_category === activeFilter)
    }

    return stores
  }, [activeFilter, storeMatches])

  return (
    <div className="min-h-screen pb-24">
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="uppercase tracking-[0.3em] text-xs text-muted-foreground font-light">Discover</p>
            <h2 className="font-serif text-xl font-light tracking-wider">Your Matches</h2>
          </div>
          <button
            onClick={onRefresh}
            disabled={isMatching || !styleProfile}
            className="p-2 text-muted-foreground hover:text-primary transition-colors disabled:opacity-40"
          >
            <FiRefreshCw className={`w-4 h-4 ${isMatching ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {matchSummary && (
          <p className="text-xs text-muted-foreground font-light leading-relaxed mb-4">{matchSummary}</p>
        )}

        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onFilterChange(cat)}
              className={`flex-shrink-0 px-3 py-1.5 text-[10px] uppercase tracking-widest font-light border transition-all duration-200 ${activeFilter === cat ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border hover:border-primary/40'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {!styleProfile && !isMatching && (
        <div className="px-4 py-12 text-center">
          <FiCompass className="w-8 h-8 text-muted-foreground/40 mx-auto mb-4" />
          <p className="text-sm text-muted-foreground font-light tracking-wider">Complete your style quiz to discover matching stores</p>
        </div>
      )}

      {isMatching && (
        <div className="px-4 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="border border-border bg-card p-3">
              <div className="flex gap-3">
                <Skeleton className="w-20 h-20 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                  <div className="flex gap-1">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
                <Skeleton className="w-10 h-10" />
              </div>
            </div>
          ))}
          <div className="flex items-center justify-center gap-2 pt-4">
            <FiRefreshCw className="w-3 h-3 text-primary animate-spin" />
            <p className="text-xs text-muted-foreground font-light tracking-wider">Finding your matches...</p>
          </div>
        </div>
      )}

      {styleProfile && !isMatching && (
        <>
          <div className="px-4 mb-4">
            <SimulatedMap storeMatches={storeMatches} stores={MOCK_STORES} />
          </div>
          <div className="px-4 space-y-2">
            {sortedStores.map((store) => {
              const match = storeMatches.find((m) => m.store_name === store.name)
              return (
                <StoreCard
                  key={store.id}
                  store={store}
                  match={match}
                  onSelect={() => onSelectStore(store)}
                  isFavorite={favorites.includes(store.id)}
                  onToggleFavorite={() => onToggleFavorite(store.id)}
                />
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

function StoreDetailScreen({
  store,
  match,
  onBack,
  isFavorite,
  onToggleFavorite,
}: {
  store: Store
  match: StoreMatch | undefined
  onBack: () => void
  isFavorite: boolean
  onToggleFavorite: () => void
}) {
  const pct = match?.match_percentage ?? 0
  const sharedTags = Array.isArray(match?.shared_tags) ? match.shared_tags : []
  const explanation = match?.match_explanation ?? ''
  const collections = Array.isArray(store?.collections) ? store.collections : []

  return (
    <div className="min-h-screen pb-24">
      <div className="relative">
        <button onClick={onBack} className="absolute top-4 left-4 z-10 w-8 h-8 bg-white/90 flex items-center justify-center border border-border shadow-sm">
          <FiArrowLeft className="w-4 h-4 text-foreground" />
        </button>
        <button onClick={onToggleFavorite} className="absolute top-4 right-4 z-10 w-8 h-8 bg-white/90 flex items-center justify-center border border-border shadow-sm">
          <FiHeart className={`w-4 h-4 ${isFavorite ? 'text-primary fill-primary' : 'text-foreground'}`} />
        </button>
        <div className="aspect-[16/9] relative overflow-hidden">
          <img src={store.imageUrl} alt={store.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          {pct > 0 && (
            <div className="absolute bottom-4 right-4 w-16 h-16 bg-card border border-border flex flex-col items-center justify-center shadow-sm">
              <p className="text-xl font-normal text-primary leading-none">{pct}</p>
              <p className="text-[8px] uppercase tracking-widest text-muted-foreground font-light">% Match</p>
            </div>
          )}
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        <div>
          <Badge variant="secondary" className="text-[10px] uppercase tracking-widest mb-2 font-light">{store.aesthetic_category}</Badge>
          <h1 className="font-serif text-3xl font-light tracking-wider mb-2">{store.name}</h1>
          <p className="text-sm text-muted-foreground font-light leading-relaxed">{store.description}</p>
        </div>

        {explanation && (
          <div>
            <p className="uppercase tracking-[0.2em] text-[10px] text-muted-foreground mb-2 font-light">Why You Match</p>
            <div className="border border-border bg-secondary/50 p-4">
              <p className="text-sm font-light leading-relaxed">{explanation}</p>
            </div>
          </div>
        )}

        {sharedTags.length > 0 && (
          <div>
            <p className="uppercase tracking-[0.2em] text-[10px] text-muted-foreground mb-2 font-light">Shared Style Tags</p>
            <div className="flex flex-wrap gap-2">
              {sharedTags.map((tag, i) => (
                <Badge key={i} variant="outline" className="text-xs font-light tracking-wider px-3 py-1 border-primary/30 text-foreground">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <Separator className="bg-border" />

        <div>
          <p className="uppercase tracking-[0.2em] text-[10px] text-muted-foreground mb-3 font-light">Current Collections</p>
          {collections.length > 0 ? (
            <div className="flex gap-3 overflow-x-auto -mx-6 px-6 pb-2">
              {collections.map((col, i) => (
                <div key={i} className="flex-shrink-0 w-40 border border-border bg-card">
                  <div className="aspect-square overflow-hidden">
                    <img src={col.imageUrl} alt={col.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-2.5">
                    <p className="text-xs font-normal tracking-wider truncate">{col.name}</p>
                    <p className="text-[10px] text-muted-foreground font-light tracking-wider">{col.season}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground font-light tracking-wider">Collection info coming soon</p>
          )}
        </div>

        <Separator className="bg-border" />

        <div className="space-y-3">
          <p className="uppercase tracking-[0.2em] text-[10px] text-muted-foreground mb-2 font-light">Store Information</p>
          <div className="flex items-start gap-3">
            <FiMapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-sm font-light tracking-wider">{store.address}</p>
          </div>
          <div className="flex items-start gap-3">
            <FiClock className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-sm font-light tracking-wider">{store.hours}</p>
          </div>
          <div className="flex items-start gap-3">
            <FiPhone className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-sm font-light tracking-wider">{store.phone}</p>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="outline" className="flex-1 text-xs uppercase tracking-[0.2em] font-light py-5 border-border hover:bg-secondary transition-all">
            <FiNavigation className="w-3.5 h-3.5 mr-2" />
            Get Directions
          </Button>
        </div>
      </div>
    </div>
  )
}

function ProfileScreen({
  profile,
  favorites,
  onRetakeQuiz,
  onSelectStore,
}: {
  profile: StyleProfile | null
  favorites: string[]
  onRetakeQuiz: () => void
  onSelectStore: (store: Store) => void
}) {
  const [userName, setUserName] = useState('Style Explorer')
  const [notifications, setNotifications] = useState(true)

  const favoriteStores = MOCK_STORES.filter((s) => favorites.includes(s.id))

  return (
    <div className="min-h-screen pb-24 px-6 py-8">
      <div className="mb-8">
        <p className="uppercase tracking-[0.3em] text-xs text-muted-foreground font-light mb-1">Profile</p>
        <h2 className="font-serif text-2xl font-light tracking-wider">Your Style</h2>
      </div>

      {profile && (
        <Card className="mb-6 border border-border shadow-sm bg-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <p className="uppercase tracking-[0.2em] text-[10px] text-muted-foreground font-light">Style DNA</p>
              <FiStar className="w-4 h-4 text-primary" />
            </div>
            <CardTitle className="font-serif text-xl font-light tracking-wider">{profile.vibe_name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-1.5">
              {Array.isArray(profile?.style_tags) && profile.style_tags.slice(0, 5).map((tag, i) => (
                <Badge key={i} variant="outline" className="text-[10px] font-light tracking-wider px-2 py-0.5 border-primary/30">
                  {tag}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground font-light leading-relaxed line-clamp-3">{profile.vibe_description}</p>
          </CardContent>
        </Card>
      )}

      <Button onClick={onRetakeQuiz} variant="outline" className="w-full text-xs uppercase tracking-[0.2em] font-light py-5 border-border hover:bg-secondary transition-all mb-8">
        <FiRefreshCw className="w-3.5 h-3.5 mr-2" />
        Retake Style Quiz
      </Button>

      <div className="mb-8">
        <p className="uppercase tracking-[0.2em] text-[10px] text-muted-foreground font-light mb-3">Favorites ({favoriteStores.length})</p>
        {favoriteStores.length === 0 ? (
          <div className="border border-border bg-secondary/30 p-6 text-center">
            <FiHeart className="w-6 h-6 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground font-light tracking-wider">No favorites yet. Discover stores and save your picks.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {favoriteStores.map((store) => (
              <button
                key={store.id}
                onClick={() => onSelectStore(store)}
                className="w-full text-left flex items-center gap-3 p-3 border border-border bg-card hover:shadow-sm transition-all"
              >
                <div className="w-12 h-12 flex-shrink-0 overflow-hidden">
                  <img src={store.imageUrl} alt={store.name} className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-normal tracking-wider truncate">{store.name}</p>
                  <p className="text-[10px] text-muted-foreground font-light tracking-wider">{store.aesthetic_category}</p>
                </div>
                <FiArrowLeft className="w-3 h-3 text-muted-foreground rotate-180 ml-auto flex-shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>

      <Separator className="bg-border mb-6" />

      <div className="space-y-5">
        <p className="uppercase tracking-[0.2em] text-[10px] text-muted-foreground font-light flex items-center gap-2">
          <FiSettings className="w-3 h-3" />
          Account Settings
        </p>
        <div>
          <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-light">Name</Label>
          <Input
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="mt-1 text-sm font-light tracking-wider bg-card border-border focus:ring-primary"
          />
        </div>
        <div>
          <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-light">Location</Label>
          <p className="text-sm font-light tracking-wider mt-1 flex items-center gap-1.5">
            <FiMapPin className="w-3 h-3 text-primary" />
            New York, NY
          </p>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-light">Notifications</Label>
            <p className="text-[10px] text-muted-foreground font-light mt-0.5">New store matches & drops</p>
          </div>
          <Switch checked={notifications} onCheckedChange={setNotifications} />
        </div>
      </div>
    </div>
  )
}

function BottomNav({
  activeTab,
  onTabChange,
}: {
  activeTab: 'discover' | 'favorites' | 'profile'
  onTabChange: (tab: 'discover' | 'favorites' | 'profile') => void
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="max-w-md mx-auto bg-card border-t border-border">
        <div className="flex">
          <button
            onClick={() => onTabChange('discover')}
            className={`flex-1 flex flex-col items-center py-3 gap-1 transition-colors ${activeTab === 'discover' ? 'text-primary' : 'text-muted-foreground'}`}
          >
            <FiCompass className="w-5 h-5" />
            <span className="text-[9px] uppercase tracking-widest font-light">Discover</span>
          </button>
          <button
            onClick={() => onTabChange('favorites')}
            className={`flex-1 flex flex-col items-center py-3 gap-1 transition-colors ${activeTab === 'favorites' ? 'text-primary' : 'text-muted-foreground'}`}
          >
            <FiHeart className="w-5 h-5" />
            <span className="text-[9px] uppercase tracking-widest font-light">Favorites</span>
          </button>
          <button
            onClick={() => onTabChange('profile')}
            className={`flex-1 flex flex-col items-center py-3 gap-1 transition-colors ${activeTab === 'profile' ? 'text-primary' : 'text-muted-foreground'}`}
          >
            <FiUser className="w-5 h-5" />
            <span className="text-[9px] uppercase tracking-widest font-light">Profile</span>
          </button>
        </div>
      </div>
    </div>
  )
}

function AgentStatusPanel({ activeAgentId }: { activeAgentId: string | null }) {
  const agents = [
    { id: STYLE_PROFILE_AGENT_ID, name: 'Style Profile Agent', purpose: 'Analyzes quiz selections into a style DNA profile' },
    { id: STORE_MATCH_AGENT_ID, name: 'Store Match Agent', purpose: 'Ranks stores by compatibility with your style' },
  ]

  return (
    <div className="border border-border bg-card p-4">
      <p className="uppercase tracking-[0.2em] text-[10px] text-muted-foreground font-light mb-3">AI Agents</p>
      <div className="space-y-2">
        {agents.map((agent) => (
          <div key={agent.id} className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 flex-shrink-0 ${activeAgentId === agent.id ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground/30'}`} />
            <div className="min-w-0">
              <p className="text-[11px] font-normal tracking-wider truncate">{agent.name}</p>
              <p className="text-[9px] text-muted-foreground font-light tracking-wider truncate">{agent.purpose}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function Page() {
  const [currentScreen, setCurrentScreen] = useState<'onboarding' | 'style-dna' | 'discover' | 'store-detail' | 'profile'>('onboarding')
  const [quizStarted, setQuizStarted] = useState(false)
  const [selectedStyles, setSelectedStyles] = useState<string[]>([])
  const [styleProfile, setStyleProfile] = useState<StyleProfile | null>(null)
  const [storeMatches, setStoreMatches] = useState<StoreMatch[]>([])
  const [matchSummary, setMatchSummary] = useState('')
  const [selectedStore, setSelectedStore] = useState<Store | null>(null)
  const [favorites, setFavorites] = useState<string[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isMatching, setIsMatching] = useState(false)
  const [activeFilter, setActiveFilter] = useState('All')
  const [activeTab, setActiveTab] = useState<'discover' | 'favorites' | 'profile'>('discover')
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null)
  const [sampleData, setSampleData] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Toggle sample data
  useEffect(() => {
    if (sampleData) {
      setStyleProfile(SAMPLE_STYLE_PROFILE)
      setStoreMatches(SAMPLE_STORE_MATCHES)
      setMatchSummary(SAMPLE_MATCH_SUMMARY)
      if (currentScreen === 'onboarding') {
        setQuizStarted(false)
        setSelectedStyles([])
        setCurrentScreen('discover')
      }
    } else {
      if (styleProfile === SAMPLE_STYLE_PROFILE) {
        setStyleProfile(null)
        setStoreMatches([])
        setMatchSummary('')
        setCurrentScreen('onboarding')
        setQuizStarted(false)
        setSelectedStyles([])
      }
    }
  }, [sampleData])

  const toggleStyleSelection = useCallback((id: string) => {
    setSelectedStyles((prev) => {
      if (prev.includes(id)) return prev.filter((s) => s !== id)
      if (prev.length >= 10) return prev
      return [...prev, id]
    })
  }, [])

  const toggleFavorite = useCallback((storeId: string) => {
    setFavorites((prev) => (prev.includes(storeId) ? prev.filter((f) => f !== storeId) : [...prev, storeId]))
  }, [])

  const handleAnalyzeStyle = useCallback(async () => {
    setIsAnalyzing(true)
    setErrorMessage('')
    setActiveAgentId(STYLE_PROFILE_AGENT_ID)

    const selectedOptions = STYLE_OPTIONS.filter((opt) => selectedStyles.includes(opt.id))
    const message = `Analyze these style selections and generate a style profile. The user selected the following styles:\n\n${selectedOptions.map((opt) => `- ${opt.name} (${opt.category}): ${opt.description}. Tags: ${opt.tags.join(', ')}`).join('\n')}\n\nGenerate a JSON style profile with: vibe_name (catchy 2-3 word descriptor), style_tags (array of style keywords), color_preferences (array of color names), silhouette_preferences (array of silhouette types), vibe_description (2-3 sentence style personality description).`

    try {
      const result = await callAIAgent(message, STYLE_PROFILE_AGENT_ID)
      if (result.success) {
        const parsed = parseAgentResult(result)
        if (parsed) {
          const profile: StyleProfile = {
            vibe_name: parsed.vibe_name ?? 'Your Style',
            style_tags: Array.isArray(parsed.style_tags) ? parsed.style_tags : [],
            color_preferences: Array.isArray(parsed.color_preferences) ? parsed.color_preferences : [],
            silhouette_preferences: Array.isArray(parsed.silhouette_preferences) ? parsed.silhouette_preferences : [],
            vibe_description: parsed.vibe_description ?? '',
          }
          setStyleProfile(profile)
          setCurrentScreen('style-dna')
        } else {
          setErrorMessage('Could not parse style profile. Please try again.')
        }
      } else {
        setErrorMessage(result?.error ?? 'Failed to analyze style. Please try again.')
      }
    } catch (err) {
      setErrorMessage('An error occurred while analyzing your style.')
    } finally {
      setIsAnalyzing(false)
      setActiveAgentId(null)
    }
  }, [selectedStyles])

  const handleMatchStores = useCallback(async () => {
    if (!styleProfile) return
    setIsMatching(true)
    setErrorMessage('')
    setActiveAgentId(STORE_MATCH_AGENT_ID)

    const storeData = MOCK_STORES.map((s) => ({
      name: s.name,
      brand_tags: s.brand_tags,
      collection_descriptors: s.collection_descriptors,
      aesthetic_category: s.aesthetic_category,
    }))

    const message = `Match this style profile against these stores and rank them by compatibility.\n\nStyle Profile:\n- Vibe: ${styleProfile.vibe_name}\n- Tags: ${Array.isArray(styleProfile.style_tags) ? styleProfile.style_tags.join(', ') : ''}\n- Colors: ${Array.isArray(styleProfile.color_preferences) ? styleProfile.color_preferences.join(', ') : ''}\n- Silhouettes: ${Array.isArray(styleProfile.silhouette_preferences) ? styleProfile.silhouette_preferences.join(', ') : ''}\n- Description: ${styleProfile.vibe_description}\n\nStores:\n${storeData.map((s) => `- ${s.name} (${s.aesthetic_category}): Tags: ${s.brand_tags.join(', ')}. Collections: ${s.collection_descriptors.join(', ')}`).join('\n')}\n\nReturn a JSON with: ranked_stores (array of {store_name, match_percentage (0-100), match_explanation, shared_tags}), match_summary (brief overall summary).`

    try {
      const result = await callAIAgent(message, STORE_MATCH_AGENT_ID)
      if (result.success) {
        const parsed = parseAgentResult(result)
        if (parsed) {
          const rankedStores = Array.isArray(parsed.ranked_stores) ? parsed.ranked_stores.map((s: any) => ({
            store_name: s?.store_name ?? '',
            match_percentage: typeof s?.match_percentage === 'number' ? s.match_percentage : 0,
            match_explanation: s?.match_explanation ?? '',
            shared_tags: Array.isArray(s?.shared_tags) ? s.shared_tags : [],
          })) : []
          setStoreMatches(rankedStores)
          setMatchSummary(parsed.match_summary ?? '')
        } else {
          setErrorMessage('Could not parse store matches. Please try again.')
        }
      } else {
        setErrorMessage(result?.error ?? 'Failed to match stores. Please try again.')
      }
    } catch (err) {
      setErrorMessage('An error occurred while matching stores.')
    } finally {
      setIsMatching(false)
      setActiveAgentId(null)
    }
  }, [styleProfile])

  const navigateToDiscover = useCallback(() => {
    setCurrentScreen('discover')
    if (styleProfile && storeMatches.length === 0) {
      handleMatchStores()
    }
  }, [styleProfile, storeMatches, handleMatchStores])

  const handleSelectStore = useCallback((store: Store) => {
    setSelectedStore(store)
    setCurrentScreen('store-detail')
  }, [])

  const handleTabChange = useCallback((tab: 'discover' | 'favorites' | 'profile') => {
    setActiveTab(tab)
    if (tab === 'discover') {
      setCurrentScreen('discover')
    } else if (tab === 'favorites') {
      setCurrentScreen('discover')
    } else {
      setCurrentScreen('profile')
    }
  }, [])

  const handleRetakeQuiz = useCallback(() => {
    setStyleProfile(null)
    setStoreMatches([])
    setMatchSummary('')
    setSelectedStyles([])
    setQuizStarted(true)
    setSampleData(false)
    setCurrentScreen('onboarding')
  }, [])

  const showBottomNav = currentScreen === 'discover' || currentScreen === 'store-detail' || currentScreen === 'profile'

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background text-foreground">
        <div className="max-w-md mx-auto relative min-h-screen bg-card shadow-sm">

          {/* Sample Data Toggle */}
          <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-card border border-border px-3 py-1.5 shadow-sm">
            <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-light cursor-pointer">Sample Data</Label>
            <Switch checked={sampleData} onCheckedChange={setSampleData} />
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 max-w-sm w-full mx-4">
              <div className="bg-destructive/10 border border-destructive/30 px-4 py-3 flex items-start gap-2">
                <FiX className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5 cursor-pointer" onClick={() => setErrorMessage('')} />
                <p className="text-xs text-destructive font-light">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Screens */}
          {currentScreen === 'onboarding' && !quizStarted && (
            <OnboardingWelcome onStart={() => setQuizStarted(true)} />
          )}

          {currentScreen === 'onboarding' && quizStarted && (
            <StyleQuiz
              selectedStyles={selectedStyles}
              onToggle={toggleStyleSelection}
              onSubmit={handleAnalyzeStyle}
              isAnalyzing={isAnalyzing}
            />
          )}

          {currentScreen === 'style-dna' && styleProfile && (
            <StyleDNAScreen profile={styleProfile} onExplore={navigateToDiscover} />
          )}

          {currentScreen === 'discover' && activeTab === 'discover' && (
            <DiscoverScreen
              storeMatches={storeMatches}
              matchSummary={matchSummary}
              isMatching={isMatching}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              onRefresh={handleMatchStores}
              onSelectStore={handleSelectStore}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
              styleProfile={styleProfile}
            />
          )}

          {currentScreen === 'discover' && activeTab === 'favorites' && (
            <div className="min-h-screen pb-24 px-6 py-8">
              <div className="mb-6">
                <p className="uppercase tracking-[0.3em] text-xs text-muted-foreground font-light mb-1">Favorites</p>
                <h2 className="font-serif text-2xl font-light tracking-wider">Saved Stores</h2>
              </div>
              {favorites.length === 0 ? (
                <div className="py-16 text-center">
                  <FiHeart className="w-10 h-10 text-muted-foreground/20 mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground font-light tracking-wider mb-1">No favorites yet</p>
                  <p className="text-xs text-muted-foreground/70 font-light">Tap the heart icon on any store to save it here</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {MOCK_STORES.filter((s) => favorites.includes(s.id)).map((store) => {
                    const match = storeMatches.find((m) => m.store_name === store.name)
                    return (
                      <StoreCard
                        key={store.id}
                        store={store}
                        match={match}
                        onSelect={() => handleSelectStore(store)}
                        isFavorite={true}
                        onToggleFavorite={() => toggleFavorite(store.id)}
                      />
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {currentScreen === 'store-detail' && selectedStore && (
            <StoreDetailScreen
              store={selectedStore}
              match={storeMatches.find((m) => m.store_name === selectedStore.name)}
              onBack={() => setCurrentScreen('discover')}
              isFavorite={favorites.includes(selectedStore.id)}
              onToggleFavorite={() => toggleFavorite(selectedStore.id)}
            />
          )}

          {currentScreen === 'profile' && (
            <ProfileScreen
              profile={styleProfile}
              favorites={favorites}
              onRetakeQuiz={handleRetakeQuiz}
              onSelectStore={handleSelectStore}
            />
          )}

          {/* Agent Status Panel - shown on discover/profile screens */}
          {(currentScreen === 'discover' || currentScreen === 'profile') && (
            <div className="px-4 pb-24">
              <AgentStatusPanel activeAgentId={activeAgentId} />
            </div>
          )}

          {/* Bottom Navigation */}
          {showBottomNav && (
            <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
          )}
        </div>
      </div>
    </ErrorBoundary>
  )
}
