import Navbar from "../components/nav";

import Home from "../components/home";
import LeftSidebar from "../components/LeftSidebar";
export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-black">
      {/* TOP NAVBAR */}
      <Navbar />

      {/* MAIN BODY */}
      <main className="min-h-0 flex-1">
        <div className="grid min-h-[calc(100vh-64px)] grid-cols-1 lg:grid-cols-12">

          {/* LEFT EMPTY SPACE — 2/12 */}
          <div className="hidden lg:block lg:col-span-2" />

          {/* LEFT SIDEBAR — 3/12 */}
          <aside className="min-h-0 lg:col-span-3">
            <LeftSidebar />
          </aside>

          {/* RIGHT CONTENT — 6/12 */}
          <section className="min-w-0 px-6 lg:col-span-6">
            <div className="w-full">
              <Home />
            </div>
          </section>

          {/* RIGHT EMPTY SPACE — 1/12 */}
          <div className="hidden lg:block lg:col-span-1" />

        </div>
      </main>
    </div>
  );
}