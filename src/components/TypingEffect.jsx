import React, { useState, useEffect } from 'react';

const TypingEffect = ({ 
  text, 
  speed = 100, 
  delay = 0, 
  className = "", 
  onComplete = null,
  repeat = false,
  repeatDelay = 2000 
}) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!text) return;

    const startTyping = () => {
      setIsTyping(true);
      setCurrentIndex(0);
      setDisplayText('');
    };

    const typeNextChar = () => {
      if (currentIndex < text.length) {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      } else {
        setIsTyping(false);
        if (onComplete) onComplete();
        
        if (repeat) {
          setTimeout(() => {
            startTyping();
          }, repeatDelay);
        }
      }
    };

    const timer = setTimeout(() => {
      if (delay > 0) {
        setTimeout(startTyping, delay);
      } else {
        startTyping();
      }
    }, 0);

    if (isTyping && currentIndex < text.length) {
      const typingTimer = setTimeout(typeNextChar, speed);
      return () => clearTimeout(typingTimer);
    }

    return () => clearTimeout(timer);
  }, [text, speed, delay, currentIndex, isTyping, repeat, repeatDelay, onComplete]);

  return (
    <span className={`typing-effect ${className}`}>
      {displayText}
      {isTyping && <span className="typing-cursor">|</span>}
    </span>
  );
};

export default TypingEffect;
