import { motion } from 'framer-motion';
import styles from './MessageBubble.module.css';

const ENTRY_EASE = [0.16, 1, 0.3, 1];
const MARKDOWN_LINK_PATTERN = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
const URL_PATTERN = /https?:\/\/[^\s<>)]+/g;
const DOCUMENT_LINK_LABEL = '서류 신청 안내';

function normalizeUrl(rawUrl) {
  const trailingPunctuation = /[.,!?;:]+$/;
  const url = rawUrl.replace(trailingPunctuation, '');
  const suffix = rawUrl.slice(url.length);

  return { url, suffix };
}

function isGenericLinkLabel(label) {
  if (!label) return true;
  const normalized = label.trim().replace(/\s+/g, '');

  return ['여기', '여기서'].includes(normalized);
}

function extractLinks(content) {
  const links = [];
  const seen = new Set();
  const addLink = (url, label) => {
    if (seen.has(url)) return;
    seen.add(url);
    links.push({ url, label });
  };

  const withoutMarkdownLinks = content.replace(MARKDOWN_LINK_PATTERN, (_, label, rawUrl) => {
    const { url } = normalizeUrl(rawUrl);
    addLink(url, label.trim());
    return isGenericLinkLabel(label) ? '공식 안내' : label.trim();
  });

  const text = withoutMarkdownLinks.replace(URL_PATTERN, (rawUrl) => {
    const { url, suffix } = normalizeUrl(rawUrl);
    addLink(url);
    return suffix;
  }).replace(/공식 안내에서 발급받으실 수 있습니다/g, '공식 안내를 통해 발급받으실 수 있습니다');

  return { text, links };
}

function renderInlineText(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }

    return part.replace(/\*/g, '');
  });
}

function renderAssistantContent(content) {
  const { text, links } = extractLinks(String(content ?? ''));
  const lines = text.split(/\r?\n/);
  const blocks = [];
  let paragraph = [];
  let list = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    blocks.push({ type: 'paragraph', lines: paragraph });
    paragraph = [];
  };

  const flushList = () => {
    if (!list.length) return;
    blocks.push({ type: 'list', items: list });
    list = [];
  };

  lines.forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      flushList();
      return;
    }

    const bullet = trimmed.match(/^[-*]\s+(.+)$/);
    if (bullet) {
      flushParagraph();
      list.push(bullet[1]);
      return;
    }

    flushList();
    paragraph.push(trimmed.replace(/^#{1,6}\s+/, ''));
  });

  flushParagraph();
  flushList();

  return (
    <div className={styles.answerContent}>
      {blocks.map((block, blockIndex) =>
        block.type === 'list' ? (
          <ul key={blockIndex} className={styles.answerList}>
            {block.items.map((item, itemIndex) => (
              <li key={itemIndex}>{renderInlineText(item)}</li>
            ))}
          </ul>
        ) : (
          <p key={blockIndex} className={styles.answerParagraph}>
            {block.lines.map((line, lineIndex) => (
              <span key={lineIndex}>
                {renderInlineText(line)}
                {lineIndex < block.lines.length - 1 && <br />}
              </span>
            ))}
          </p>
        ),
      )}
      {links.length > 0 && (
        <div className={styles.linkActions}>
          {links.map((link) => (
            <a key={link.url} className={styles.linkButton} href={link.url} target="_blank" rel="noreferrer">
              {DOCUMENT_LINK_LABEL}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MessageBubble({ role, content, animate = false }) {
  const className = `${styles.row} ${role === 'user' ? styles.rowUser : ''}`;
  const bubble = (
    <div className={`${styles.bubble} ${styles[role]}`}>
      {role === 'assistant' ? renderAssistantContent(content) : content}
    </div>
  );

  if (!animate) {
    return <div className={className}>{bubble}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: role === 'user' ? 20 : 24, scale: role === 'user' ? 0.99 : 1 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: role === 'user' ? 0.62 : 0.72, ease: ENTRY_EASE }}
    >
      {bubble}
    </motion.div>
  );
}
