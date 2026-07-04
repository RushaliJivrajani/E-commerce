'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  History,
  Search,
  Calendar,
  User,
  Shield,
  Loader2,
  Terminal
} from 'lucide-react';

interface Log {
  id: string;
  userEmail: string;
  userName: string;
  role: string;
  action: string;
  details?: string;
  ipAddress?: string;
  timestamp: string;
}

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchLogs = async () => {
    try {
      const url = searchQuery ? `/api/logs?search=${searchQuery}` : '/api/logs';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs);
      } else {
        const err = await res.json();
        toast.error(err.message || 'Unauthorized role access');
      }
    } catch (e) {
      toast.error('Failed to load system activity logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [searchQuery]);

  if (loading && logs.length === 0) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground/80">Loading system audit trails...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header Panel */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground dark:text-white sm:text-3xl flex items-center gap-2">
            System Security Logs <History className="h-6 w-6 text-muted-foreground" />
          </h1>
          <p className="text-sm text-muted-foreground dark:text-muted-foreground/80">
            Real-time audit trials for database modifications, catalog updates, status changes, and authentication sessions.
          </p>
        </div>
      </div>

      {/* Directory Filter Bar */}
      <div className="flex items-center gap-3 max-w-md bg-card dark:bg-foreground text-background/60 rounded-xl border border-border dark:border-slate-800 px-3 py-2 text-sm">
        <Search className="h-4 w-4 text-muted-foreground/80 shrink-0" />
        <input
          type="text"
          placeholder="Filter logs by user, action description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-transparent focus:outline-none dark:text-white text-foreground"
        />
      </div>

      {/* Logs Table */}
      <div className="rounded-2xl border border-border bg-card shadow-sm dark:border-slate-800 dark:bg-foreground text-background/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-muted-foreground dark:text-muted-foreground/80">
            <thead className="text-xs uppercase bg-card/50 dark:bg-slate-950 font-semibold border-b border-border dark:border-slate-800 text-muted-foreground/80">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Administrator User</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Context Details</th>
                <th className="px-6 py-4 text-center">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {logs.map((l) => (
                <tr key={l.id} className="hover:bg-card/50/50 dark:hover:bg-slate-950/20 text-xs">
                  
                  <td className="px-6 py-3.5 font-mono text-muted-foreground/80 whitespace-nowrap">
                    {new Date(l.timestamp).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </td>

                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-2">
                      <User className="h-3.5 w-3.5 text-muted-foreground/80 shrink-0" />
                      <div>
                        <span className="font-semibold text-foreground dark:text-white block">{l.userName}</span>
                        <span className="text-[10px] text-muted-foreground/80">{l.userEmail}</span>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-3.5">
                    <span className="inline-flex items-center gap-1 font-bold text-muted-foreground dark:text-muted-foreground/80">
                      <Terminal className="h-3.5 w-3.5" /> {l.action}
                    </span>
                  </td>

                  <td className="px-6 py-3.5 text-foreground/90 dark:text-muted-foreground/50 font-medium">
                    {l.details || 'No detail logs.'}
                  </td>

                  <td className="px-6 py-3.5 text-center font-mono text-muted-foreground/80 whitespace-nowrap">
                    {l.ipAddress || '127.0.0.1'}
                  </td>

                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-muted-foreground/80">No security audit logs found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
