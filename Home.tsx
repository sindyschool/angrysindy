import React, { useState, useEffect, useRef } from 'react';
import Lottie from 'lottie-react';
import explosionAnimation from '../assets/lottie/explosion.json';

const Home = () => {
  const [anger, setAnger] = useState(0);
  const [text, setText] = useState('');
  const [exploded, setExploded] = useState(false);
  const [flash, setFlash] = useState(false);
  const [step, setStep] = useState<'input' | 'exploded' | 'after'>('input');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize audio
    audioRef.current = new Audio('/explosion.mp3');
    audioRef.current.load();

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (anger >= 100) {
      setExploded(true);
      setFlash(true);
      
      // Handle vibration with fallback
      try {
        if (navigator.vibrate) {
          navigator.vibrate(300);
        }
      } catch (error) {
        console.warn('Vibration not supported');
      }

      // Play sound with error handling
      if (audioRef.current) {
        audioRef.current.play().catch((error) => {
          console.warn('Audio playback failed:', error);
        });
      }

      setTimeout(() => {
        setFlash(false);
        setStep('exploded');
      }, 500);
    }
  }, [anger]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setText(value);
    setAnger(Math.min(100, value.length));
  };

  const handleAfterResponse = (choice: 'more' | 'done') => {
    if (choice === 'more') {
      setText('');
      setAnger(0);
      setExploded(false);
      setStep('input');
    } else {
      setStep('after');
    }
  };

  return (
    <div
      className={`flex flex-col items-center justify-center min-h-[80vh] text-center px-4 transition duration-300 ${flash ? 'bg-red-200' : ''}`}
      role="main"
      aria-label="Angry Sindy - Emotional Release App"
    >
      {step === 'input' && (
        <>
          <h2 className="text-3xl font-bold text-red-600 mb-4">감정 배출을 시작해볼까요?</h2>
          <p className="mb-4 text-gray-700">Angry Sindy가 당신의 감정을 안전하게 함께 터뜨려줄게요.</p>

          <textarea
            value={text}
            onChange={handleInput}
            rows={5}
            className="w-full max-w-lg p-4 border-2 border-red-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-red-400"
            placeholder="하고 싶은 말, 다 적어보세요..."
            aria-label="Express your feelings"
            aria-describedby="anger-level"
          />
          <div 
            className="w-full max-w-lg h-4 bg-gray-200 rounded-full overflow-hidden my-4"
            role="progressbar"
            aria-valuenow={anger}
            aria-valuemin={0}
            aria-valuemax={100}
            id="anger-level"
          >
            <div
              className="h-full bg-red-500 transition-all duration-300"
              style={{ width: `${anger}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600">{anger}% 감정이 차오르고 있어요...</p>
        </>
      )}

      {step === 'exploded' && (
        <div className="w-full max-w-md mt-8 animate-ping-fast">
          <Lottie animationData={explosionAnimation} loop={false} />
          <h3 className="text-3xl font-extrabold text-red-700 mt-4 animate-bounce">펑! 감정이 터졌어요!</h3>

          <p className="mt-6 text-lg text-gray-800">어때요, 좀 속이 풀렸나요?</p>
          <div className="flex gap-4 mt-4 justify-center">
            <button
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-xl"
              onClick={() => handleAfterResponse('more')}
              aria-label="Still angry, continue expressing"
            >
              아직 화 안 풀렸어요
            </button>
            <button
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-xl"
              onClick={() => handleAfterResponse('done')}
              aria-label="Feeling better, finish"
            >
              네! 좀 풀렸어요
            </button>
          </div>
        </div>
      )}

      {step === 'after' && (
        <div className="text-center mt-8">
          <h3 className="text-2xl font-bold text-emerald-600">이제 화는 좀 가라앉았죠? 😊</h3>
          <p className="mt-2 text-gray-700">그럼 이젠 내 마음에 좋은 것도 넣어줄 시간이에요. 🌿</p>
          <p className="mt-2 text-gray-500 text-sm">(곧 Sage 모드가 시작됩니다...)</p>
        </div>
      )}
    </div>
  );
};

export default Home; 