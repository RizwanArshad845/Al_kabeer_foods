import { useCallback, useEffect, useRef, useState } from 'react';
import Mustache from './Mustache.jsx';
import { checkPhoto, photoFromFile, photoFromVideo } from '../lib/photo.js';

const CHECK_STEPS = ['Finding the pack…', 'Reading the label…', 'Matching Al Kabeer products…', 'Almost there…'];

export default function Scanner({ onBack, onResult }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileRef = useRef(null);
  // camera: 'starting' | 'live' | 'unavailable'
  const [camera, setCamera] = useState('starting');
  const [photo, setPhoto] = useState(null);
  const [checking, setChecking] = useState(false);
  const [checkStep, setCheckStep] = useState(0);
  const [error, setError] = useState('');

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const startCamera = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) return setCamera('unavailable');
    setCamera('starting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setCamera('live');
    } catch {
      setCamera('unavailable');
    }
  }, []);

  useEffect(() => {
    startCamera();
    return stopCamera;
  }, [startCamera, stopCamera]);

  useEffect(() => {
    if (!checking) return;
    setCheckStep(0);
    const id = setInterval(() => setCheckStep((s) => Math.min(s + 1, CHECK_STEPS.length - 1)), 1500);
    return () => clearInterval(id);
  }, [checking]);

  const capture = () => {
    const video = videoRef.current;
    if (!video?.videoWidth) return;
    setPhoto(photoFromVideo(video));
    setError('');
    stopCamera();
  };

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      setPhoto(await photoFromFile(file));
      setError('');
      stopCamera();
    } catch (err) {
      setError(err.message);
    }
  };

  const retake = () => {
    setPhoto(null);
    setError('');
    startCamera();
  };

  const submit = async () => {
    setChecking(true);
    setError('');
    try {
      const result = await checkPhoto(photo);
      onResult(result, photo.dataUrl);
    } catch (err) {
      setError(err.message);
      setChecking(false);
    }
  };

  const fileInput = (
    <input
      ref={fileRef}
      type="file"
      accept="image/*"
      className="visually-hidden"
      tabIndex={-1}
      onChange={onFile}
    />
  );

  return (
    <div className="scanner">
      <header className="scanner-bar">
        <button type="button" className="icon-btn" onClick={onBack} aria-label="Back to start" disabled={checking}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
        </button>
        <p className="scanner-hint" aria-live="polite">
          {checking
            ? 'Checking your photo'
            : photo
              ? 'Is the whole front of the pack clear?'
              : 'Fit the front of the pack inside the frame'}
        </p>
      </header>

      <div className={`viewfinder${checking ? ' is-checking' : ''}`}>
        {/* The video stays mounted so a retake can reattach the stream straight away. */}
        <video
          ref={videoRef}
          className="viewfinder-media"
          playsInline
          muted
          autoPlay
          aria-label="Camera preview"
          hidden={Boolean(photo) || camera === 'unavailable'}
        />
        {photo && <img className="viewfinder-media" src={photo.dataUrl} alt="Your photo of the pack" />}

        {!photo && camera === 'unavailable' && (
          <div className="viewfinder-empty">
            <img src="/products/mozzarella-sticks.png" alt="" className="ghost-pack" />
            <p>
              The camera isn’t available here. Take or choose a photo of the pack instead.
            </p>
            <button type="button" className="btn btn-primary" onClick={() => fileRef.current?.click()}>
              Take or choose a photo
            </button>
          </div>
        )}

        <div className="frame" aria-hidden="true">
          <span /><span /><span /><span />
        </div>

        {checking && (
          <div className="checking" role="status">
            <div className="scanline" aria-hidden="true" />
            <div className="checking-card">
              <Mustache className="stache-loader" />
              <p>{CHECK_STEPS[checkStep]}</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="scan-error" role="alert">
          {error}
        </p>
      )}

      <div className="scanner-controls">
        {photo ? (
          <>
            <button type="button" className="btn btn-ghost" onClick={retake} disabled={checking}>
              Retake
            </button>
            <button type="button" className="btn btn-primary" onClick={submit} disabled={checking}>
              {checking ? 'Checking…' : error ? 'Try again' : 'Check my photo'}
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className="text-btn"
              onClick={() => fileRef.current?.click()}
            >
              Upload a photo
            </button>
            <button
              type="button"
              className="shutter"
              onClick={capture}
              disabled={camera !== 'live'}
              aria-label="Take photo"
            >
              <span />
            </button>
            <span className="controls-spacer" aria-hidden="true" />
          </>
        )}
      </div>
      {fileInput}
    </div>
  );
}
