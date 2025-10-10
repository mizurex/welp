'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

type CodeProps = {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
} & React.HTMLAttributes<HTMLElement>;

type SimpleChildrenProps = { children?: React.ReactNode };
type AnchorProps = { href?: string; children?: React.ReactNode };

export default function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
    const [copied,setCopied] = useState(false);

    const handlecopy = async (e:React.MouseEvent<HTMLButtonElement>,codeText:string)=>{
        setCopied(true);
        setTimeout(()=>{
            setCopied(false);
        },1000);
        e.preventDefault();
        e.stopPropagation();
        try { await navigator.clipboard.writeText(codeText); } catch {}
    }

  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ inline, className, children, ...props }: CodeProps) {
            const match = /language-(\w+)/.exec(className || '');
            const codeText = String(children).replace(/\n$/, '');
            if (inline) {
              return (
                <code className="px-1 py-0.5 rounded bg-black/10 text-[11px]" {...props}>
                  {children}
                </code>
              );
            }
            return (
              <div className="relative group">
                <div className="py-0.5border-b border-neutral-200 rounded">
                <button
                  type="button"
                  onMouseDown={(e) => { e.stopPropagation(); }}
                  onPointerDown={(e) => { e.stopPropagation(); }}
                  onClick={(e) => handlecopy(e,codeText)}
                  className="text-neutral-500 absolute right-1 top-0.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity text-xs px-0.5 py-0.5 rounded bg-transparent cursor-pointer"
                >
                  {copied ? <Check className="w-2 h-2" /> : <Copy className="w-2 h-2" />}
                </button>
                </div>
              
                <SyntaxHighlighter
                  style={oneLight as any} //i hate ts
                  language={match ? match[1] : undefined}
                  PreTag="div"
                  customStyle={{
                    margin: 0,
                    borderRadius: 8,
                    fontSize: 12,
                    padding: 14,
                   
                  }}
                  codeTagProps={{ style: { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' } }}
                  {...props}
                >
                  {codeText}
                </SyntaxHighlighter>
              </div>
            );
          },
          h1({ children }: SimpleChildrenProps) {
            return <h1 className="text-sm font-semibold mb-1">{children}</h1>;
          },
          h2({ children }: SimpleChildrenProps) {
            return <h2 className="text-sm font-semibold mb-1">{children}</h2>;
          },
          h3({ children }: SimpleChildrenProps) {
            return <h3 className="text-xs font-semibold mb-1">{children}</h3>;
          },
          p({ children }: SimpleChildrenProps) {
            return <p className="text-xs leading-relaxed mb-2">{children}</p>;
          },
          ul({ children }: SimpleChildrenProps) {
            return <ul className="list-disc pl-5 space-y-1 text-xs mb-2">{children}</ul>;
          },
          ol({ children }: SimpleChildrenProps) {
            return <ol className="list-decimal pl-5 space-y-1 text-xs mb-2">{children}</ol>;
          },
          a({ href, children }: AnchorProps) {
            return (
              <a href={href} target="_blank" rel="noreferrer" className="underline">
                {children}
              </a>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}


