import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Note, Subject } from '../types';
import { 
  FileText, 
  Sparkles, 
  Copy, 
  Check, 
  Download, 
  Trash2, 
  BookmarkCheck, 
  AlertCircle, 
  RefreshCw, 
  BookOpen 
} from 'lucide-react';

const SAMPLE_LECTURE_NOTES = `Database Normalization & Dependency Theory

Database normalization is the formal process of structuring a relational database in accordance with normal forms to reduce data redundancy and eliminate undesirable update, insertion, and deletion anomalies.

First Normal Form (1NF):
- Each table cell must contain a single, atomic value.
- No repeating groups or array columns.
- Each row must have a unique identifier (Primary Key).

Second Normal Form (2NF):
- The table must already satisfy 1NF.
- There must be no partial functional dependency. All non-key attributes must be fully functionally dependent on the primary key. This is especially relevant when the primary key is composite (e.g. StudentID + CourseID).

Third Normal Form (3NF):
- The relation must be in 2NF.
- There must be no transitive functional dependency. Non-key attributes cannot determine other non-key attributes (e.g. ZipCode -> City). Non-key fields must depend on "the key, the whole key, and nothing but the key".

Boyce-Codd Normal Form (BCNF):
- Stricter version of 3NF.
- In every functional dependency X -> Y, X must be a candidate super key.`;

export const AiNotesSummarizerPage: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [savedNotes, setSavedNotes] = useState<Note[]>([]);
  
  // Input state
  const [title, setTitle] = useState('Database Normalization & Normal Forms');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [content, setContent] = useState(SAMPLE_LECTURE_NOTES);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Result state
  const [summaryResult, setSummaryResult] = useState<{
    summary_content: string;
    key_points: string[];
    important_terms: Array<{ term: string; definition: string }>;
    exam_tips: string[];
  } | null>(null);

  const fetchInitial = async () => {
    try {
      const [subRes, notesRes] = await Promise.all([
        api.subjects.getAll(),
        api.notes.getAll()
      ]);
      setSubjects(subRes.data);
      if (subRes.data.length > 0) setSelectedSubjectId(subRes.data[0].id);
      setSavedNotes(notesRes.data.notes);
      if (notesRes.data.notes.length > 0 && notesRes.data.notes[0].summary_content) {
        const top = notesRes.data.notes[0];
        setSummaryResult({
          summary_content: top.summary_content || '',
          key_points: top.key_points || [],
          important_terms: top.important_terms || [],
          exam_tips: top.exam_tips || []
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchInitial();
  }, []);

  const handleSummarize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await api.ai.summarizeNotes({
        title,
        content,
        subjectId: selectedSubjectId
      });

      setSummaryResult(res.data);
      if (res.data.savedNote) {
        setSavedNotes(prev => [res.data.savedNote, ...prev]);
      }
    } catch (err: any) {
      setError(err.message || 'Summarization failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopySummary = () => {
    if (!summaryResult) return;
    const text = `
# ${title} - AI Summary

## Summary
${summaryResult.summary_content}

## Key Points
${summaryResult.key_points.map(p => `• ${p}`).join('\n')}

## Important Terms
${summaryResult.important_terms.map(t => `• **${t.term}**: ${t.definition}`).join('\n')}

## Exam Tips
${summaryResult.exam_tips.map(tip => `⚡ ${tip}`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    if (!summaryResult) return;
    const text = `
# ${title} - AI Summary

## Executive Summary
${summaryResult.summary_content}

## Key Points
${summaryResult.key_points.map(p => `- ${p}`).join('\n')}

## Important Definitions
${summaryResult.important_terms.map(t => `- **${t.term}**: ${t.definition}`).join('\n')}

## High-Yield Exam Tips
${summaryResult.exam_tips.map(t => `> [!TIP]\n> ${t}`).join('\n\n')}
    `.trim();

    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}_Summary.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>AI Lecture Notes Summarizer</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
              <Sparkles size={12} className="text-indigo-500" /> Powered by Gemini
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Turn lengthy slides, raw lecture notes, and textbook excerpts into high-yield summaries, key definitions, and exam cheat sheets.
          </p>
        </div>

        <button
          onClick={() => {
            setContent(SAMPLE_LECTURE_NOTES);
            setTitle('Database Normalization & Dependency Theory');
          }}
          className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
        >
          Load Sample Database Notes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Input Form */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4">
          <form onSubmit={handleSummarize} className="space-y-4 flex-1 flex flex-col">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle size={15} />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Note Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Chapter 4: Normalization"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Subject Module
                </label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex-1 flex flex-col">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Paste Lecture Material / Notes *
              </label>
              <textarea
                rows={12}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste raw lecture transcription, slides text, or textbook sections here..."
                className="w-full flex-1 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-xs text-slate-800 dark:text-slate-100 font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none leading-relaxed resize-none"
                required
              />
              <div className="text-[11px] text-slate-400 mt-1 flex justify-between">
                <span>{content.split(/\s+/).filter(Boolean).length} words</span>
                <span>Supported: Text, Markdown, Notes</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !content.trim()}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-500/20 active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Gemini AI is analyzing lecture content...</span>
                </>
              ) : (
                <>
                  <Sparkles size={15} />
                  <span>Summarize Notes with Gemini</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: AI Formatted Output */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-6">
          {summaryResult ? (
            <div className="space-y-6 overflow-y-auto max-h-[640px] pr-2">
              
              {/* Header with Export Buttons */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {title}
                  </h3>
                  <span className="text-xs text-slate-400">AI Structured Output</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopySummary}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1"
                    title="Copy to clipboard"
                  >
                    {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
                  </button>

                  <button
                    onClick={handleDownloadMarkdown}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1"
                    title="Export Markdown (.md)"
                  >
                    <Download size={14} />
                    <span className="hidden sm:inline">Export .MD</span>
                  </button>
                </div>
              </div>

              {/* 1. Executive Summary */}
              <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                  <BookmarkCheck size={14} /> Executive Summary
                </span>
                <p className="text-xs text-indigo-950 dark:text-indigo-100 leading-relaxed">
                  {summaryResult.summary_content}
                </p>
              </div>

              {/* 2. Key Bullet Points */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Key Concepts & Takeaways
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                  {summaryResult.key_points.map((pt, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 3. Important Terms & Definitions */}
              {summaryResult.important_terms && summaryResult.important_terms.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Important Terms & Definitions
                  </h4>
                  <div className="space-y-1.5">
                    {summaryResult.important_terms.map((item, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-xs">
                        <span className="font-bold text-brand-600 dark:text-brand-400">{item.term}: </span>
                        <span className="text-slate-600 dark:text-slate-300">{item.definition}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. Exam Cram Points */}
              {summaryResult.exam_tips && summaryResult.exam_tips.length > 0 && (
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 space-y-1.5">
                  <h4 className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    ⚡ High-Yield Exam Tips
                  </h4>
                  <ul className="space-y-1 text-xs text-amber-900 dark:text-amber-200 pl-4 list-disc">
                    {summaryResult.exam_tips.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          ) : (
            <div className="py-24 text-center text-slate-400 my-auto">
              <BookOpen size={44} className="mx-auto mb-3 opacity-40" />
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                No Summary Generated Yet
              </h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
                Enter your lecture notes on the left and click "Summarize" to generate structured study materials.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
