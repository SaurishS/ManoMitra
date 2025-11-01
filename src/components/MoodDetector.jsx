import React, { useEffect, useRef, useState } from 'react'
import * as faceapi from 'face-api.js'

const MoodDetector = ({ onMoodDetected, hideVideo = false }) => {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [isModelLoaded, setIsModelLoaded] = useState(false)

  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceLandmark68TinyNet.loadFromUri('/models'),
          faceapi.nets.faceExpressionNet.loadFromUri('/models')
        ])
        setIsModelLoaded(true)
        startVideo()
      } catch (error) {
        console.error('Error loading models:', error)
      }
    }

    loadModels()
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks()
        tracks.forEach(track => track.stop())
      }
    }
  }, [])

  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      videoRef.current.srcObject = stream
    } catch (error) {
      console.error('Error accessing camera:', error)
    }
  }

  const detectMood = async () => {
    if (videoRef.current && isModelLoaded) {
      const detections = await faceapi
        .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks(true)
        .withFaceExpressions()

      if (detections && detections[0]?.expressions) {
        const expressions = detections[0].expressions
        const mood = Object.entries(expressions).reduce((a, b) => 
          expressions[a] > expressions[b[0]] ? a : b[0]
        )
        onMoodDetected(mood)
      }
    }
  }

  useEffect(() => {
    if (isModelLoaded) {
      const interval = setInterval(detectMood, 1000)
      return () => clearInterval(interval)
    }
  }, [isModelLoaded])

  return (
    <div className="relative">
      <video
        ref={videoRef}
        autoPlay
        muted
        className={`w-full max-w-md mx-auto ${hideVideo ? 'hidden' : ''}`}
        onPlay={() => {
          if (canvasRef.current) {
            const displaySize = {
              width: videoRef.current.videoWidth,
              height: videoRef.current.videoHeight
            }
            faceapi.matchDimensions(canvasRef.current, displaySize)
          }
        }}
      />
      <canvas ref={canvasRef} className="absolute top-0 left-0" />
    </div>
  )
}

export default MoodDetector