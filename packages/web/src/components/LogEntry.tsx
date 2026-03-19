import type { ConsoleLog } from '../types/index.js';

interface LogEntryProps {
  log: ConsoleLog;
}

export function LogEntry({ log }: LogEntryProps) {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('zh-CN', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getLevelStyle = (level: ConsoleLog['level']) => {
    switch (level) {
      case 'error':
        return styles.error;
      case 'warn':
        return styles.warn;
      case 'info':
        return styles.info;
      default:
        return styles.log;
    }
  };

  const getLevelLabel = (level: ConsoleLog['level']) => {
    switch (level) {
      case 'error':
        return 'ERROR';
      case 'warn':
        return 'WARN';
      case 'info':
        return 'INFO';
      default:
        return 'LOG';
    }
  };

  return (
    <div style={styles.entry}>
      <div style={styles.timestamp}>
        {formatTime(log.timestamp)}
      </div>
      <div style={{ ...styles.level, ...getLevelStyle(log.level) }}>
        {getLevelLabel(log.level)}
      </div>
      <div style={styles.message}>
        {log.message}
      </div>
      {log.stack && (
        <div style={styles.stack}>
          {log.stack}
        </div>
      )}
    </div>
  );
}

const styles = {
  entry: {
    display: 'flex',
    flexDirection: 'column' as const,
    padding: '8px 12px',
    borderBottom: '1px solid #f0f0f0',
    fontFamily: 'Monaco, "Lucida Console", monospace',
    fontSize: '12px',
    lineHeight: '1.5'
  },
  timestamp: {
    color: '#999',
    fontSize: '11px',
    marginBottom: '4px'
  },
  level: {
    display: 'inline-block',
    padding: '2px 6px',
    borderRadius: '2px',
    fontSize: '10px',
    fontWeight: 'bold' as const,
    marginBottom: '4px',
    width: 'fit-content'
  },
  log: {
    backgroundColor: '#e6f7ff',
    color: '#1890ff'
  },
  info: {
    backgroundColor: '#f0f5ff',
    color: '#597ef7'
  },
  warn: {
    backgroundColor: '#fffbe6',
    color: '#faad14'
  },
  error: {
    backgroundColor: '#fff2f0',
    color: '#ff4d4f'
  },
  message: {
    color: '#333',
    wordBreak: 'break-word' as const,
    whiteSpace: 'pre-wrap' as const
  },
  stack: {
    marginTop: '8px',
    padding: '8px',
    backgroundColor: '#f5f5f5',
    borderRadius: '4px',
    color: '#666',
    fontSize: '11px',
    overflowX: 'auto' as const
  }
};
