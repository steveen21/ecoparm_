document.addEventListener('DOMContentLoaded', function () {
    const modal = document.getElementById('emergencia-modal');
    const form = document.getElementById('emergencia-form');
    const addBtn = document.getElementById('add-evidence-btn');
    const closeBtns = modal.querySelectorAll('.modal-close, .modal-close-btn');
    const modalTitle = document.getElementById('modal-title');
    const submitBtn = document.getElementById('submit-btn');
    const fechaInput = document.getElementById('fecha-input');
    const tipoInput = document.getElementById('tipo-input');
    const gravedadInput = document.getElementById('gravedad-input');
    const observacionesInput = document.getElementById('observaciones-input');
    const imagenInput = document.getElementById('imagen-input');
    const registroIdInput = document.getElementById('registro-id-input');
    const imagenPreview = document.getElementById('imagen-preview');
    const uploadTextContainer = document.getElementById('upload-text-container');

    // Función para obtener la fecha actual en formato YYYY-MM-DD
    function getFechaActual() {
        const hoy = new Date();
        const año = hoy.getFullYear();
        const mes = String(hoy.getMonth() + 1).padStart(2, '0');
        const dia = String(hoy.getDate()).padStart(2, '0');
        return `${año}-${mes}-${dia}`;
    }

    // Función para mostrar la vista previa de la imagen seleccionada
    function mostrarVistaPreviaImagen(file) {
        if (file && file.type.startsWith('image/')) {
            if (uploadTextContainer) uploadTextContainer.style.display = 'none';
            const reader = new FileReader();
            reader.onload = function (e) {
                imagenPreview.innerHTML = `
                    <div style="text-align:center;">
                        <img src="${e.target.result}" alt="Vista previa" style="max-width:100%; max-height:200px; border-radius:6px; margin-bottom:10px;">
                        <br>
                        <button type="button" class="btn btn-outline" id="btn-eliminar-preview">Eliminar imagen</button>
                    </div>
                `;
                // Botón para eliminar la vista previa y volver a mostrar el texto
                const btnEliminar = document.getElementById('btn-eliminar-preview');
                if (btnEliminar) {
                    btnEliminar.onclick = function () {
                        imagenPreview.innerHTML = '';
                        if (uploadTextContainer) uploadTextContainer.style.display = '';
                        imagenInput.value = '';
                    };
                }
            };
            reader.readAsDataURL(file);
        } else {
            imagenPreview.innerHTML = '';
            if (uploadTextContainer) uploadTextContainer.style.display = '';
        }
    }

    // Abrir modal para agregar
    addBtn.addEventListener('click', function () {
        modal.style.display = ''; // Asegura que el modal esté visible
        modal.classList.add('show');
        modalTitle.textContent = 'Agregar Emergencia';
        submitBtn.textContent = 'Subir';
        form.action = window.location.pathname; // POST a la misma URL
        registroIdInput.value = '';
        fechaInput.value = getFechaActual(); // Establece la fecha actual por defecto
        tipoInput.value = '';
        gravedadInput.value = '';
        observacionesInput.value = '';
        imagenInput.value = '';
        imagenPreview.innerHTML = '';
        if (uploadTextContainer) uploadTextContainer.style.display = '';
        imagenInput.required = true;
    });

    // Abrir modal para editar
    document.querySelectorAll('.btn-edit').forEach(function (btn) {
        btn.addEventListener('click', function () {
            modal.style.display = ''; // Asegura que el modal esté visible
            modal.classList.add('show');
            modalTitle.textContent = 'Editar Emergencia';
            submitBtn.textContent = 'Actualizar';
            fechaInput.value = btn.getAttribute('data-fecha');
            tipoInput.value = btn.getAttribute('data-tipo');
            gravedadInput.value = btn.getAttribute('data-gravedad');
            observacionesInput.value = btn.getAttribute('data-observaciones');
            registroIdInput.value = btn.getAttribute('data-id');
            form.action = `/emergencias/editar/${btn.getAttribute('data-id')}/`;
            imagenInput.value = '';
            imagenInput.required = false;
            // Mostrar preview de imagen actual
            const imgUrl = btn.getAttribute('data-imagen-url');
            if (imgUrl) {
                imagenPreview.innerHTML = `
                <div style="text-align:center;">
                    <img src="${imgUrl}" alt="Imagen actual" style="max-width:100%; max-height:200px; border-radius:6px; margin-bottom:10px;">
                    <br>
                    <button type="button" class="btn btn-outline" id="btn-eliminar-preview">Cambiar imagen</button>
                </div>
                `;
                if (uploadTextContainer) uploadTextContainer.style.display = 'none';
                // Botón para eliminar la vista previa y volver a mostrar el texto
                const btnEliminar = document.getElementById('btn-eliminar-preview');
                if (btnEliminar) {
                    btnEliminar.onclick = function () {
                        imagenPreview.innerHTML = '';
                        if (uploadTextContainer) uploadTextContainer.style.display = '';
                        imagenInput.value = '';
                    };
                }
            } else {
                imagenPreview.innerHTML = '';
                if (uploadTextContainer) uploadTextContainer.style.display = '';
            }
        });
    });

    // Cerrar modal
    closeBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            modal.classList.remove('show');
            modal.style.display = ''; // Restablece el display
        });
    });

    // Opcional: Cerrar modal al hacer click fuera
    modal.addEventListener('click', function (e) {
        if (e.target === modal) {
            modal.classList.remove('show');
            modal.style.display = '';
        }
    });

    // Mostrar vista previa al seleccionar nueva imagen (tanto al agregar como al editar)
    imagenInput.addEventListener('change', function () {
        mostrarVistaPreviaImagen(this.files[0]);
    });

    // Validación adicional para el formulario
    form.addEventListener('submit', function(e) {
        const fecha = fechaInput.value;
        const hoy = getFechaActual();
        
        if (fecha > hoy) {
            e.preventDefault();
            alert('La fecha de la emergencia no puede ser futura.');
            return false;
        }
    });
});