import { motion } from 'framer-motion';
import styles from './MessageBubble.module.css';

const ENTRY_EASE = [0.16, 1, 0.3, 1];
const MARKDOWN_LINK_PATTERN = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
const URL_PATTERN = /https?:\/\/[^\s<>)]+/g;

function normalizeUrl(rawUrl) {
  const trailingPunctuation = /[.,!?;:]+$/;
  const url = rawUrl.replace(trailingPunctuation, '');
  const suffix = rawUrl.slice(url.length);

  return { url, suffix };
}

function isGenericLinkLabel(label) {
  if (!label) return true;
  const normalized = label.trim().replace(/\s+/g, '');

  if (['여기', '이곳', '여기링크', '이곳링크', '링크'].includes(normalized)) {
    return true;
  }

  return ['여기', '여기서'].includes(normalized);
}

function isUrlLabel(label) {
  return /^https?:\/\//.test(label.trim());
}

function getUrlLabel(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '링크 열기';
  }
}

function extractLinks(content, sources = []) {
  const links = [];
  const seen = new Set();
  const inlineUrls = new Set();
  const sourceLabels = new Map();
  const sourceEntries = sources
    .map((source) => (
      typeof source === 'string'
        ? { title: '', url: source }
        : { title: source?.title ?? '', url: source?.url }
    ))
    .filter((source) => typeof source.url === 'string' && /^https?:\/\//.test(source.url));

  sourceEntries.forEach((source) => {
    const { url } = normalizeUrl(source.url);
    sourceLabels.set(url, source.title || getUrlLabel(url));
  });
  const hasSources = sourceEntries.length > 0;

  const addLink = (url, label) => {
    if (seen.has(url)) {
      if (label) {
        const existingLink = links.find((link) => link.url === url);
        if (existingLink) existingLink.label = label;
      }
      return;
    }
    seen.add(url);
    links.push({ url, label });
  };

  const withoutMarkdownLinks = content.replace(MARKDOWN_LINK_PATTERN, (_, label, rawUrl) => {
    const { url } = normalizeUrl(rawUrl);
    const trimmedLabel = label.trim();
    const displayLabel = (isGenericLinkLabel(trimmedLabel) || isUrlLabel(trimmedLabel))
      ? sourceLabels.get(url) || getUrlLabel(url)
      : trimmedLabel;
    if (hasSources) {
      return displayLabel;
    }

    inlineUrls.add(url);
    addLink(url, displayLabel);
    return `@@LINK@@${encodeURIComponent(url)}@@${encodeURIComponent(displayLabel)}@@`;
  });

  const text = withoutMarkdownLinks.replace(URL_PATTERN, (rawUrl) => {
    const { url, suffix } = normalizeUrl(rawUrl);
    if (!hasSources) {
      addLink(url);
    }
    return suffix;
  }).replace(/공식 안내에서 발급받으실 수 있습니다/g, '공식 안내를 통해 발급받으실 수 있습니다');

  sourceEntries.forEach((source) => {
      const { url } = normalizeUrl(source.url);
      addLink(url, source.title || getUrlLabel(url));
  });

  return { text, links, inlineUrls };
}

function renderInlineText(text) {
  const parts = text.split(/(\*\*[^*]+\*\*|@@LINK@@[^@]+@@[^@]*@@)/g).filter(Boolean);

  return parts.map((part, index) => {
    const linkMatch = part.match(/^@@LINK@@([^@]+)@@([^@]*)@@$/);
    if (linkMatch) {
      const url = decodeURIComponent(linkMatch[1]);
      const label = decodeURIComponent(linkMatch[2]) || getUrlLabel(url);

      return (
        <a key={index} className={styles.inlineLink} href={url} target="_blank" rel="noreferrer">
          {label}
        </a>
      );
    }

    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }

    return part.replace(/\*/g, '');
  });
}

function renderAssistantContent(content, sources, showOrderedLists, documentChatMode) {
  const { text, links, inlineUrls } = extractLinks(String(content ?? ''), sources);
  const lines = text.split(/\r?\n/);
  const blocks = [];
  let paragraph = [];
  let list = [];
  let orderedList = [];

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

  const flushOrderedList = () => {
    if (!orderedList.length) return;
    blocks.push({ type: 'orderedList', items: orderedList });
    orderedList = [];
  };

  lines.forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      if (!documentChatMode) flushList();
      return;
    }

    const orderedItem = trimmed.match(/^\d+\.\s+(.+)$/);
    if (orderedItem) {
      flushParagraph();
      flushList();
      if (showOrderedLists) {
        orderedList.push(orderedItem[1]);
      } else {
        flushOrderedList();
        list.push(orderedItem[1]);
      }
      return;
    }

    const bullet = trimmed.match(/^[-*]\s+(.+)$/);
    if (bullet) {
      flushParagraph();
      flushOrderedList();
      const item = bullet[1];
      list.push({
        content: item,
        level: documentChatMode && !/^\*\*[^*]+\*\*/.test(item) ? 1 : 0,
      });
      return;
    }

    flushList();
    flushOrderedList();
    paragraph.push(trimmed.replace(/^#{1,6}\s+/, ''));
  });

  flushParagraph();
  flushList();
  flushOrderedList();

  return (
    <div className={styles.answerContent}>
      {blocks.map((block, blockIndex) =>
        block.type === 'list' ? (
          <ul key={blockIndex} className={styles.answerList}>
            {block.items.map((item, itemIndex) => (
              <li
                key={itemIndex}
                className={item.level ? styles.answerNestedItem : undefined}
              >
                {renderInlineText(item.content ?? item)}
              </li>
            ))}
          </ul>
        ) : block.type === 'orderedList' ? (
          <ol key={blockIndex} className={`${styles.answerList} ${styles.answerOrderedList}`}>
            {block.items.map((item, itemIndex) => (
              <li key={itemIndex}>{renderInlineText(item.content ?? item)}</li>
            ))}
          </ol>
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
      {links.filter((link) => !inlineUrls.has(link.url)).length > 0 && (
        <div className={styles.linkActions}>
          {links.filter((link) => !inlineUrls.has(link.url)).map((link) => (
            <a key={link.url} className={styles.linkButton} href={link.url} target="_blank" rel="noreferrer">
              {link.label ?? getUrlLabel(link.url)}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MessageBubble({
  role,
  content,
  sources = [],
  showOrderedLists = true,
  documentChatMode = false,
  animate = false,
}) {
  const className = `${styles.row} ${role === 'user' ? styles.rowUser : ''}`;
  const bubble = (
    <div className={`${styles.bubble} ${styles[role]}`}>
      {role === 'assistant'
        ? renderAssistantContent(content, sources, showOrderedLists, documentChatMode)
        : content}
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
