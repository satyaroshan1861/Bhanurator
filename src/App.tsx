import { Authenticated, Unauthenticated, useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster, toast } from "sonner";
import { useState } from "react";
import { Id } from "../convex/_generated/dataModel";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm p-4 flex justify-between items-center border-b">
        <h2 className="text-xl font-bold brand-text accent-text">BHANURATOR</h2>
        <SignOutButton />
      </header>
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <Content />
        </div>
      </main>
      <Toaster />
    </div>
  );
}

function Content() {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const websites = useQuery(api.websites.list);
  const generate = useMutation(api.websites.generate);
  const [prompt, setPrompt] = useState("");

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="text-center">
        <h1 className="text-6xl font-bold brand-text accent-text mb-4">BHANURATOR</h1>
        <Authenticated>
          <p className="text-xl text-slate-600">
            Welcome back, {loggedInUser?.email ?? "friend"}!
          </p>
        </Authenticated>
        <Unauthenticated>
          <p className="text-xl text-slate-600">Sign in to start generating websites</p>
        </Unauthenticated>
      </div>

      <Unauthenticated>
        <SignInForm />
      </Unauthenticated>

      <Authenticated>
        <div className="flex flex-col gap-4">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!prompt) return;
              
              try {
                await generate({ prompt });
                setPrompt("");
                toast.success("Generating your website...");
              } catch (error) {
                toast.error("Failed to generate website");
              }
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the website you want to generate..."
              className="flex-1 px-4 py-2 rounded border font-medium"
            />
            <button
              type="submit"
              disabled={!prompt}
              className="px-6 py-2 bg-indigo-500 text-white rounded disabled:opacity-50 font-medium"
            >
              Generate
            </button>
          </form>

          <div className="grid gap-4">
            {websites?.map((website) => (
              <WebsitePreview key={website._id} id={website._id} />
            ))}
          </div>
        </div>
      </Authenticated>
    </div>
  );
}

function WebsitePreview({ id }: { id: Id<"websites"> }) {
  const website = useQuery(api.websites.get, { id });
  if (!website) return null;

  return (
    <div className="border rounded-lg p-4 hover:border-indigo-500 transition-colors">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold brand-text">{website.title}</h3>
        <button
          onClick={() => {
            const win = window.open("", "_blank");
            if (win) {
              win.document.write(website.content);
              win.document.close();
            }
          }}
          className="px-4 py-1.5 bg-indigo-500 text-white text-sm rounded hover:bg-indigo-600 transition-colors font-medium"
        >
          View
        </button>
      </div>
      <p className="text-slate-600">{website.prompt}</p>
    </div>
  );
}
