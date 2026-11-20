export default function BrandMark({ onHome, providerInfo }) {
  const Tag = onHome ? 'button' : 'div'
  return (
    <Tag
      type={onHome ? 'button' : undefined}
      className={`brand-mark${onHome ? ' brand-mark-btn' : ''}`}
      onClick={onHome}
      title={onHome ? 'Return to PrepCoach home' : undefined}
    >
      <svg className="brand-logo" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
        <path fill="currentColor" d="M12 1.5 21.6 7v10L12 22.5 2.4 17V7Z" />
      </svg>
      <span className="brand-name">PrepCoach</span>
      {providerInfo?.provider && (
        <span className="brand-provider-pill" title={`Model: ${providerInfo.model || 'default'}`}>
          {providerInfo.provider}
        </span>
      )}
    </Tag>
  )
}
