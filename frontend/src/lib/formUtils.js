/**
 * Prevents form submission when Enter is pressed inside an input, select, or textarea.
 * Use on form's onKeyDown so that forms only submit when the user explicitly clicks the submit button.
 * This avoids accidental submission while typing (e.g. pressing Enter to complete a field).
 */
export function preventEnterSubmit(e) {
  if (e.key === 'Enter' && ['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target?.tagName)) {
    e.preventDefault()
  }
}
