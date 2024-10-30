"use client"

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Volume2, VolumeX, Play, Pause } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface VideoComparisonPlayerProps {
  video1Src: string
  video2Src: string
}

const blendModes = [
  'normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 'color-dodge', 
  'color-burn', 'hard-light', 'soft-light', 'difference', 'exclusion', 'hue', 
  'saturation', 'color', 'luminosity'
]

export function VideoComparisonPlayer({ video1Src, video2Src }: VideoComparisonPlayerProps) {
  const [wipePercentageSliderValue, setWipePercentageSliderValue] = useState(50)
  const [opacitySliderValue, setOpacitySliderValue] = useState(50)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(1)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [offset1, setOffset1] = useState(0)
  const [offset2, setOffset2] = useState(0)
  const [blendMode, setBlendMode] = useState<string>('normal')
  const [isSeeking, setIsSeeking] = useState(false)
  const [audioSource, setAudioSource] = useState<'video1' | 'video2'>('video1')

  const video1Ref = useRef<HTMLVideoElement>(null)
  const video2Ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video1 = video1Ref.current
    const video2 = video2Ref.current

    if (video1 && video2) {
      video1.addEventListener('loadedmetadata', () => setDuration(video1.duration))
      video1.addEventListener('timeupdate', handleTimeUpdate)

      return () => {
        video1.removeEventListener('loadedmetadata', () => setDuration(video1.duration))
        video1.removeEventListener('timeupdate', handleTimeUpdate)
      }
    }
  }, [])

  useCallback(() => {
    const video1 = video1Ref.current
    const video2 = video2Ref.current

    if (video1 && video2) {
      video1.muted = audioSource !== 'video1'
      video2.muted = audioSource !== 'video2'
    }
  }, [audioSource])

  const handleTimeUpdate = () => {
    const video1 = video1Ref.current
    const video2 = video2Ref.current

    if (video1 && video2) {
      setCurrentTime(video1.currentTime)
      video2.currentTime = video1.currentTime - offset1 + offset2
    }
  }

  const togglePlay = () => {
    const video1 = video1Ref.current
    const video2 = video2Ref.current

    if (video1 && video2) {
      if (isPlaying) {
        video1.pause()
        video2.pause()
      } else {
        // video1.currentTime = Math.max(0, offset1)
        // video2.currentTime = Math.max(0, offset2)
        video1.play()
        video2.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleVolumeChange = (newVolume: number) => {
    const video1 = video1Ref.current
    const video2 = video2Ref.current

    if (video1 && video2) {
      video1.volume = newVolume
      video2.volume = newVolume
      setVolume(newVolume)
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const handleOffsetChange = (videoNumber: 1 | 2, value: string) => {
    const offsetValue = parseFloat(value)
    if (!isNaN(offsetValue)) {
      if (videoNumber === 1) {
        setOffset1(offsetValue)
      } else {
        setOffset2(offsetValue)
      }
    }
  }

  const handleSeek = (newTime: number) => {
    const video1 = video1Ref.current
    const video2 = video2Ref.current

    if (video1 && video2) {
      video1.currentTime = newTime
      video2.currentTime = newTime - offset1 + offset2
      setCurrentTime(newTime)
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="relative aspect-video">
        <video
          ref={video1Ref}
          src={video1Src}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ clipPath: `inset(0 ${100 - wipePercentageSliderValue}% 0 0)`, zIndex: 2, opacity: `${opacitySliderValue}%`, mixBlendMode: blendMode as any }}
        />
        <video
          ref={video2Ref}
          src={video2Src}
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-0.5 h-full bg-white opacity-50"  />
        </div> */}
      </div>
      <div className="mt-4">
        <label htmlFor="playheadPosition" className="text-sm font-medium">Playhead</label>
        <Slider
          value={[currentTime]}
          onValueChange={(values) => {
            setIsSeeking(true)
            handleSeek(values[0])
          }}
          onValueCommit={() => setIsSeeking(false)}
          max={duration}
          step={0.1}
          className="w-full"
        />
        <label htmlFor="wipePercentage" className="text-sm font-medium">Wipe Percentage</label>
        <Slider
          id="wipePercentage"
          value={[wipePercentageSliderValue]}
          onValueChange={(values) => setWipePercentageSliderValue(values[0])}
          max={100}
          step={1}
          className="w-full"
        />
        <label htmlFor="offset1" className="text-sm font-medium">Opacity Percentage</label>
        <Slider
          id="opacityPercentage"
          value={[opacitySliderValue]}
          onValueChange={(values) => setOpacitySliderValue(values[0])}
          max={100}
          step={1}
          className="w-full"
        />
      </div>
      <div className="mt-4 flex items-center justify-between">
        <Button onClick={togglePlay} variant="outline" size="icon">
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => handleVolumeChange(volume === 0 ? 1 : 0)}
            variant="outline"
            size="icon"
          >
            {volume === 0 ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
          <Slider
            value={[volume * 100]}
            onValueChange={(values) => handleVolumeChange(values[0] / 100)}
            max={100}
            step={1}
            className="w-24"
          />
        </div>
        <Select value={audioSource} onValueChange={(value: 'video1' | 'video2') => setAudioSource(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select audio source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="video1">Video 1 Audio</SelectItem>
            <SelectItem value="video2">Video 2 Audio</SelectItem>
          </SelectContent>
        </Select>
        <div className="text-sm">
          {formatTime(Math.max(0, currentTime - offset1))} / {formatTime(duration)}
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <label htmlFor="offset1" className="text-sm font-medium">Video 1 Offset:</label>
          <Input
            id="offset1"
            type="number"
            value={offset1}
            onChange={(e) => handleOffsetChange(1, e.target.value)}
            className="w-20"
            step="0.01"
          />
        </div>
        <div className="flex items-center space-x-2">
          <label htmlFor="offset2" className="text-sm font-medium">Video 2 Offset:</label>
          <Input
            id="offset2"
            type="number"
            value={offset2}
            onChange={(e) => handleOffsetChange(2, e.target.value)}
            className="w-20"
            step="0.01"
          />
        </div>
      </div>
      <div className="mt-4">
        <label htmlFor="blendModeSelector" className="text-sm font-medium">Blending Mode</label>
        <Select value={blendMode} onValueChange={setBlendMode}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select blend mode" />
          </SelectTrigger>
          <SelectContent>
            {blendModes.map((mode) => (
              <SelectItem key={mode} value={mode}>
                {mode}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}