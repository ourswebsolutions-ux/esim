import Navbar from "../../components/nav";
import LeftSidebar from "../../components/LeftSidebar";
import Login from "../../components/login";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-black">
      <Navbar />

      <main className="min-h-0 flex-1">
        <div className="grid min-h-[calc(100vh-64px)] grid-cols-1 lg:grid-cols-12">

          <div className="hidden lg:block lg:col-span-2" />

          <aside className="min-h-0 lg:col-span-3">
            <LeftSidebar />
          </aside>

          <section className="min-w-0 px-6 lg:col-span-6">
            <div className="w-full">
              <Login initialMode="login" />
            </div>
          </section>

          <div className="hidden lg:block lg:col-span-1" />

        </div>
      </main>
    </div>
  );
}