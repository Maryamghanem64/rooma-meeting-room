import React, { useState, useEffect, useCallback } from 'react';

const TypingEffect = ({ 
  text, 
  speed = 50, 
  delay = 0, 
  className = "", 
  onComplete = null,
  repeat = false,
  repeatDelay = 2000 
}) => {
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const startTyping = useCallback(() => {
    setIsTyping(true);
    setIsDeleting(false);
    setDisplayText('');
    
    let currentIndex = 0;
    
    const typeNextChar = () => {
      if (currentIndex < text.length) {
        setDisplayText(prev => text.substring(0, currentIndex + 1));
        currentIndex++;
        setTimeout(typeNextChar, speed);
      } else {
        setIsTyping(false);
        if (onComplete) onComplete();
        
        if (repeat) {
          setTimeout(() => {
            startDeleting();
          }, repeatDelay);
        }
      }
    };
    
    typeNextChar();
  }, [text, speed, repeat, repeatDelay, onComplete]);

  const startDeleting = useCallback(() => {
    setIsDeleting(true);
    setIsTyping(false);
    
    let currentIndex = text.length;
    
    const deleteNextChar = () => {
      if (currentIndex > 0) {
        setDisplayText(prev => text.substring(0, currentIndex - 1));
        currentIndex--;
        setTimeout(deleteNextChar, speed / 2);
      } else {
        setIsDeleting(false);
        if (repeat) {
          setTimeout(() => {
            startTyping();
          }, 500);
        }
      }
    };
    
    deleteNextChar();
  }, [text, speed, repeat, startTyping]);

  useEffect(() => {
    if (!text) return;

    let timeoutId;
    
    if (delay > 0) {
      timeoutId = setTimeout(startTyping, delay);
    } else {
      startTyping();
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [text, delay, startTyping]);

  return (
    <span className={`typing-effect ${className}`}>
      {displayText}
      <span className="typing-cursor">|</span>
    </span>
  );
};

export default TypingEffect;
