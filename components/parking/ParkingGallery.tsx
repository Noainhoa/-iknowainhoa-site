import Image from "next/image";

const PHOTOS = [
  {
    src: "/images/parking/plaza-1.jpg",
    width: 900,
    height: 509,
    priority: true,
  },
  {
    src: "/images/parking/plaza-2.jpg",
    width: 659,
    height: 900,
    priority: false,
  },
  {
    src: "/images/parking/plaza-3.jpg",
    width: 900,
    height: 673,
    priority: false,
  },
] as const;

type ParkingGalleryProps = {
  galleryLabel: string;
  spaceFact: string;
  photoAlts: [string, string, string] | string[];
};

export default function ParkingGallery({
  galleryLabel,
  spaceFact,
  photoAlts,
}: ParkingGalleryProps) {
  return (
    <section className="pk-space" aria-label={galleryLabel}>
      <div className="pk-gallery" role="group" aria-label={galleryLabel}>
        {PHOTOS.map((photo, i) => (
          <figure key={photo.src} className="pk-gallery-item">
            <Image
              src={photo.src}
              alt={photoAlts[i] ?? ""}
              width={photo.width}
              height={photo.height}
              sizes="(max-width: 560px) 100vw, 520px"
              priority={photo.priority}
              loading={photo.priority ? "eager" : "lazy"}
              fetchPriority={photo.priority ? "high" : "low"}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </figure>
        ))}
      </div>
      <p className="pk-space-facts">{spaceFact}</p>
    </section>
  );
}
