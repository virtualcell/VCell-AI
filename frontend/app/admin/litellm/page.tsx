"use client";

import { useEffect, useState } from "react";
import { getAccessToken } from "@auth0/nextjs-auth0/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SignInOutButton } from "@/components/sign-in-out-button";
import { Gauge, Users, ShieldCheck, Save } from "lucide-react";

interface ManagedUser {
  user_id: string;
  user_email: string | null;
  spend: number;
  max_budget: number | null;
  budget_duration: string | null;
}

interface UpdateResult {
  total_users: number;
  successful_updates: number;
  failed_updates: number;
  failed_user_ids: string[];
}

// Values are LiteLLM duration strings; labels match the LiteLLM dashboard.
const RESET_OPTIONS = [
  { value: "1h", label: "hourly" },
  { value: "24h", label: "daily" },
  { value: "7d", label: "weekly" },
  { value: "30d", label: "monthly" },
];

const formatUsd = (value: number | null): string => {
  if (value === null) return "Unlimited";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 4,
  }).format(value);
};

const formatDuration = (value: string | null): string => {
  if (!value) return "Never resets";
  return RESET_OPTIONS.find((option) => option.value === value)?.label ?? value;
};

export default function LiteLLMAdminPage() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [maxBudget, setMaxBudget] = useState("2");
  const [budgetDuration, setBudgetDuration] = useState("30d");
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<UpdateResult | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const token = await getAccessToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/litellm/users`,
        {
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
      const data = await res.json();
      setUsers(data.users ?? []);
    } catch {
      setError("Failed to load LiteLLM users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSave = async () => {
    const parsedBudget = Number(maxBudget);
    if (!Number.isFinite(parsedBudget) || parsedBudget < 0) {
      setError("Max budget must be a number greater than or equal to 0");
      return;
    }

    if (
      !window.confirm(
        `Set every user's budget to ${formatUsd(parsedBudget)}, resetting ${formatDuration(
          budgetDuration,
        )}? This applies to all ${users.length} users below.`,
      )
    ) {
      return;
    }

    try {
      setSaving(true);
      setError("");
      setResult(null);
      const token = await getAccessToken();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/litellm/budgets`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            max_budget: parsedBudget,
            budget_duration: budgetDuration,
          }),
        },
      );
      if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
      setResult((await res.json()) as UpdateResult);
      await fetchUsers();
    } catch {
      setError("Failed to update budgets");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto p-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-extrabold text-blue-900 flex items-center gap-3">
                <Gauge className="h-8 w-8 text-blue-500" />
                LiteLLM Budgets
              </h1>
              <p className="text-slate-600 mt-2">
                Set the max budget and reset frequency for every user at once
              </p>
            </div>
            <SignInOutButton />
          </div>
        </div>

        {/* Bulk update form */}
        <Card className="shadow-lg border-slate-200 mb-8">
          <CardHeader className="bg-gradient-to-r from-blue-100 to-blue-50 border-b border-slate-200 px-6 py-5">
            <CardTitle className="text-2xl font-extrabold text-blue-900 flex items-center gap-3">
              <Users className="h-6 w-6 text-blue-500" />
              Update All User Budgets
              <Badge className="ml-2 bg-blue-600 text-white">
                {users.length} users
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="flex items-start gap-2 rounded border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <ShieldCheck className="h-4 w-4 mt-0.5 shrink-0 text-amber-600" />
              <span>
                The LiteLLM proxy admin (<code>default_user_id</code>) is always
                excluded and keeps its unlimited budget.
              </span>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="max-budget">Max Budget (USD)</Label>
                <Input
                  id="max-budget"
                  type="number"
                  min="0"
                  step="0.01"
                  value={maxBudget}
                  onChange={(e) => setMaxBudget(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reset-budget">Reset Budget</Label>
                <Select value={budgetDuration} onValueChange={setBudgetDuration}>
                  <SelectTrigger id="reset-budget">
                    <SelectValue placeholder="Select a reset frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    {RESET_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            {result && (
              <div className="rounded border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                Updated {result.successful_updates} of {result.total_users}{" "}
                users
                {result.failed_updates > 0 && (
                  <>
                    {" "}
                    &mdash; {result.failed_updates} failed:{" "}
                    {result.failed_user_ids.join(", ")}
                  </>
                )}
              </div>
            )}

            <div className="flex justify-end">
              <Button
                onClick={handleSave}
                disabled={saving || loading || users.length === 0}
                className="inline-flex items-center gap-2 px-4 py-2 rounded bg-blue-600 text-white font-semibold shadow-sm transition-colors hover:bg-blue-700"
              >
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Affected users */}
        <Card className="shadow-lg border-slate-200">
          <CardHeader className="bg-gradient-to-r from-blue-100 to-blue-50 border-b border-slate-200 px-6 py-5">
            <CardTitle className="text-2xl font-extrabold text-blue-900 flex items-center gap-3">
              <Users className="h-6 w-6 text-blue-500" />
              Affected Users
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center text-slate-600">
                Loading users...
              </div>
            ) : users.length === 0 ? (
              <div className="p-8 text-center text-slate-600">
                No LiteLLM users found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-left text-slate-600">
                    <tr>
                      <th className="px-6 py-3 font-medium">Email</th>
                      <th className="px-6 py-3 font-medium">User ID</th>
                      <th className="px-6 py-3 font-medium">Spend</th>
                      <th className="px-6 py-3 font-medium">Max Budget</th>
                      <th className="px-6 py-3 font-medium">Resets</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr
                        key={user.user_id}
                        className="border-t border-slate-200"
                      >
                        <td className="px-6 py-3 text-slate-800">
                          {user.user_email ?? "—"}
                        </td>
                        <td className="px-6 py-3 font-mono text-xs text-slate-500">
                          {user.user_id}
                        </td>
                        <td className="px-6 py-3 text-slate-800">
                          {formatUsd(user.spend)}
                        </td>
                        <td className="px-6 py-3 text-slate-800">
                          {formatUsd(user.max_budget)}
                        </td>
                        <td className="px-6 py-3 text-slate-800">
                          {formatDuration(user.budget_duration)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
