import Mustache from './Mustache.jsx';

const STEPS = [
  { title: 'Photograph the pack', body: 'Front of the box, in good light.' },
  { title: 'We check it', body: 'Our AI confirms it’s a genuine Al Kabeer pack.' },
  { title: 'Scratch your prize', body: 'Rub off the golden crumb to see what you won.' },
];

export default function Landing({ onStart }) {
  return (
    <div className="landing">
      <header className="brandbar">
        <span className="wordmark" lang="en">
          <span lang="ar" dir="rtl">الكبير</span>
          <Mustache className="wordmark-stache" />
          Al Kabeer
        </span>
      </header>

      <main className="landing-main">
        <section className="hero" aria-labelledby="hero-title">
          <h1 id="hero-title" className="hero-title">
            <span className="hero-en">Scan&nbsp;&amp;&nbsp;Win</span>
            <span className="hero-ar" lang="ar" dir="rtl">امسح واربح</span>
          </h1>
          <p className="hero-lede">
            Snap your Al Kabeer Mozzarella Cheese Sticks pack and scratch an instant prize.
          </p>
          <button type="button" className="btn btn-primary btn-xl" onClick={onStart}>
            Get started
          </button>

          <ol className="steps">
            {STEPS.map((step, i) => (
              <li key={step.title} className="step">
                <span className="step-num" aria-hidden="true">{i + 1}</span>
                <span>
                  <strong>{step.title}</strong>
                  <span className="step-body">{step.body}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>

        <figure className="pack-stage">
          <div className="pack-plate" aria-hidden="true" />
          <img
            className="pack-img"
            src="/products/mozzarella-sticks.png"
            alt="Al Kabeer Mozzarella Cheese Sticks, 250 g pack"
            width="865"
            height="1020"
          />
          <figcaption className="pack-tag">
            Look for this pack
            <span lang="ar" dir="rtl">اصابع جبنة الموزاريلا</span>
          </figcaption>
        </figure>
      </main>

      <footer className="landing-foot">Proof of concept. Prizes shown are for demonstration only.</footer>
    </div>
  );
}
