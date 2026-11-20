import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

type Block = { kind: 'markdown' | 'note' | 'warning'; content: string };
export function lessonBlocks(content: string): Block[] {
  const blocks: Block[] = [];
  const pattern = /^:::(note|warning)\s*\n([\s\S]*?)\n:::$/gm;
  let start = 0;
  for (const match of content.matchAll(pattern)) {
    const index = match.index ?? 0;
    if (index > start) blocks.push({ kind: 'markdown', content: content.slice(start, index) });
    blocks.push({ kind: match[1] as 'note' | 'warning', content: match[2] });
    start = index + match[0].length;
  }
  if (start < content.length || !blocks.length)
    blocks.push({ kind: 'markdown', content: content.slice(start) });
  return blocks;
}

function SafeMarkdown({ content }: { content: string }) {
  return (
    <Markdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
      skipHtml
      components={{
        a: ({ children, ...props }) => (
          <a {...props} rel="noreferrer" target="_blank">
            {children}
          </a>
        ),
      }}
    >
      {content}
    </Markdown>
  );
}

export function LessonContent({ content }: { content: string }) {
  return (
    <div className="room-prose">
      {lessonBlocks(content).map((block, index) =>
        block.kind === 'markdown' ? (
          <SafeMarkdown key={index} content={block.content} />
        ) : (
          <aside
            key={index}
            className={`my-4 rounded-btn border p-4 ${block.kind === 'warning' ? 'border-amber-500/50 bg-amber-500/10' : 'border-primary/40 bg-primary/5'}`}
            role="note"
          >
            <strong>{block.kind === 'warning' ? 'Lưu ý' : 'Ghi chú'}</strong>
            <SafeMarkdown content={block.content} />
          </aside>
        ),
      )}
    </div>
  );
}
