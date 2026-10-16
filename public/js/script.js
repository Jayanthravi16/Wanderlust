(() => {
  'use strict'

  const forms = document.querySelectorAll('.needs-validation')

  forms.forEach(form => {
    const controls = form.querySelectorAll('input, select, textarea')

    const updateInvalidState = control => {
      control.classList.toggle('is-invalid', !control.checkValidity())
    }

    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      }

      controls.forEach(updateInvalidState)
      form.classList.add('was-validated')
    })

    controls.forEach(control => {
      control.addEventListener('input', () => {
        if (form.classList.contains('was-validated')) {
          updateInvalidState(control)
        }
      })
      control.addEventListener('change', () => {
        if (form.classList.contains('was-validated')) {
          updateInvalidState(control)
        }
      })
    })
  })
})()