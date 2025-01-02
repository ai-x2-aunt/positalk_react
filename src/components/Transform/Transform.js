import React, { useState } from 'react';
import styles from './Transform.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faVolumeHigh, faXmark } from '@fortawesome/free-solid-svg-icons';

function Transform() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [showCopyMessage, setShowCopyMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // inputarea reset
  const handleReset = () => {
    setInputText('');
  }

  const handleCopy = async () => {
    const outputText = document.querySelector(`.${styles.outputArea}`).value;
    try {
      await navigator.clipboard.writeText(outputText);
      setShowCopyMessage(true);
      setTimeout(() => {
        setShowCopyMessage(false);
      }, 2000);
    } catch (err) {
      console.error('복사에 실패했습니다:', err);
    }
  };

  const handleTransform = async () => {
    if (!inputText.trim()) {
      alert('변환할 텍스트를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/generate_text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: inputText,
          style: document.querySelector(`.${styles.styleSelect}`).value
        }),
      });

      if (!response.ok) {
        throw new Error('변환 요청에 실패했습니다.');
      }

      const data = await response.json();
      setOutputText(data.generated_text);
    } catch (error) {
      console.error('에러:', error);
      alert('변환 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.transformBox}>
        <div className={styles.leftSection}>
          <h3>원문</h3>
          <div className={styles.inputWrapper}>
            <textarea 
              className={styles.inputArea} 
              placeholder="변환할 문장을 입력해주세요"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            {inputText && (
              <button className={styles.resetButton} onClick={handleReset}>
                <FontAwesomeIcon icon={faXmark} />
              </button>)}
          </div>
          <button 
            className={styles.transformButton} 
            onClick={handleTransform}
            disabled={isLoading}
          >
            {isLoading ? '변환중...' : '변환하기'}
          </button>
        </div>
        
        <div className={styles.rightSection}>
          <div className={styles.selectWrapper}>
            <select className={styles.styleSelect}>
              <option value="pretty">이쁘게</option>
              <option value="polite">공손하게</option>
              <option value="formal">존댓말로</option>
              <option value="friendly">친근하게</option>
            </select>
          </div>
          <textarea 
            className={styles.outputArea} 
            readOnly={true}
            value={outputText}
          ></textarea>
          <div className={styles.buttonGroup}>
            <button className={styles.soundButton}>
              <FontAwesomeIcon icon={faVolumeHigh} />
              <span className={styles.srOnly}>소리 재생</span>
            </button>
            {/* <button className={styles.copyButton}>
              <FontAwesomeIcon icon={faCopy} />
              <span className={styles.srOnly}>복사하기</span>
            </button> */}
            <div className={styles.copyButtonWrapper}>
          <button className={styles.copyButton} onClick={handleCopy}>
            <FontAwesomeIcon icon={faCopy} />
            <span className={styles.srOnly}>복사하기</span>
          </button>
          {showCopyMessage && (
            <div className={styles.copyMessage}>복사되었습니다</div>
          )}
        </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Transform;
