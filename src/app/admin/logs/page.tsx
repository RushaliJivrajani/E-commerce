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
          <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
          <p className="text-sm text-slate-400">Loading system audit trails...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header Panel */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl flex items-center gap-2">
            System Security Logs <History className="h-6 w-6 text-slate-500" />
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Real-time audit trials for database modifications, catalog updates, status changes, and authentication sessions.
          </p>
        </div>
      </div>

      {/* Directory Filter Bar */}
      <div className="flex items-center gap-3 max-w-md bg-white dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-2 text-sm">
        <Search className="h-4 w-4 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Filter logs by user, action description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-transparent focus:outline-none dark:text-white text-slate-900"
        />
      </div>

      {/* Logs Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-500 dark:text-slate-400">
            <thead className="text-xs uppercase bg-slate-50 dark:bg-slate-950 font-semibold border-b border-slate-200 dark:border-slate-800 text-slate-400">
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
                <tr key={l.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 text-xs">
                  
                  <td className="px-6 py-3.5 font-mono text-slate-400 whitespace-nowrap">
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
                      <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-white block">{l.userName}</span>
                        <span className="text-[10px] text-slate-400">{l.userEmail}</span>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-3.5">
                    <span className="inline-flex items-center gap-1 font-bold text-slate-500 dark:text-slate-400">
                      <Terminal className="h-3.5 w-3.5" /> {l.action}
                    </span>
                  </td>

                  <td className="px-6 py-3.5 text-slate-700 dark:text-slate-300 font-medium">
                    {l.details || 'No detail logs.'}
                  </td>

                  <td className="px-6 py-3.5 text-center font-mono text-slate-400 whitespace-nowrap">
                    {l.ipAddress || '127.0.0.1'}
                  </td>

                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400">No security audit logs found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
