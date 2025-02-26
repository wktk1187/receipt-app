"use client"

import Image from "next/image"

interface ImagePreviewProps {
  src: string;
}

export function ImagePreview({ src }: ImagePreviewProps) {
  return (
    <div className="relative aspect-square">
      <Image
        src={src}
        alt="Uploaded image"
        fill
        className="object-cover rounded-lg"
      />
    </div>
  )
}
