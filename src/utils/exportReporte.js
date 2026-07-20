import Swal from 'sweetalert2'

/** Modal unificado PDF / Excel (mismo estilo que reporte de proveedores). */
export async function seleccionarFormatoExportacion() {
  const result = await Swal.fire({
    title: 'Exportar reporte',
    html: `
      <div class="export-options">
        <button type="button" class="export-option selected" data-format="pdf">
          <strong>PDF</strong>
          <span>Vista lista para imprimir o guardar como PDF.</span>
        </button>
        <button type="button" class="export-option" data-format="excel">
          <strong>Excel</strong>
          <span>Archivo .xls con los datos filtrados.</span>
        </button>
      </div>
    `,
    icon: 'info',
    customClass: {
      popup: 'export-modal',
      htmlContainer: 'export-modal-body',
      confirmButton: 'export-confirm',
    },
    showCancelButton: true,
    confirmButtonText: 'Exportar PDF',
    cancelButtonText: 'Cancelar',
    didOpen: () => {
      const confirmButton = Swal.getConfirmButton()
      document.querySelectorAll('.export-option').forEach((button) => {
        button.addEventListener('click', () => {
          const selected = button.dataset.format
          document.querySelectorAll('.export-option').forEach((b) => b.classList.remove('selected'))
          button.classList.add('selected')
          if (confirmButton) {
            confirmButton.textContent = selected === 'excel' ? 'Exportar Excel' : 'Exportar PDF'
          }
        })
      })
    },
    preConfirm: () => {
      const selected = document.querySelector('.export-option.selected')?.dataset.format || 'pdf'
      return selected
    },
  })

  return result.isConfirmed ? result.value : null
}
