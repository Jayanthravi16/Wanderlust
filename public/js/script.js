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

  const ratingOptions = document.querySelectorAll('.review-rating-choice')

  if (ratingOptions.length > 0) {
    const updateRating = () => {
      const selectedRating = document.querySelector('input[name="review[rating]"]:checked')

      if (!selectedRating) return

      const rating = Number(selectedRating.value)

      ratingOptions.forEach((option, index) => {
        const optionRating = Number(option.querySelector('input').value)

        option.classList.toggle('is-selected', optionRating === rating)
        option.classList.toggle('is-lit', optionRating <= rating)
      })
    }

    document.querySelectorAll('input[name="review[rating]"]').forEach(input => {
      input.addEventListener('change', updateRating)
    })

    updateRating()
  }
})()