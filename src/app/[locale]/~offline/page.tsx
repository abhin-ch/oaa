export default function OfflinePage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-bg-base px-6">
      <svg
        viewBox="-1 -1 110 110"
        fill="currentColor"
        className="mb-8 h-12 w-12 text-text-tertiary"
        aria-hidden="true"
      >
        <path
          d="M102.69,12.11v18.4a54.9,54.9,0,0,0-25.3-25.3h18.4V-.19H-.11v95.9h5.4V77.31a54.9,54.9,0,0,0,25.3,25.3H12.19V108h95.9V12.11ZM5.29,5.21h25.3a54.9,54.9,0,0,0-25.3,25.3Zm0,48.7A48.7,48.7,0,1,1,54,102.61,48.76,48.76,0,0,1,5.29,53.91Zm72.2,48.7a54.9,54.9,0,0,0,25.3-25.3v25.3Z"
          transform="translate(0.11 0.19)"
        />
      </svg>
      <h1 className="text-lg font-semibold text-text-primary">You are offline</h1>
      <p className="mt-2 max-w-xs text-center text-sm leading-relaxed text-text-tertiary">
        Please check your internet connection and try again.
      </p>
    </div>
  );
}
