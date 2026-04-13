import Link from 'next/link';
import { getAllPosts } from '../../lib/posts';

export const metadata = {
  title: 'Blogs - Abhilaksh Chauhan',
};

export default async function BlogsPage() {
  const posts = await getAllPosts();

  return (
    <div className="min-h-screen relative font-sans selection:bg-[#FF1F1F] selection:text-white pb-32">
      <div className="fixed inset-0 z-0 theme-bg-gradient-main pointer-events-none" />

      <nav
        className="fixed bottom-8 left-8 md:bottom-12 md:left-12 z-50 flex flex-col items-start gap-1"
        id="nav-menu"
        data-nav-menu
        data-mobile-open="true"
      >
        <Link href="/" className="nav-btn text-lg md:text-xl transition-all duration-300 text-[#BDBDBD] hover:text-white border-b border-transparent">
          Home
        </Link>
        <Link href="/#about" className="nav-btn text-lg md:text-xl transition-all duration-300 text-[#BDBDBD] hover:text-white border-b border-transparent">
          About me
        </Link>
        <Link href="/#works" className="nav-btn text-lg md:text-xl transition-all duration-300 text-[#BDBDBD] hover:text-white border-b border-transparent">
          Projects
        </Link>
        <Link href="/blogs" className="nav-btn text-lg md:text-xl transition-all duration-300 text-[#C83030] font-medium border-b border-[#C83030]">
          Blogs
        </Link>
        <Link href="/resume.pdf" target="_blank" rel="noopener noreferrer" className="nav-btn text-lg md:text-xl transition-all duration-300 text-[#BDBDBD] hover:text-white border-b border-transparent">
          Resume{' '}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="inline-block w-4 h-4 ml-1 align-[-0.1em] transform -rotate-45">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        </Link>
        <button
          type="button"
          data-theme-toggle
          aria-label="Switch theme"
          className="theme-toggle-btn text-lg md:text-xl transition-all duration-300 text-[#BDBDBD] hover:text-white border-b border-transparent inline-flex items-center gap-2"
        >
          <span data-theme-toggle-label>Dark mode</span>
          <span data-theme-toggle-icon data-theme-icon-state="dark" aria-hidden="true" className="inline-flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1 1 11.21 3c0 .18-.01.36-.01.54A7.5 7.5 0 0 0 20.46 12c.18 0 .36-.01.54-.01z" />
            </svg>
          </span>
        </button>
      </nav>

      <button
        type="button"
        className="mobile-nav-toggle"
        data-mobile-nav-toggle
        data-nav-target="nav-menu"
        aria-controls="nav-menu"
        aria-expanded="false"
        aria-label="Open navigation menu"
      >
        <span className="mobile-nav-toggle-icon" aria-hidden="true">
          <span className="mobile-nav-toggle-line" />
          <span className="mobile-nav-toggle-line" />
          <span className="mobile-nav-toggle-line" />
        </span>
      </button>

      <main className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 pt-16 md:pt-32 flex flex-col gap-24">
        <header className="flex flex-col gap-8 max-w-3xl">
          <h1 className="text-5xl sm:text-6xl md:text-8xl font-serif text-white tracking-tight leading-[1.1]">
            Blogs <span className="italic text-[#FF1F1F] font-light">&</span> Ramblings.
          </h1>
          <p className="text-xl md:text-2xl text-[#BDBDBD] font-light leading-relaxed">
            Documenting engineering adventures, aesthetic rants, and a healthy obsession with optimizing everything.
          </p>
        </header>

        <section className="flex flex-col gap-8 md:gap-10 w-full">
          {posts.map((post, index) => {
            return (
              <article key={post.id} className="group relative w-full outline-none transition-transform duration-500 hover:scale-[1.01]">
                <Link href={`/article/${post.id}`} className="absolute inset-0 z-10" aria-label={`Read ${post.title}`} />

                <div className="blog-card-shell relative flex flex-col lg:flex-row gap-8 lg:gap-10 rounded-[1.75rem] border border-[#4A4A4A]/20 bg-[#070714]/40 p-4 md:p-5 lg:p-6 overflow-hidden">
                  <div className="blog-card-media relative bg-[#11112b] rounded-[1.5rem] overflow-hidden border border-[#4A4A4A]/20 shadow-2xl transition-shadow duration-500 w-full lg:w-[44%] aspect-[16/10] lg:min-h-[22rem] mb-0 shrink-0">
                    {post.coverImage ? (
                      <img src={post.coverImage} alt={post.title} className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <div className="blog-card-placeholder absolute inset-0 flex items-center justify-center font-mono text-[#4A4A4A]">
                        IMAGE REF
                      </div>
                    )}
                    <div className={`blog-card-gradient absolute inset-0 opacity-80 ${post.gradientClass}`} />
                  </div>

                  <div className="flex flex-col lg:w-[56%]">
                    <div className="flex items-center gap-4 mb-4 relative z-20 pointer-events-none">
                      <div className="text-xs font-mono text-[#4A4A4A] tracking-widest uppercase transition-colors group-hover:text-[#FF1F1F]">
                        {post.date}
                      </div>
                      <span className="text-[10px] font-mono text-[#FF1F1F] bg-[#FF1F1F]/10 uppercase tracking-widest px-3 py-1 rounded-full">
                        {post.category}
                      </span>
                      {index === 0 ? (
                        <span className="text-[10px] font-mono text-white bg-white/10 uppercase tracking-widest px-3 py-1 rounded-full border border-white/20">
                          Most Recent
                        </span>
                      ) : null}
                    </div>

                    <h2 className="blog-card-title font-sans font-medium text-white mb-3 tracking-tight transition-colors duration-500 group-hover:text-[#FF1F1F] text-3xl md:text-4xl lg:text-5xl">
                      {post.title}
                    </h2>

                    <p className="text-[#BDBDBD] leading-relaxed mb-6 text-lg md:text-xl max-w-3xl">{post.excerpt}</p>

                    <div className="blog-card-arrow mt-auto inline-flex items-center justify-center w-12 h-12 rounded-full border border-[#4A4A4A]/30 text-white group-hover:bg-[#FF1F1F] group-hover:border-[#FF1F1F] group-hover:shadow-[0_0_20px_rgba(255,31,31,0.4)] transition-all duration-300">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 transform -rotate-45">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                      </svg>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        <footer className="mt-8 text-[#4A4A4A] flex flex-col md:flex-row justify-between items-start md:items-center text-xs md:text-sm font-mono tracking-widest uppercase">
          <p>© 2026 Abhilaksh Chauhan</p>
        </footer>
      </main>
    </div>
  );
}
