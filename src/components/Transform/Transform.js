import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './Transform.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faVolumeHigh, faXmark, faHistory } from '@fortawesome/free-solid-svg-icons';
import History from '../History/History';

function Transform({ histories, setHistories }) {
  const navigate = useNavigate();
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [showCopyMessage, setShowCopyMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [modelType, setModelType] = useState('');
  const [selectedCloudModel, setSelectedCloudModel] = useState('');
  const [selectedLocalModel, setSelectedLocalModel] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [displayModel, setDisplayModel] = useState('');
  const [availableStyles, setAvailableStyles] = useState([]);
  const [selectedStyle, setSelectedStyle] = useState('');

  // 유효성 검사 오류 메세지 상태
  const [validationError, setValidationError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    setAvailableStyles(allStyleOptions);
  }, []);

  useEffect(() => {
    if (isSubmitted) {
      validateForm(); // 유효성 검사 갱신
    }
  }, [inputText, modelType, selectedStyle]);

  const allStyleOptions = [
    { value: 'formal', label: '격식체' },
    { value: 'casual', label: '친근체' },
    { value: 'polite', label: '공손체' },
    { value: 'cute', label: '애교체' }
  ];

  const modelOptions = [
    { value: 'gpt-4o-mini', label: 'GPT-4' }, // UI에는 GPT-4로 표시
    { value: 'gemini', label: 'Gemini' }
  ];

  const localAIOptions = [
    { value: 'polyglot-ko', label: 'Polyglot-KO 5.8B' },
    { value: 'kogpt2', label: 'KoGPT2' },
    { value: 'qwen18b', label: 'Qwen1.5 1.8B' },
    { value: 'qwen15b', label: 'Qwen2.5 1.5B' },
    { value: 'qwen3b', label: 'Qwen2.5 3B' },
    { value: 'qwen7b', label: 'Qwen2.5 7B' },
    { value: 'bllossom', label: 'Llama Korean 3B' },
    { value: 'heegyu', label: 'Heegyu Model' },
    { value: 'formal-9unu', label: 'Formal 9UNU' },
    { value: 'gentle-9unu', label: 'Gentle 9UNU' }
  ];

  const handleCloudModelChange = (e) => {
    const newModel = e.target.value;

    // 기본 옵션(빈 값) 선택할 경우 - 클라우드 모델 선택 해제
    if(!newModel) {
      setSelectedCloudModel('');
      setModelType('');
      setValidationError('');
      return;
    }

    // 클라우드 모델 선택시 로컬 모델 선택 초기화
    setSelectedLocalModel('');
    setSelectedCloudModel(newModel);
    setModelType(newModel);
  
    // 스타일 옵션 설정 - 클라우드 모델은 모든 스타일 지원
    setAvailableStyles(allStyleOptions);
    if(!selectedStyle) setSelectedStyle(allStyleOptions[0].value);

    // 선택된 모델 표시 업데이트
    const selectedModelOption = modelOptions.find(opt => opt.value === newModel);
    if(selectedModelOption) {
      setDisplayModel(selectedModelOption.label);
    }
  };

  const handleLocalModelChange = (e) => {
    let newModel = e.target.value;

    // 기본 옵션(빈 값)을 선택한 경우 - 로컬 모델 선택 해제
    if(!newModel) {
      setSelectedLocalModel('');
      setModelType('');
      setValidationError('');
      return;
    }

    // 로컬 모델 선택 시 클라우드 모델 선택 초기화
    setSelectedCloudModel('');
    setSelectedLocalModel(newModel);

    // 9unu 모델들은 'h9'로 변경
    if(newModel === 'formal-9unu' || newModel === 'gentle-9unu') {
      newModel = 'h9';
    }

    setModelType(newModel);

    // 모델에 따른 스타일 옵션 설정
    if(newModel === 'heegyu') {
      const filteredStyles = allStyleOptions.filter(style => ['casual', 'cute'].includes(style.value));
      setAvailableStyles(filteredStyles);
      setSelectedStyle(''); // 모델 선택 시 문체 선택 유도하기 위해 기본값 설정하지 않음

    } else if (e.target.value === 'gentle-9unu') {
      const filteredStyles = allStyleOptions.filter(style => 
        style.value === 'polite'
      );
      setAvailableStyles(filteredStyles);
      // 단일 옵션만 있는 경우는 자동 선택
      setSelectedStyle('polite');

    } else if (e.target.value === 'formal-9unu') {
      const filteredStyles = allStyleOptions.filter(style => 
        style.value === 'formal'
      );
      setAvailableStyles(filteredStyles);
      // 단일 옵션만 있는 경우는 자동 선택
      setSelectedStyle('formal');

    } else {
      setAvailableStyles(allStyleOptions);
      // 모델 선택 시 문체 선택을 유도하기 위해 기본값 설정하지 않음
      setSelectedStyle('');
    }

    // 유효성 오류 메세지 초기화
    setValidationError('');

    // 선택된 모델 표시 업데이트
    const selectedModelOption = localAIOptions.find(opt => opt.value === e.target.value);
    if (selectedModelOption) {
      setDisplayModel(selectedModelOption.label);
    }
  };

  const validateForm = () => {
    let errorMessage = ""; // 여러 오류 감지하기 위한 변수

    if (!inputText.trim()) {
      console.log("텍스트가 입력되지 않음");
      errorMessage = "변환할 텍스트를 입력해주세요.";
    } else if (!modelType) {
      console.log("모델이 선택되지 않음");
      errorMessage = "변환할 모델을 선택해주세요.";
    } else if (!selectedStyle) {
      console.log("문체가 선택되지 않음");
      errorMessage = "문체를 선택해주세요.";
    }

    setValidationError(errorMessage);  // 최종적으로 한 번만 상태 업데이트
    return !errorMessage;
  }

  const handleTransform = async () => {
    setIsSubmitted(true); // 버튼 클릭 시 상태 변경
    if (!validateForm()) {
      console.log("유효성 검증 실패");
      return;
    }
  
    console.log("유효성 검증 통과, 변환 요청 시작");
    setIsLoading(true);
    const startTime = Date.now();
  
    try {
      const requestData = {
        message: inputText,
        style: selectedStyle,
        model: modelType.startsWith('gpt') ? 'openai-gpt' : modelType,
        subModel: modelType.startsWith('gpt') ? modelType : undefined
      };
      console.log('요청 데이터:', requestData);
  
      const response = await axios.post('http://localhost:8000/api/chat', requestData);
      
      const duration = Date.now() - startTime;
      const newHistory = {
        inputText,
        outputText: response.data.response,
        model: modelType,
        style: selectedStyle,
        timestamp: new Date().toLocaleString(),
        duration
      };
  
      setHistories(prev => [newHistory, ...prev]);
      setOutputText(response.data.response);
    } catch (error) {
      console.error('상세 에러:', error.response?.data);
      setOutputText('오류가 발생했습니다. 다시 시도해주세요.');
    }
    setIsLoading(false);
  };

  const handleReset = () => {
    setInputText('');
    setOutputText('');
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setShowCopyMessage(true);
    setTimeout(() => setShowCopyMessage(false), 1000);
  };

  const handlePlaySound = async () => {
    if (!outputText || isPlaying) return;
    
    setIsPlaying(true);
    try {
      const selectedStyle = document.querySelector(`.${styles.styleSelect}`).value;
      const response = await axios.post('http://localhost:8000/api/tts', {
        text: outputText,
        voice: {
          style: selectedStyle
        }
      }, {
        responseType: 'arraybuffer'
      });

      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const audioBuffer = await audioContext.decodeAudioData(response.data);
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      
      source.onended = () => {
        setIsPlaying(false);
      };
      
      source.start(0);
    } catch (error) {
      console.error('TTS Error:', error);
      setIsPlaying(false);
    }
  };

  const handleHistoryClick = () => {
    navigate('/history');
  };

  const handleSpeak = async (text, style) => {
    try {
      setIsPlaying(true);
      const response = await fetch('http://localhost:8000/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          voice: { style }
        }),
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.play();
      audio.onended = () => {
        setIsPlaying(false);
        window.URL.revokeObjectURL(url);
      };
    } catch (error) {
      console.error('Error:', error);
      setIsPlaying(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.transformBox}>
        <div className={styles.leftSection}>
          <div className={styles.headerSection}>
            <h3>원문</h3>
            {/* --- 클라우드 AI, 로컬 AI, 문체 선택 영역 --- */}
            <div className={styles.selectWrapper}>
              <div className={styles.modelSelectWrapper}>
                {/* 클라우드 AI Select */}
                <select
                  className={`${styles.styleSelect} 
                    ${selectedLocalModel ? styles.disabledSelect : ''} 
                    ${selectedCloudModel ? styles.activeSelect : ''}
                    ${!selectedCloudModel ? styles.placeholderStyle : ''}`}
                  value={selectedCloudModel}
                  onChange={handleCloudModelChange}
                  disabled={!!selectedLocalModel}
                  required
                >
                  <option value="">클라우드 AI 모델</option>
                  {modelOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                {/* 로컬 AI Select */}
                <select
                  className={`${styles.styleSelect} 
                    ${selectedCloudModel ? styles.disabledSelect : ''} 
                    ${selectedLocalModel ? styles.activeSelect : ''}
                    ${!selectedLocalModel ? styles.placeholderStyle : ''}`}
                  value={selectedLocalModel}
                  onChange={handleLocalModelChange}
                  disabled={!!selectedCloudModel}
                  required
                >
                  <option value="">로컬 AI 모델</option>
                  {localAIOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 문체 Select */}
              <select
                className={`${styles.styleSelect} 
                  ${selectedStyle ? styles.activeSelect : ''}`}
                value={selectedStyle}
                onChange={(e) => setSelectedStyle(e.target.value)}
                disabled={!modelType}
                required
              >
                <option value="" disabled>문체 선택</option>
                {availableStyles.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.inputWrapper}>
            {/* textarea 본문 입력 */}
            <textarea
              className={styles.inputArea}
              placeholder="변환할 텍스트를 입력해주세요"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            {inputText && (
              <button className={styles.resetButton} onClick={handleReset}>
                <FontAwesomeIcon icon={faXmark} />
              </button>
            )}
          </div>

          {/* 유효성 검사 오류 메시지 표시 */}
          {isSubmitted && validationError && (
            <div className={styles.validationError}>
              {validationError}
            </div>
          )}
          
          <button 
            className={styles.transformButton} 
            onClick={handleTransform} 
            disabled={isLoading || validationError}
          >
            {isLoading ? '변환 중..' : '변환하기'}
          </button>
        </div>
        <div className={styles.rightSection}>
          <div className={styles.headerSection}>
            <h3>변환문</h3>        
            {/* <button 
              className={styles.historyButton}
              onClick={() => setShowHistory(true)}
            >
              <FontAwesomeIcon icon={faHistory} />
              <span>기록</span>
            </button> */}
          </div>
          <textarea className={styles.outputArea} value={outputText} readOnly={true}></textarea>
          <div className={styles.buttonGroup}>
            <button title="기록 보기" className={styles.iconButton} onClick={() => setShowHistory(true)}>
              <FontAwesomeIcon icon={faHistory} />
              <span className={styles.srOnly}>기록</span>
            </button>
            <button title="사운드 재생" className={styles.iconButton} onClick={handlePlaySound} disabled={!outputText || isPlaying}>
              <FontAwesomeIcon icon={faVolumeHigh} />
              <span className={styles.srOnly}>
                {isPlaying ? '재생 중..' : '소리 재생'}
              </span>
            </button>
            <div className={styles.copyButtonWrapper}>
              <button title="클립보드 복사" className={styles.iconButton} onClick={() => handleCopy(outputText)} disabled={!outputText}>
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
      {showHistory && (
        <History
          histories={histories}
          onSpeak={handleSpeak}
          onCopy={handleCopy}
          onClose={() => setShowHistory(false)}
        />
      )}
    </div>
  );
}

export default Transform;