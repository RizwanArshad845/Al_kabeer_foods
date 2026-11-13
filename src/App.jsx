import { useEffect, useState } from 'react';
import Landing from './components/Landing.jsx';
import Scanner from './components/Scanner.jsx';
import Result from './components/Result.jsx';

export default function App() {
  // screen: 'landing' | 'scan' | 'result'
  const [screen, setScreen] = useState('landing');
  const [outcome, setOutcome] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [screen]);

  if (screen === 'scan') {
    return (
      <Scanner
        onBack={() => setScreen('landing')}
        onResult={(result, photoUrl) => {
          setOutcome({ result, photoUrl });
          setScreen('result');
        }}
      />
    );
  }

  if (screen === 'result' && outcome) {
    return (
      <Result
        {...outcome}
        onAgain={() => setScreen('scan')}
        onHome={() => setScreen('landing')}
      />
    );
  }

  return <Landing onStart={() => setScreen('scan')} />;
}
