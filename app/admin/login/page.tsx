"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Card } from "@/components/shared/Card";
import { Container } from "@/components/shared/Container";
import { createClient } from "@/lib/supabase/browser";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setErrorMessage(error.message || "Accesso non riuscito");
      setIsSubmitting(false);
      return;
    }

    await supabase.auth.getSession();

    router.replace("/admin");
  };

  return (
    <section className="min-w-0 py-8 md:py-12">
      <Container className="max-w-md min-w-0">
        <Card>
          <h1 className="text-2xl font-semibold text-gray-900">Login Admin</h1>
          <p className="mt-2 text-sm text-gray-600">Accedi con email e password del tuo account Supabase.</p>

          <form onSubmit={onSubmit} className="mt-6 space-y-5">
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="min-h-11 w-full rounded-lg border border-border px-3 py-2 text-base text-gray-900 outline-none ring-primary/20 focus:ring md:text-sm"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="min-h-11 w-full rounded-lg border border-border px-3 py-2 text-base text-gray-900 outline-none ring-primary/20 focus:ring md:text-sm"
              />
            </div>

            {errorMessage ? (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{errorMessage}</p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="min-h-11 w-full rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Accesso..." : "Accedi"}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-gray-500">
            <Link href="/admin/dashboard" className="text-primary hover:underline">
              Vai alla dashboard
            </Link>{" "}
            (dopo il login)
          </p>
        </Card>
      </Container>
    </section>
  );
}
