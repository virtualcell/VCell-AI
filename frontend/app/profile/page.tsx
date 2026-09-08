"use client";

import { useCallback, useEffect, useState } from "react";
import { getAccessToken } from "@auth0/nextjs-auth0/client";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  Link2,
  Link2Off,
  Loader2,
  Mail,
  UserPlus,
  UserRound,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { SignInOutButton } from "@/components/sign-in-out-button";
import { messageFromErrorResponse } from "@/lib/api-error";

interface MappedUser {
  mapped: boolean;
  userName: string | null;
  id: number | null;
  subject: string | null;
  insertDate: string | null;
}

type ActionResponse = { status: string; message: string };

/**
 * VCell sends insertDate as a Java Timestamp string ("2024-01-02 03:04:05.0"),
 * which isn't ISO-8601 and doesn't parse reliably across browsers. Fall back to
 * showing it verbatim rather than rendering "Invalid Date".
 */
const formatLinkedDate = (insertDate: string | null): string | null => {
  if (!insertDate) return null;

  const parsed = new Date(insertDate.replace(" ", "T"));
  if (Number.isNaN(parsed.getTime())) return insertDate;

  return parsed.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function ProfilePage() {
  const [mappedUser, setMappedUser] = useState<MappedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // "Already have an account" card, which toggles between linking and recovery.
  const [linkUserID, setLinkUserID] = useState("");
  const [linkPassword, setLinkPassword] = useState("");
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");

  // "New to VCell" card.
  const [newUserID, setNewUserID] = useState("");

  const [confirmUnlinkOpen, setConfirmUnlinkOpen] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const fetchMappedUser = useCallback(
    async (signal?: AbortSignal) => {
      const token = await getAccessToken();
      if (!apiUrl) throw new Error("NEXT_PUBLIC_API_URL is not configured");

      const response = await fetch(`${apiUrl}/users/vcell/mapped`, {
        headers: {
          Authorization: `Bearer ${token}`,
          accept: "application/json",
        },
        signal,
      });
      if (!response.ok) {
        throw new Error(
          await messageFromErrorResponse(response, "Failed to load your VCell account"),
        );
      }

      return (await response.json()) as MappedUser;
    },
    [apiUrl],
  );

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      try {
        setLoading(true);
        setMappedUser(await fetchMappedUser(controller.signal));
        setLoadError("");
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error("Failed to load VCell account link", err);
          setLoadError("Failed to load your VCell account link");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    load();

    return () => {
      controller.abort();
    };
  }, [fetchMappedUser]);

  /**
   * Run a link/create/unlink action, then re-read the mapping from the server.
   * Deliberately not optimistic: VCell is the source of truth for what's linked.
   */
  const runAction = async (
    request: () => Promise<Response>,
    fallbackError: string,
    options: { refetch: boolean },
  ) => {
    setSubmitting(true);
    setError("");
    setNotice("");

    try {
      const response = await request();
      if (!response.ok) {
        setError(await messageFromErrorResponse(response, fallbackError));
        return;
      }

      const { message } = (await response.json()) as ActionResponse;

      if (options.refetch) {
        try {
          setMappedUser(await fetchMappedUser());
          setLinkUserID("");
          setLinkPassword("");
          setNewUserID("");
        } catch (refetchErr) {
          console.error("Failed to refresh VCell account link", refetchErr);
          setNotice(
            `${message} (Couldn't refresh this page — reload it to see the current state.)`,
          );
          return;
        }
      }
      setNotice(message);
    } catch (err) {
      console.error(fallbackError, err);
      setError(fallbackError);
    } finally {
      setSubmitting(false);
    }
  };

  const authorizedPost = async (path: string, body: unknown) => {
    const token = await getAccessToken();
    if (!apiUrl) throw new Error("NEXT_PUBLIC_API_URL is not configured");

    return fetch(`${apiUrl}${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  };

  const handleLink = (event: React.FormEvent) => {
    event.preventDefault();
    return runAction(
      () =>
        authorizedPost("/users/vcell/map", {
          userID: linkUserID.trim(),
          password: linkPassword,
        }),
      "Could not link your VCell account",
      { refetch: true },
    );
  };

  const handleRecover = (event: React.FormEvent) => {
    event.preventDefault();
    // The magic link is redeemed on VCell's side, so nothing changes here yet.
    return runAction(
      () =>
        authorizedPost("/users/vcell/recover", {
          userID: linkUserID.trim(),
          email: recoveryEmail.trim(),
        }),
      "Could not send the recovery email",
      { refetch: false },
    );
  };

  const handleCreate = (event: React.FormEvent) => {
    event.preventDefault();
    return runAction(
      () => authorizedPost("/users/vcell/new", { userID: newUserID.trim() }),
      "Could not create your VCell account",
      { refetch: true },
    );
  };

  const handleUnlink = async () => {
    setConfirmUnlinkOpen(false);
    await runAction(
      async () => {
        const token = await getAccessToken();
        if (!apiUrl) throw new Error("NEXT_PUBLIC_API_URL is not configured");

        const query = new URLSearchParams({
          userName: mappedUser?.userName ?? "",
        });
        return fetch(`${apiUrl}/users/vcell/mapped?${query.toString()}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            accept: "application/json",
          },
        });
      },
      "Could not unlink your VCell account",
      { refetch: true },
    );
  };

  const linkedDate = formatLinkedDate(mappedUser?.insertDate ?? null);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto p-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-extrabold text-blue-900 flex items-center gap-3">
                <UserRound className="h-8 w-8 text-blue-500" />
                Profile
              </h1>
              <p className="text-slate-600 mt-2">
                Link your VCell account to use your models and simulations here
              </p>
            </div>
            <SignInOutButton />
          </div>
        </div>

        {/* Inline banners — kept above the forms rather than replacing the page,
            so a failed submit doesn't unmount what the user just typed. */}
        {error && (
          <Alert variant="destructive" className="mb-6 bg-white">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {notice && (
          <Alert className="mb-6 border-blue-200 bg-blue-50 text-blue-900">
            <Info className="h-4 w-4" />
            <AlertTitle>Heads up</AlertTitle>
            <AlertDescription>{notice}</AlertDescription>
          </Alert>
        )}

        {loadError && !loading && (
          <Alert variant="destructive" className="mb-6 bg-white">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Couldn&apos;t load your account</AlertTitle>
            <AlertDescription>{loadError}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <Card className="shadow-lg border-slate-200">
            <CardHeader className="bg-gradient-to-r from-blue-100 to-blue-50 border-b border-slate-200 px-6 py-5">
              <Skeleton className="h-7 w-64" />
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-10 w-40" />
            </CardContent>
          </Card>
        ) : mappedUser?.mapped ? (
          /* ---------- Linked ---------- */
          <Card className="shadow-lg border-slate-200">
            <CardHeader className="bg-gradient-to-r from-blue-100 to-blue-50 border-b border-slate-200 px-6 py-5">
              <CardTitle className="text-2xl font-extrabold text-blue-900 flex items-center gap-3">
                <Link2 className="h-6 w-6 text-blue-500" />
                VCell account
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-slate-900">
                    Your VCell username is{" "}
                    <span className="font-semibold">{mappedUser.userName}</span>
                  </p>
                  {linkedDate && (
                    <p className="text-sm text-slate-500 mt-1">
                      Linked on {linkedDate}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-200">
                <Button
                  variant="outline"
                  onClick={() => setConfirmUnlinkOpen(true)}
                  disabled={submitting}
                  className="text-red-700 border-red-300 hover:bg-red-50 hover:text-red-800"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Link2Off className="h-4 w-4" />
                  )}
                  Unlink account
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* ---------- Not linked ---------- */
          <div className="grid gap-6 lg:grid-cols-2 items-start">
            {/* Existing VCell account */}
            <Card className="shadow-lg border-slate-200">
              <CardHeader className="bg-gradient-to-r from-blue-100 to-blue-50 border-b border-slate-200 px-6 py-5">
                <CardTitle className="text-xl font-extrabold text-blue-900 flex items-center gap-3">
                  <Link2 className="h-5 w-5 text-blue-500" />
                  Already have a VCell account?
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {recoveryMode ? (
                  <form onSubmit={handleRecover} className="space-y-4">
                    <p className="text-sm text-slate-600">
                      We&apos;ll email you a link to finish connecting your
                      account.
                    </p>
                    <div className="space-y-2">
                      <Label htmlFor="recover-username">VCell username</Label>
                      <Input
                        id="recover-username"
                        value={linkUserID}
                        onChange={(e) => setLinkUserID(e.target.value)}
                        placeholder="your VCell username"
                        autoComplete="username"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="recover-email">Email</Label>
                      <Input
                        id="recover-email"
                        type="email"
                        value={recoveryEmail}
                        onChange={(e) => setRecoveryEmail(e.target.value)}
                        placeholder="email on your VCell account"
                        autoComplete="email"
                        required
                      />
                    </div>
                    <div className="flex items-center gap-3 pt-2">
                      <Button
                        type="submit"
                        disabled={
                          submitting ||
                          !linkUserID.trim() ||
                          !recoveryEmail.trim()
                        }
                      >
                        {submitting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Mail className="h-4 w-4" />
                        )}
                        Send recovery email
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          setRecoveryMode(false);
                          setError("");
                          setNotice("");
                        }}
                      >
                        Back
                      </Button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleLink} className="space-y-4">
                    <p className="text-sm text-slate-600">
                      Sign in with your existing VCell credentials to connect it
                      to this login.
                    </p>
                    <div className="space-y-2">
                      <Label htmlFor="link-username">VCell username</Label>
                      <Input
                        id="link-username"
                        value={linkUserID}
                        onChange={(e) => setLinkUserID(e.target.value)}
                        placeholder="your VCell username"
                        autoComplete="username"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="link-password">VCell password</Label>
                      <Input
                        id="link-password"
                        type="password"
                        value={linkPassword}
                        onChange={(e) => setLinkPassword(e.target.value)}
                        placeholder="your VCell password"
                        autoComplete="current-password"
                        required
                      />
                    </div>
                    <div className="flex items-center gap-3 pt-2">
                      <Button
                        type="submit"
                        disabled={
                          submitting || !linkUserID.trim() || !linkPassword
                        }
                      >
                        {submitting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Link2 className="h-4 w-4" />
                        )}
                        Link account
                      </Button>
                      <Button
                        type="button"
                        variant="link"
                        className="px-0 text-slate-600"
                        onClick={() => {
                          setRecoveryMode(true);
                          setError("");
                          setNotice("");
                        }}
                      >
                        Forgot my password
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>

            {/* New VCell account */}
            <Card className="shadow-lg border-slate-200">
              <CardHeader className="bg-gradient-to-r from-emerald-100 to-emerald-50 border-b border-slate-200 px-6 py-5">
                <CardTitle className="text-xl font-extrabold text-emerald-900 flex items-center gap-3">
                  <UserPlus className="h-5 w-5 text-emerald-600" />
                  New to VCell?
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleCreate} className="space-y-4">
                  <p className="text-sm text-slate-600">
                    Pick a username and we&apos;ll create a VCell account linked
                    to this login. Your name and email come from the account
                    you&apos;re already signed in with.
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="new-username">Choose a VCell username</Label>
                    <Input
                      id="new-username"
                      value={newUserID}
                      onChange={(e) => setNewUserID(e.target.value)}
                      placeholder="e.g. jdoe"
                      autoComplete="off"
                      required
                    />
                  </div>
                  <div className="pt-2">
                    <Button
                      type="submit"
                      disabled={submitting || !newUserID.trim()}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      {submitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <UserPlus className="h-4 w-4" />
                      )}
                      Create and link account
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Unlink confirmation — alert-dialog isn't generated in this project, so
          Dialog stands in for it. */}
      <Dialog open={confirmUnlinkOpen} onOpenChange={setConfirmUnlinkOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unlink your VCell account?</DialogTitle>
            <DialogDescription>
              This will disconnect the VCell username{" "}
              <span className="font-semibold">{mappedUser?.userName}</span> from
              this login. There is no undo — you would have to link the account
              again from scratch, and you&apos;ll need your VCell password or
              access to the account&apos;s email to do it.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmUnlinkOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleUnlink}>
              <Link2Off className="h-4 w-4" />
              Unlink account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
