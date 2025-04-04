interface MarkdownContentProps {
  content: string;
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  if (!content) {
    return <div className="prose prose-invert prose-sm max-w-none">No content available</div>;
  }

  const formattedContent = content
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');

  return (
    <div
      className="prose prose-invert prose-sm max-w-none"
      dangerouslySetInnerHTML={{ __html: formattedContent }}
    />
  );
} 