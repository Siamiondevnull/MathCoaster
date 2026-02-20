interface OutOfBoundsModalProps {
  onRestart: () => void
  onRebuild: () => void
}

export function OutOfBoundsModal({
  onRestart,
  onRebuild,
}: OutOfBoundsModalProps) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal out-of-bounds-modal">
        <h3 className="modal-title out-of-bounds-title">
          OutOfBoundsException
        </h3>
        <p className="out-of-bounds-trace">
          Error trace: hey, where is the ball?
        </p>
        <div className="modal-actions">
          <button type="button" className="modal-btn" onClick={onRestart}>
            Restart
          </button>
          <button type="button" className="modal-btn modal-btn-primary" onClick={onRebuild}>
            Rebuild
          </button>
        </div>
      </div>
    </div>
  )
}
