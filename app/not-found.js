import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen grid place-items-center px-6">
      <div className="text-center">
        <h1 className="font-serif text-5xl md:text-7xl mb-6">Not found</h1>
        <p className="text-[#BDBDBD] mb-8">That page doesn’t exist yet.</p>
        <Link href="/blogs" className="text-[#C83030] hover:text-white transition-colors">Go to blogs</Link>
      </div>
    </main>
  );
}
