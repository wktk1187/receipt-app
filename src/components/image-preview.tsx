"use client"

import { useState } from "react"
import Image from "next/image"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ImagePreviewProps {
  src: string;
}

export function ImagePreview({ src }: ImagePreviewProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <div
        className="w-full max-w-[500px] mx-auto cursor-pointer hover:opacity-90 transition-opacity border border-gray-200 rounded-lg overflow-hidden p-2"
        onClick={() => setIsExpanded(true)}
      >
        {/* Next.jsのImageコンポーネントの代わりに通常のimgタグを使用 */}
        <img
          src={src}
          alt="Uploaded image"
          className="w-full h-auto max-h-[400px] object-contain rounded-lg"
        />
      </div>

      {/* 拡大表示モーダル */}
      {isExpanded && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl max-h-[80vh] overflow-auto">
            {/* 拡大表示でも通常のimgタグを使用 */}
            <img
              src={src}
              alt="Expanded image"
              className="w-full h-auto object-contain"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/20"
            onClick={() => setIsExpanded(false)}
          >
            <X className="h-6 w-6" />
          </Button>
        </div>
      )}
    </>
  )
}
