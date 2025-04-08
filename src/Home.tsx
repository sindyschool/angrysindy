import React, { useState, useEffect, useRef } from 'react';
import Lottie from 'lottie-react';
import explosionAnimation from './assets/lottie/explosion.json';
import { saveEmotionRecord } from './utils/emotionStorage';

const Home = () => {
  const [anger, setAnger] = useState(0);
  const [text, setText] = useState('');
  const [exploded, setExploded] = useState(false);
  const [flash, setFlash] = useState(false);
  const [step, setStep] = useState<'welcome' | 'input' | 'exploded' | 'after'>('welcome');
  const [isWaveAnimating, setIsWaveAnimating] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [isEntering, setIsEntering] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [visibleMessages, setVisibleMessages] = useState<number[]>([]);
  const [typingStartTime, setTypingStartTime] = useState(0);
  const lastTypingTime = useRef(0);
  const sessionStartTime = useRef(Date.now());
  
  // 오디오 ref 추가
  const explosionSoundRef = useRef<HTMLAudioElement | null>(null);
  const typingSoundRef = useRef<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    // 폭발음과 타자 소리 초기화
    explosionSoundRef.current = new Audio('/explosion.wav');
    explosionSoundRef.current.load();
    explosionSoundRef.current.volume = 0.7; // 폭발음 볼륨 조절
    
    typingSoundRef.current = new Audio('/typewriter-2.mp3');
    typingSoundRef.current.load();
    typingSoundRef.current.volume = 0.5; // 타자 소리 볼륨
    
    return () => {
      if (explosionSoundRef.current) {
        explosionSoundRef.current.pause();
        explosionSoundRef.current = null;
      }
      if (typingSoundRef.current) {
        typingSoundRef.current.pause();
        typingSoundRef.current = null;
      }
    };
  }, []);

  // 폭발 효과 관련 useEffect
  useEffect(() => {
    if (anger >= 100) {
      setExploded(true);
      setFlash(true);
      setIsShaking(true);
      
      // 진동 효과
      try {
        if (navigator.vibrate) {
          navigator.vibrate(300);
        }
      } catch (error) {
        console.warn('Vibration not supported');
      }

      // 폭발음 재생
      if (explosionSoundRef.current) {
        explosionSoundRef.current.play().catch(error => {
          console.warn('Explosion sound playback failed:', error);
        });
      }

      setTimeout(() => {
        setFlash(false);
        setIsShaking(false);
        setStep('exploded');
      }, 500);
    } else if (anger > 0) {
      setIsWaveAnimating(true);
    } else {
      setIsWaveAnimating(false);
    }
  }, [anger]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setText(value);
    setAnger(Math.min(100, value.length));
    
    // 타자 소리 재생 (50ms 간격으로 제한)
    const now = Date.now();
    if (now - lastTypingTime.current > 50 && typingSoundRef.current) {
      typingSoundRef.current.currentTime = 0;
      typingSoundRef.current.play().catch(error => {
        console.warn('Typing sound playback failed:', error);
      });
      lastTypingTime.current = now;
    }
  };

  const handleAfterResponse = (choice: 'more' | 'done') => {
    // 감정 데이터 저장
    const duration = Math.floor((Date.now() - sessionStartTime.current) / 1000);
    saveEmotionRecord({
      timestamp: Date.now(),
      text,
      angerLevel: anger,
      duration,
      resolved: choice === 'done',
      length: text.length,
    });

    if (choice === 'more') {
      setText('');
      setAnger(0);
      setExploded(false);
      setStep('input');
      sessionStartTime.current = Date.now();
    } else {
      setStep('after');
    }
  };

  const handleEnterRoom = () => {
    setIsEntering(true);
    setTimeout(() => {
      setStep('input');
      setIsEntering(false);
      sessionStartTime.current = Date.now();
    }, 1000);
  };

  return (
    <div
      className={`min-h-screen bg-gray-900 text-center relative overflow-hidden transition-all duration-300 ${
        isShaking ? 'animate-[shake_0.5s_ease-in-out_infinite]' : ''
      }`}
    >
      {step === 'welcome' && (
        <div className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-1000 ${
          isEntering ? 'scale-150 opacity-0' : 'scale-100 opacity-100'
        }`}>
          {/* 움직이는 말풍선과 욕설 기호들 */}
          <div className="absolute inset-0 overflow-hidden">
            {/* 메인 말풍선 */}
            <div
              className="absolute bg-white rounded-3xl p-8 transform -rotate-12"
              style={{
                width: '300px',
                height: '200px',
                left: 'calc(50% - 150px)',
                top: 'calc(50% - 200px)',
                clipPath: 'polygon(0% 0%, 100% 0%, 100% 75%, 75% 75%, 75% 100%, 50% 75%, 0% 75%)',
                animation: 'float 3s ease-in-out infinite',
              }}
            >
              {/* 욕설 기호들 */}
              <div className="relative w-full h-full">
                {['@', '#', '%', '!', '*', '&'].map((symbol, i) => (
                  <div
                    key={i}
                    className="absolute text-red-500 text-3xl font-bold"
                    style={{
                      animation: `symbolFloat ${2 + Math.random()}s ease-in-out infinite`,
                      animationDelay: `${i * 0.3}s`,
                      left: `${20 + (i * 40)}px`,
                      top: `${30 + (Math.random() * 60)}px`,
                    }}
                  >
                    {symbol}
                  </div>
                ))}
              </div>
            </div>

            {/* 작은 말풍선들 */}
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="absolute bg-white/80 rounded-2xl"
                style={{
                  width: '100px',
                  height: '60px',
                  left: `${Math.random() * 80 + 10}%`,
                  top: `${Math.random() * 80 + 10}%`,
                  clipPath: 'polygon(0% 0%, 100% 0%, 100% 75%, 75% 75%, 75% 100%, 50% 75%, 0% 75%)',
                  animation: `smallBubbleFloat ${3 + Math.random() * 2}s ease-in-out infinite`,
                  animationDelay: `${-i * 0.5}s`,
                }}
              >
                <div className="text-red-500 text-lg font-bold p-2">@#$!</div>
              </div>
            ))}
          </div>

          {/* 중앙 메시지와 입술 */}
          <div className="relative z-10 text-center">
            <h1 className="text-4xl font-bold text-red-500 mb-12">Wanna let it all out?</h1>
            
            {/* 입술 디자인 */}
            <div 
              className="relative w-[300px] h-[160px] mx-auto cursor-pointer group"
              onClick={handleEnterRoom}
              style={{
                animation: 'mouthChewing 1.5s ease-in-out infinite',
                transform: 'scale(1.2)',
              }}
            >
              {/* 입술 그림자 */}
              <div className="absolute inset-0 bg-black/40 rounded-[100%] blur-xl transform translate-y-2" />
              
              {/* 큐피드 활 */}
              <div 
                className="absolute w-12 h-6 top-[15%] left-1/2 -translate-x-1/2 bg-gradient-to-b from-red-700 to-red-600 rounded-t-[100%]"
                style={{
                  animation: 'mouthChewing 1.5s ease-in-out infinite',
                  clipPath: 'path("M 0,24 C 12,24 36,24 48,24 C 48,16 42,8 36,4 C 24,0 24,0 12,4 C 6,8 0,16 0,24 Z")',
                }}
              />
              
              {/* 치아 */}
              <div className="absolute w-40 h-6 left-1/2 top-[45%] -translate-x-1/2 -translate-y-[2px] z-10 flex justify-center gap-[3px]">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={`tooth-${i}`}
                    className="w-4 h-full bg-white rounded-b-sm"
                    style={{
                      boxShadow: 'inset 0 -2px 4px rgba(0,0,0,0.1)',
                      '--tooth-rotation': `${i * 2 - 7}deg`,
                      animation: 'teethMovement 1.5s ease-in-out infinite',
                      transform: `rotate(var(--tooth-rotation))`,
                    } as any}
                  />
                ))}
              </div>

              {/* 입 안쪽 */}
              <div 
                className="absolute w-44 h-8 left-1/2 top-[45%] -translate-x-1/2 -translate-y-[2px] bg-gradient-to-b from-red-950 to-red-900 rounded-[100%] blur-sm"
                style={{
                  animation: 'mouthInnerMove 1.5s ease-in-out infinite',
                }}
              />
              
              {/* 윗입술 */}
              <div className="relative w-full h-1/2 overflow-hidden">
                <div 
                  className="absolute w-full h-full bg-gradient-to-b from-red-800 via-red-700 to-red-600
                           transform origin-bottom transition-transform duration-300
                           group-hover:scale-y-[0.7]"
                  style={{
                    clipPath: 'path("M 0,80 C 75,80 225,80 300,80 C 300,60 285,30 255,20 C 195,0 105,0 45,20 C 15,30 0,60 0,80 Z")',
                    animation: 'mouthChewing 1.5s ease-in-out infinite',
                    boxShadow: 'inset 0 -4px 8px rgba(0,0,0,0.3)',
                  }}
                >
                  {/* 윗입술 하이라이트 */}
                  <div className="absolute w-1/3 h-1/4 top-1/4 left-1/3 bg-white/30 rounded-full blur-sm" />
                </div>
              </div>
              
              {/* 아랫입술 */}
              <div className="relative w-full h-1/2 overflow-hidden">
                <div 
                  className="absolute bottom-0 w-full h-full bg-gradient-to-b from-red-700 via-red-600 to-red-500
                           transform origin-top transition-transform duration-300
                           group-hover:scale-y-[1.3]"
                  style={{
                    clipPath: 'path("M 0,0 C 75,0 225,0 300,0 C 300,20 285,50 255,60 C 195,80 105,80 45,60 C 15,50 0,20 0,0 Z")',
                    animation: 'mouthChewing 1.5s ease-in-out infinite',
                    animationDelay: '0.1s',
                    boxShadow: 'inset 0 4px 8px rgba(0,0,0,0.3)',
                  }}
                >
                  {/* 아랫입술 하이라이트 */}
                  <div className="absolute w-1/2 h-1/4 top-1/4 left-1/4 bg-red-400/40 rounded-full blur-sm" />
                </div>
              </div>

              {/* 입술 테두리 효과 */}
              <div 
                className="absolute inset-0 rounded-[100%] opacity-60"
                style={{
                  background: 'radial-gradient(circle at center, transparent 50%, rgba(185,28,28,0.6) 100%)',
                  animation: 'mouthChewing 1.5s ease-in-out infinite',
                }}
              />

              {/* 호버 효과 */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute w-full h-full rounded-[100%]"
                  style={{
                    background: 'radial-gradient(circle at center, rgba(239,68,68,0.2) 0%, transparent 70%)'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {(step === 'input' || step === 'exploded' || step === 'after') && (
        <div className={`flex flex-col items-center justify-center min-h-screen transition-all duration-1000 ${
          isEntering ? 'scale-50 opacity-0' : 'scale-100 opacity-100'
        }`}>
          {step === 'input' && (
            <>
              <div className="relative z-10 w-full max-w-3xl px-4">
                <textarea
                  value={text}
                  onChange={handleInput}
                  rows={6}
                  className="w-full p-6 bg-gray-800/50 backdrop-blur-sm border-none rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-red-400 text-white text-lg"
                  placeholder="Say everything, let it all out."
                  aria-label="Express your feelings"
                  aria-describedby="anger-level"
                />
                <p className="text-sm text-red-400/80 mt-3 tracking-wider">{anger}% emotions rising...</p>
              </div>

              {/* 기본 물결 효과 - 더 부드러운 물결 */}
              <div 
                className="absolute bottom-0 left-0 right-0 bg-red-900/10 transition-all duration-500"
                style={{ 
                  height: '15vh',
                  animation: 'baseWave 8s ease-in-out infinite',
                  transformOrigin: 'bottom',
                  borderRadius: '100% 100% 0 0 / 15% 15% 0 0',
                  filter: 'url(#gentleWavy)',
                }}
              />

              {/* 물결 효과 레이어들 - 더 부드러운 곡선 */}
              <div 
                className="absolute bottom-0 left-0 right-0 bg-red-600/40 transition-all duration-500"
                style={{ 
                  height: `${Math.max(15, anger * 1.2)}vh`,
                  animation: isWaveAnimating ? 'wave 6s ease-in-out infinite' : 'none',
                  transformOrigin: 'bottom',
                  borderRadius: '100% 100% 0 0 / 20% 20% 0 0',
                  filter: 'url(#gentleWavy)',
                }}
              />
              <div 
                className="absolute bottom-0 left-0 right-0 bg-red-500/30 transition-all duration-500"
                style={{ 
                  height: `${Math.max(12, anger * 1.2 - 4)}vh`,
                  animation: isWaveAnimating ? 'waveOffset 7s ease-in-out infinite' : 'none',
                  animationDelay: '-2s',
                  transformOrigin: 'bottom',
                  borderRadius: '100% 100% 0 0 / 18% 18% 0 0',
                  filter: 'url(#gentleWavy)',
                }}
              />
              <div 
                className="absolute bottom-0 left-0 right-0 bg-red-700/20 transition-all duration-500"
                style={{ 
                  height: `${Math.max(10, anger * 1.2 - 8)}vh`,
                  animation: isWaveAnimating ? 'wave 8s ease-in-out infinite' : 'none',
                  animationDelay: '-4s',
                  transformOrigin: 'bottom',
                  borderRadius: '100% 100% 0 0 / 22% 22% 0 0',
                  filter: 'url(#gentleWavy)',
                }}
              >
                {/* 부글부글 끓는 기포 효과 - 더 많은 기포 */}
                {Array.from({ length: 40 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute bg-red-400/20 rounded-full"
                    style={{
                      width: `${4 + Math.random() * 8}px`,
                      height: `${4 + Math.random() * 8}px`,
                      left: `${Math.random() * 100}%`,
                      bottom: `${Math.random() * 100}%`,
                      animation: `bubble ${3 + Math.random() * 3}s ease-in-out infinite`,
                      animationDelay: `${Math.random() * 3}s`,
                    }}
                  />
                ))}
              </div>

              {/* SVG 필터 정의 - 더 부드러운 물결 */}
              <svg className="hidden">
                <defs>
                  <filter id="gentleWavy">
                    <feTurbulence 
                      type="fractalNoise" 
                      baseFrequency="0.01 0.02" 
                      numOctaves="3" 
                      seed="1" 
                      result="turbulence" 
                    >
                      <animate 
                        attributeName="baseFrequency" 
                        dur="40s" 
                        values="0.01 0.02;0.015 0.025;0.01 0.02" 
                        repeatCount="indefinite" 
                      />
                    </feTurbulence>
                    <feDisplacementMap 
                      in="SourceGraphic" 
                      in2="turbulence" 
                      scale="15" 
                      xChannelSelector="R" 
                      yChannelSelector="G" 
                    />
                  </filter>
                </defs>
              </svg>
            </>
          )}

          {step === 'exploded' && (
            <div className="relative z-10 w-full max-w-md mt-8">
              <div className="animate-ping-fast relative">
                <Lottie animationData={explosionAnimation} loop={false} />
                
                {/* 붉은 물 튀기는 효과 */}
                {Array.from({ length: 12 }).map((_, i) => {
                  const angle = (i / 12) * Math.PI * 2;
                  const x = Math.cos(angle) * 50;
                  const y = Math.sin(angle) * 50;
                  return (
                    <div
                      key={`splatter-${i}`}
                      className="absolute top-1/2 left-1/2 bg-red-600/80"
                      style={{
                        width: '100px',
                        height: '100px',
                        transform: `rotate(${angle}rad)`,
                        clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                        animation: 'splatter 0.5s ease-out forwards',
                        animationDelay: `${i * 0.05}s`,
                        '--x': `${50 + x}%`,
                        '--y': `${50 + y}%`,
                      } as any}
                    />
                  );
                })}

                {/* 흘러내리는 효과 */}
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={`drip-${i}`}
                    className="absolute top-1/2 bg-red-600/60"
                    style={{
                      left: `${10 + (i * 12)}%`,
                      width: '4px',
                      height: '200px',
                      animation: 'drip 2s ease-in forwards',
                      animationDelay: `${0.5 + i * 0.2}s`,
                      filter: 'blur(1px)',
                    }}
                  />
                ))}

                {/* 번지는 효과 */}
                {Array.from({ length: 6 }).map((_, i) => {
                  const x = 20 + Math.random() * 60;
                  const y = 20 + Math.random() * 60;
                  return (
                    <div
                      key={`spread-${i}`}
                      className="absolute inset-0 bg-red-600/30"
                      style={{
                        animation: 'bloodSpread 1.5s ease-out forwards',
                        animationDelay: `${0.3 + i * 0.2}s`,
                        '--x': `${x}%`,
                        '--y': `${y}%`,
                      } as any}
                    />
                  );
                })}

                {/* 기존 파티클 효과 */}
                {Array.from({ length: 20 }).map((_, i) => {
                  const angle = (i / 20) * Math.PI * 2;
                  const distance = 100 + Math.random() * 100;
                  const tx = Math.cos(angle) * distance;
                  const ty = Math.sin(angle) * distance;
                  const delay = Math.random() * 0.5;
                  const size = 10 + Math.random() * 20;

                  return (
                    <div
                      key={i}
                      className="absolute top-1/2 left-1/2 bg-red-500 rounded-full"
                      style={{
                        width: size,
                        height: size,
                        '--tx': `${tx}px`,
                        '--ty': `${ty}px`,
                        animation: `particle 0.8s ease-out forwards`,
                        animationDelay: `${delay}s`,
                      } as any}
                    />
                  );
                })}

                {/* 섬광 효과 */}
                <div 
                  className="absolute inset-0 animate-[flash_0.5s_ease-out]"
                  style={{ animationIterationCount: 3 }}
                />
              </div>
              
              <div className={`transition-all duration-300 ${
                isShaking ? 'animate-[intensiveShake_0.3s_ease-in-out_infinite]' : ''
              }`}>
                <h3 className="text-3xl font-light text-red-400 mt-8 mb-12">BOOM! Emotions exploded!</h3>

                <p className="mt-6 text-lg text-gray-400 font-light">How do you feel now?</p>
                <div className="flex gap-6 mt-8 justify-center">
                  <button
                    className="px-8 py-3 text-red-400 hover:text-white border border-red-400/30 hover:bg-red-500/20 
                             rounded-lg transition-all duration-300 text-sm tracking-wide"
                    onClick={() => handleAfterResponse('more')}
                  >
                    Still need more
                  </button>
                  <button
                    className="px-8 py-3 text-gray-300 hover:text-white border border-gray-400/30 hover:bg-gray-500/20 
                             rounded-lg transition-all duration-300 text-sm tracking-wide"
                    onClick={() => handleAfterResponse('done')}
                  >
                    Feel better now
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 'after' && (
            <div className="text-center mt-8">
              <h3 className="text-2xl font-light text-gray-300">Feeling calmer now? 🌊</h3>
              <p className="mt-4 text-gray-400 font-light">Time to fill your mind with peace.</p>
              <p className="mt-3 text-gray-500 text-sm">(Sage mode coming soon...)</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Home; 