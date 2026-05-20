import { push } from 'notivue'
import Swal from 'sweetalert2'

const swalBase = {
  confirmButtonColor: '#1890ff',
  cancelButtonColor: '#8c8c8c',
  confirmButtonText: 'Confirmar',
  cancelButtonText: 'Cancelar',
  reverseButtons: true,
}

/** Toast: éxito */
export function toastSuccess(message) {
  push.success(message)
}

/** Toast: error */
export function toastError(message) {
  push.error(message)
}

/** Toast: información */
export function toastInfo(message) {
  push.info(message)
}

/** Toast: advertencia */
export function toastWarning(message) {
  push.warning(message)
}

/**
 * Modal de confirmación (SweetAlert2).
 * @returns {Promise<boolean>} true si el usuario confirmó
 */
export async function confirmAction({
  title,
  text = '',
  icon = 'question',
  confirmText = 'Confirmar',
  danger = false,
}) {
  const result = await Swal.fire({
    ...swalBase,
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonText: confirmText,
    confirmButtonColor: danger ? '#ff4d4f' : swalBase.confirmButtonColor,
  })
  return result.isConfirmed
}

/** Modal informativo (sin cancelar) */
export function alertInfo(title, text = '') {
  return Swal.fire({
    ...swalBase,
    title,
    text,
    icon: 'info',
    showCancelButton: false,
  })
}
