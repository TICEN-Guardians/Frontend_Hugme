import { useRef, useState } from 'react';
import Button from '../../common/Button/Button.jsx';
import styles from './ChatInput.module.css';

export default function ChatInput({ onSend, disabled, placeholder }) {
  const [value, setValue] = useState('');
  const textareaRef = useRef(null);

  const resizeTextarea = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight / 10}rem`;
  };

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setValue('');
    window.requestAnimationFrame(resizeTextarea);
  };

  const handleChange = (event) => {
    setValue(event.target.value);
    window.requestAnimationFrame(resizeTextarea);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={styles.inputBar}>
      <textarea
        ref={textareaRef}
        className={styles.textarea}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={placeholder}
        rows={1}
      />
      <Button size="sm" onClick={handleSend} disabled={disabled}>
        전송
      </Button>
    </div>
  );
}
