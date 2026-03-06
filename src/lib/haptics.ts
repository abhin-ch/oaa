/** Light haptic tap — silent no-op on unsupported devices */
export function hapticTap() {
  navigator?.vibrate?.(8);
}

/** Medium haptic feedback for confirmations */
export function hapticConfirm() {
  navigator?.vibrate?.(12);
}
