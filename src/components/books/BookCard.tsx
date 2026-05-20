import Link from 'next/link';
import Image from 'next/image';

interface BookProps {
  id: string;
  title: string;
  author: string;
  originalPrice: number;
  sellingPrice: number;
  condition: string;
  location: string;
  imageUrl: string;
}

export function BookCard({ id, title, author, originalPrice, sellingPrice, condition, location, imageUrl }: BookProps) {
  const discount = originalPrice > 0 ? Math.round(((originalPrice - sellingPrice) / originalPrice) * 100) : 0;

  return (
    <div className="group relative flex flex-col rounded-2xl bg-white shadow-sm border border-zinc-100 hover:shadow-md transition-all dark:bg-zinc-900 dark:border-zinc-800 overflow-hidden">
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        {imageUrl ? (
          <img src={imageUrl} alt={title} className="object-cover w-full h-full" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-zinc-400">No Image</div>
        )}
        {discount > 0 && <div className="absolute top-2 right-2 bg-emerald-600 text-white text-xs font-bold px-2 py-1 rounded-full z-10">-{discount}%</div>}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full dark:bg-amber-900/20 uppercase tracking-wider">{condition}</span>
          <span className="text-xs text-zinc-500 line-clamp-1">{location}</span>
        </div>
        <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-emerald-600 transition-colors">{title}</h3>
        <p className="text-sm text-zinc-500 mb-2">{author}</p>
        <div className="mt-auto pt-2 flex items-end gap-2">
          <span className="text-xl font-bold text-zinc-900 dark:text-white">Rs. {sellingPrice}</span>
          {originalPrice > 0 && <span className="text-sm text-zinc-400 line-through mb-0.5">Rs. {originalPrice}</span>}
        </div>
        <Link href={`/books/${id}`} className="mt-4 w-full block text-center rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-200 transition-colors">
          View Details
        </Link>
      </div>
    </div>
  );
}