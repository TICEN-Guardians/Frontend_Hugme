import { useState } from 'react';
import Button from '../../common/Button/Button.jsx';
import styles from './ChatInput.module.css';

export default function ChatInput({ onSend, disabled, placeholder }) {
  const [value, setValue] = useState('');

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setValue('');
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
        className={styles.textarea}
        value={value}
        onChange={(event) => setValue(event.target.value)}
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
