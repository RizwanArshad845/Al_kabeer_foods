export default function Mustache({ className = '', title }) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 34"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <path
        fill="currentColor"
        d="M60 14C52 4 38 2 28 10 20 16 12 22 4 16c-2-2-4 0-2 3 6 11 24 13 38 7 10-4 16-6 20-4 4-2 10 0 20 4 14 6 32 4 38-7 2-3 0-5-2-3-8 6-16 0-24-6-10-8-24-6-32 4z"
      />
    </svg>
  );
}
