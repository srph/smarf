import React from 'react'

interface Props {
  src: string
  // width:height, e.g. "16:9"
  value: string
  alt?: string
}

const ImageAspectRatio: React.FC<Props> = ({ value, src, alt }) => {
  const [w, h] = value.split(':')

  return <img src={src} alt={alt} className="w-full" style={{ aspectRatio: `${w} / ${h}` }} />
}

export { ImageAspectRatio }
