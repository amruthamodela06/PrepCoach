export default function ThemeToggle({ onToggle }) {
  return (
    <button
      type="button"
      className="theme-toggle"
      title="Toggle dark mode"
      aria-label="Toggle dark mode"
      onClick={onToggle}
    >
      <svg className="icon-sun" viewBox="0 0 24 24" width="18" height="18">
        <path fill="currentColor" d="M12 4.5a1 1 0 0 1-1-1V2a1 1 0 1 1 2 0v1.5a1 1 0 0 1-1 1Zm0 15a1 1 0 0 1 1 1V22a1 1 0 1 1-2 0v-1.5a1 1 0 0 1 1-1ZM4.5 12a1 1 0 0 1-1 1H2a1 1 0 1 1 0-2h1.5a1 1 0 0 1 1 1Zm17.5 0a1 1 0 0 1-1 1h-1.5a1 1 0 1 1 0-2H21a1 1 0 0 1 1 1ZM6.34 7.76a1 1 0 0 1-1.42 0L3.87 6.71a1 1 0 1 1 1.41-1.42L6.34 6.34a1 1 0 0 1 0 1.42Zm11.32 11.32a1 1 0 0 1-1.42 0l-1.05-1.05a1 1 0 1 1 1.42-1.42l1.05 1.05a1 1 0 0 1 0 1.42ZM6.34 16.24a1 1 0 0 1 0 1.42l-1.05 1.05a1 1 0 1 1-1.42-1.42l1.05-1.05a1 1 0 0 1 1.42 0Zm11.32-11.32a1 1 0 0 1 0 1.42l-1.05 1.05a1 1 0 1 1-1.42-1.42l1.05-1.05a1 1 0 0 1 1.42 0ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Z" />
      </svg>
      <svg className="icon-moon" viewBox="0 0 24 24" width="18" height="18">
        <path fill="currentColor" d="M20.35 14.64A9 9 0 0 1 9.36 3.65a.75.75 0 0 0-.9-1A10.5 10.5 0 1 0 21.4 15.5a.75.75 0 0 0-1.05-.86Z" />
      </svg>
    </button>
  )
}
