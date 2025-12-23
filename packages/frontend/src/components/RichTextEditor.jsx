import React, { useState } from 'react';
import './RichTextEditor.css';

const RichTextEditor = ({ value, onChange, placeholder = "Add a description..." }) => {
  const [isPreview, setIsPreview] = useState(false);

  const insertMarkdown = (syntax) => {
    const textarea = document.getElementById('markdown-editor');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    let newText = value;
    let cursorPos = start;

    switch(syntax) {
      case 'bold':
        newText = value.substring(0, start) + `**${selectedText || 'bold text'}**` + value.substring(end);
        cursorPos = start + 2;
        break;
      case 'italic':
        newText = value.substring(0, start) + `*${selectedText || 'italic text'}*` + value.substring(end);
        cursorPos = start + 1;
        break;
      case 'heading':
        newText = value.substring(0, start) + `## ${selectedText || 'Heading'}` + value.substring(end);
        cursorPos = start + 3;
        break;
      case 'code':
        newText = value.substring(0, start) + `\`${selectedText || 'code'}\`` + value.substring(end);
        cursorPos = start + 1;
        break;
      case 'codeblock':
        newText = value.substring(0, start) + `\`\`\`\n${selectedText || 'code block'}\n\`\`\`` + value.substring(end);
        cursorPos = start + 4;
        break;
      case 'link':
        newText = value.substring(0, start) + `[${selectedText || 'link text'}](url)` + value.substring(end);
        cursorPos = start + 1;
        break;
      case 'bullet':
        newText = value.substring(0, start) + `- ${selectedText || 'List item'}` + value.substring(end);
        cursorPos = start + 2;
        break;
      case 'number':
        newText = value.substring(0, start) + `1. ${selectedText || 'List item'}` + value.substring(end);
        cursorPos = start + 3;
        break;
      case 'quote':
        newText = value.substring(0, start) + `> ${selectedText || 'Quote'}` + value.substring(end);
        cursorPos = start + 2;
        break;
      case 'hr':
        newText = value.substring(0, start) + '\n---\n' + value.substring(end);
        cursorPos = start + 5;
        break;
      case 'task':
        newText = value.substring(0, start) + `- [ ] ${selectedText || 'Task item'}` + value.substring(end);
        cursorPos = start + 6;
        break;
      default:
        return;
    }

    onChange(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(cursorPos, cursorPos);
    }, 0);
  };

  const renderMarkdown = (text) => {
    if (!text) return '';
    
    let html = text
      // Headings
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      
      // Bold
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      
      // Italic
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      
      // Code block
      .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
      
      // Inline code
      .replace(/`(.+?)`/g, '<code>$1</code>')
      
      // Links
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank">$1</a>')
      
      // Task list
      .replace(/^- \[ \] (.*)$/gim, '<div class="task-item"><input type="checkbox" disabled> $1</div>')
      .replace(/^- \[x\] (.*)$/gim, '<div class="task-item"><input type="checkbox" checked disabled> $1</div>')
      
      // Bullet lists
      .replace(/^\- (.+)$/gim, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
      
      // Numbered lists
      .replace(/^\d+\. (.+)$/gim, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/s, '<ol>$1</ol>')
      
      // Quotes
      .replace(/^&gt; (.+)$/gim, '<blockquote>$1</blockquote>')
      .replace(/^> (.+)$/gim, '<blockquote>$1</blockquote>')
      
      // Horizontal rule
      .replace(/^---$/gim, '<hr>')
      
      // Line breaks
      .replace(/\n/g, '<br>');

    return html;
  };

  return (
    <div className="rich-text-editor">
      {/* Toolbar */}
      <div className="rte-toolbar">
        <div className="rte-toolbar-group">
          <button 
            type="button"
            className="rte-btn" 
            onClick={() => insertMarkdown('bold')}
            title="Bold (Ctrl+B)"
          >
            <i className="bi bi-type-bold"></i>
          </button>
          <button 
            type="button"
            className="rte-btn" 
            onClick={() => insertMarkdown('italic')}
            title="Italic (Ctrl+I)"
          >
            <i className="bi bi-type-italic"></i>
          </button>
          <button 
            type="button"
            className="rte-btn" 
            onClick={() => insertMarkdown('code')}
            title="Inline Code"
          >
            <i className="bi bi-code"></i>
          </button>
        </div>

        <div className="rte-toolbar-divider"></div>

        <div className="rte-toolbar-group">
          <button 
            type="button"
            className="rte-btn" 
            onClick={() => insertMarkdown('heading')}
            title="Heading"
          >
            <i className="bi bi-type-h2"></i>
          </button>
          <button 
            type="button"
            className="rte-btn" 
            onClick={() => insertMarkdown('bullet')}
            title="Bullet List"
          >
            <i className="bi bi-list-ul"></i>
          </button>
          <button 
            type="button"
            className="rte-btn" 
            onClick={() => insertMarkdown('number')}
            title="Numbered List"
          >
            <i className="bi bi-list-ol"></i>
          </button>
          <button 
            type="button"
            className="rte-btn" 
            onClick={() => insertMarkdown('task')}
            title="Task List"
          >
            <i className="bi bi-check2-square"></i>
          </button>
        </div>

        <div className="rte-toolbar-divider"></div>

        <div className="rte-toolbar-group">
          <button 
            type="button"
            className="rte-btn" 
            onClick={() => insertMarkdown('link')}
            title="Link"
          >
            <i className="bi bi-link-45deg"></i>
          </button>
          <button 
            type="button"
            className="rte-btn" 
            onClick={() => insertMarkdown('codeblock')}
            title="Code Block"
          >
            <i className="bi bi-code-square"></i>
          </button>
          <button 
            type="button"
            className="rte-btn" 
            onClick={() => insertMarkdown('quote')}
            title="Quote"
          >
            <i className="bi bi-quote"></i>
          </button>
          <button 
            type="button"
            className="rte-btn" 
            onClick={() => insertMarkdown('hr')}
            title="Horizontal Rule"
          >
            <i className="bi bi-dash-lg"></i>
          </button>
        </div>

        <div className="rte-toolbar-divider"></div>

        <div className="rte-toolbar-group ms-auto">
          <button 
            type="button"
            className={`rte-btn ${!isPreview ? 'active' : ''}`}
            onClick={() => setIsPreview(false)}
            title="Edit"
          >
            <i className="bi bi-pencil"></i> Edit
          </button>
          <button 
            type="button"
            className={`rte-btn ${isPreview ? 'active' : ''}`}
            onClick={() => setIsPreview(true)}
            title="Preview"
          >
            <i className="bi bi-eye"></i> Preview
          </button>
        </div>
      </div>

      {/* Editor / Preview */}
      {!isPreview ? (
        <div className="rte-editor-wrapper">
          <textarea
            id="markdown-editor"
            className="rte-editor"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={10}
          />
          <div className="rte-helper">
            <small className="text-muted">
              Supports Markdown: **bold** *italic* `code` [link](url) - list ## heading
            </small>
          </div>
        </div>
      ) : (
        <div className="rte-preview">
          {value ? (
            <div dangerouslySetInnerHTML={{ __html: renderMarkdown(value) }} />
          ) : (
            <div className="text-muted">Nothing to preview</div>
          )}
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;
