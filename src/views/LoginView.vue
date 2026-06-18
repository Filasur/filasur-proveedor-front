<template>
  <div class="login-card card">
    <div class="login-brand">
      <img src="/favicon.svg" alt="FILASUR" class="logo-img">
      <div>
        <h2>FILASUR S.A.</h2>
        <p>Evaluación de proveedores</p>
      </div>
    </div>
    <form class="form-grid" @submit.prevent="onSubmit">
      <div>
        <label for="email">Correo electrónico</label>
        <input id="email" v-model="email" type="email" required autocomplete="username" />
      </div>
      <div>
        <label for="password">Contraseña</label>
        <input
          id="password"
          v-model="password"
          type="password"
          required
          autocomplete="current-password"
        />
      </div>
      <p class="forgot">
        <a href="#" @click.prevent="recuperar">¿Olvidaste tu contraseña?</a>
      </p>
      <p v-if="auth.error" class="error-text">{{ auth.error }}</p>
      <p v-if="info" class="info-text">{{ info }}</p>
      <button class="btn btn-primary" type="submit" :disabled="auth.loading">
        {{ auth.loading ? 'Ingresando...' : 'Iniciar sesión' }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { alertInfo, toastError, toastSuccess } from '@/utils/alerts'
import Swal from 'sweetalert2'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')
const info = ref('')

async function recuperar() {
  info.value = ''
  const result = await Swal.fire({
    title: 'Recuperar contraseña',
    customClass: {
      popup: 'recover-password-modal',
      htmlContainer: 'recover-password-container',
      confirmButton: 'recover-password-confirm',
    },
    html: `
      <div class="recover-password-form">
        <label for="swal-recover-email">Correo electrónico</label>
        <input
          id="swal-recover-email"
          type="email"
          value="${email.value}"
          placeholder="usuario@filasur.com"
          autocomplete="email"
        >
        <p class="recover-password-help">
          Se generará una contraseña temporal para el correo registrado.
        </p>
      </div>
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: 'Generar temporal',
    cancelButtonText: 'Cancelar',
    didOpen: () => {
      const input = document.getElementById('swal-recover-email')
      input?.focus()
      input?.select()
    },
    preConfirm: () => {
      const value = document.getElementById('swal-recover-email')?.value?.trim() || ''
      if (!value) {
        Swal.showValidationMessage('Ingrese su correo electrónico.')
        return false
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        Swal.showValidationMessage('Ingrese un correo válido.')
        return false
      }
      return value
    },
  })
  if (!result.isConfirmed || !result.value) return

  try {
    const data = await auth.recuperarPassword(result.value)
    if (data?.passwordTemporal) {
      await alertInfo(
        'Contraseña temporal generada',
        `Use esta contraseña para ingresar y luego cámbiela: ${data.passwordTemporal}`,
      )
    } else {
      toastSuccess(data?.message || 'Solicitud procesada.')
    }
  } catch (e) {
    toastError(e.message || 'No se pudo recuperar la contraseña.')
  }
}

function validarPoliticaPassword(value) {
  return {
    length: value.length >= 8,
    upper: /[A-Z]/.test(value),
    lower: /[a-z]/.test(value),
    number: /[0-9]/.test(value),
    special: /[^a-zA-Z0-9]/.test(value),
  }
}

function passwordCumplePolitica(value) {
  return Object.values(validarPoliticaPassword(value)).every(Boolean)
}

async function solicitarCambioPassword() {
  const result = await Swal.fire({
    title: 'Cambiar contraseña',
    customClass: {
      popup: 'password-change-modal',
      htmlContainer: 'password-change-container',
      confirmButton: 'password-change-confirm',
    },
    html: `
      <div class="password-change-form">
        <label for="swal-current-password">Contraseña actual</label>
        <input id="swal-current-password" type="password" placeholder="Ingrese su contraseña actual" autocomplete="current-password">

        <label for="swal-new-password">Nueva contraseña</label>
        <input id="swal-new-password" type="password" placeholder="Ej. Filasur2026!" autocomplete="new-password">

        <ul class="password-checklist" aria-live="polite">
          <li data-rule="length"><span class="check-icon">✓</span> Mínimo 8 caracteres</li>
          <li data-rule="upper"><span class="check-icon">✓</span> Una letra mayúscula</li>
          <li data-rule="lower"><span class="check-icon">✓</span> Una letra minúscula</li>
          <li data-rule="number"><span class="check-icon">✓</span> Un número</li>
          <li data-rule="special"><span class="check-icon">✓</span> Un carácter especial</li>
        </ul>
      </div>
    `,
    focusConfirm: false,
    allowOutsideClick: false,
    allowEscapeKey: false,
    confirmButtonText: 'Actualizar',
    didOpen: () => {
      const currentInput = document.getElementById('swal-current-password')
      const newInput = document.getElementById('swal-new-password')
      const confirmButton = Swal.getConfirmButton()

      const updateChecklist = () => {
        const currentPassword = currentInput?.value || ''
        const newPassword = newInput?.value || ''
        const rules = validarPoliticaPassword(newPassword)

        Object.entries(rules).forEach(([rule, valid]) => {
          const item = document.querySelector(`[data-rule="${rule}"]`)
          item?.classList.toggle('valid', valid)
        })

        if (confirmButton) {
          confirmButton.disabled = !currentPassword || !passwordCumplePolitica(newPassword)
        }
      }

      currentInput?.addEventListener('input', updateChecklist)
      newInput?.addEventListener('input', updateChecklist)
      updateChecklist()
    },
    preConfirm: () => {
      const passwordActual = document.getElementById('swal-current-password')?.value || ''
      const passwordNueva = document.getElementById('swal-new-password')?.value || ''
      if (!passwordActual) {
        Swal.showValidationMessage('Ingrese su contraseña actual.')
        return false
      }
      if (!passwordCumplePolitica(passwordNueva)) {
        Swal.showValidationMessage('La nueva contraseña aún no cumple la política requerida.')
        return false
      }
      return { passwordActual, passwordNueva }
    },
  })

  if (!result.isConfirmed) return false

  try {
    await auth.cambiarPassword(result.value.passwordActual, result.value.passwordNueva)
    toastSuccess('Contraseña actualizada correctamente.')
    return true
  } catch (e) {
    toastError(e.message || 'No se pudo cambiar la contraseña.')
    return false
  }
}

async function onSubmit() {
  try {
    await auth.login(email.value, password.value)
    if (auth.debeCambiarPassword) {
      const actualizado = await solicitarCambioPassword()
      if (!actualizado) return
    }
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/dashboard'
    router.push(redirect)
  } catch {
    /* error en store */
  }
}
</script>

<style scoped>
:global(.recover-password-modal) {
  width: min(420px, calc(100vw - 32px));
  border-radius: 14px;
  padding: 28px 28px 24px;
}

:global(.recover-password-container) {
  margin: 18px 0 0;
  overflow: visible;
}

:global(.recover-password-form) {
  display: grid;
  gap: 8px;
  text-align: left;
}

:global(.recover-password-form label) {
  font-size: 13px;
  font-weight: 600;
  color: var(--filasur-text);
}

:global(.recover-password-form input) {
  width: 100%;
  box-sizing: border-box;
  margin: 0;
  padding: 11px 12px;
  border: 1px solid var(--filasur-border);
  border-radius: 8px;
  font-size: 14px;
  outline: none;
}

:global(.recover-password-form input:focus) {
  border-color: var(--filasur-primary);
  box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.14);
}

:global(.recover-password-help) {
  margin: 4px 0 0;
  padding: 10px 12px;
  border-radius: 8px;
  background: #e6f7ff;
  color: #0958d9;
  font-size: 12px;
  line-height: 1.45;
}

:global(.recover-password-confirm) {
  min-width: 150px;
}

:global(.password-change-modal) {
  width: min(420px, calc(100vw - 32px));
  border-radius: 14px;
  padding: 28px 28px 24px;
}

:global(.password-change-container) {
  margin: 18px 0 0;
  overflow: visible;
}

:global(.password-change-form) {
  display: grid;
  gap: 8px;
  text-align: left;
}

:global(.password-change-form label) {
  font-size: 13px;
  font-weight: 600;
  color: var(--filasur-text);
}

:global(.password-change-form input) {
  width: 100%;
  box-sizing: border-box;
  margin: 0 0 10px;
  padding: 11px 12px;
  border: 1px solid var(--filasur-border);
  border-radius: 8px;
  font-size: 14px;
  outline: none;
}

:global(.password-change-form input:focus) {
  border-color: var(--filasur-primary);
  box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.14);
}

:global(.password-checklist) {
  display: grid;
  gap: 7px;
  margin: 0;
  padding: 12px;
  border-radius: 10px;
  background: #fafafa;
  border: 1px solid var(--filasur-border);
  list-style: none;
}

:global(.password-checklist li) {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--filasur-muted);
  font-size: 12px;
  line-height: 1.35;
}

:global(.password-checklist .check-icon) {
  display: inline-grid;
  place-items: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #f0f0f0;
  color: transparent;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}

:global(.password-checklist li.valid) {
  color: #237804;
}

:global(.password-checklist li.valid .check-icon) {
  background: #52c41a;
  color: #fff;
}

:global(.password-change-confirm) {
  min-width: 120px;
}

:global(.password-change-confirm:disabled) {
  cursor: not-allowed;
  opacity: 0.55;
}

.login-card {
  width: min(420px, 100%);
  padding: 32px;
}

.login-brand {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 24px;
}

.logo {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: var(--filasur-sidebar);
  color: #fff;
  display: grid;
  place-items: center;
  font-weight: 700;
  font-size: 20px;
}

.login-brand h2 {
  margin: 0;
}

.login-brand p {
  margin: 4px 0 0;
  color: var(--filasur-muted);
}

.hint {
  font-size: 12px;
  color: var(--filasur-muted);
  margin: 0;
}

.forgot {
  margin: 0;
  text-align: right;
  font-size: 13px;
}

.forgot a {
  color: var(--filasur-primary);
}

.info-text {
  color: var(--filasur-primary);
  font-size: 13px;
  margin: 0;
}
</style>