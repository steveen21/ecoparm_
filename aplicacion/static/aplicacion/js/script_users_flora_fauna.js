document.addEventListener('DOMContentLoaded', function () {
    const modal = document.getElementById('flora-fauna-modal');
    const form = document.getElementById('flora-fauna-form');
    const addBtn = document.getElementById('add-evidence-btn');
    const closeBtns = modal.querySelectorAll('.modal-close, .modal-close-btn');
    const modalTitle = document.getElementById('modal-title');
    const submitBtn = document.getElementById('submit-btn');
    const tipoInput = document.getElementById('tipo-input');
    const nombreInput = document.getElementById('nombre-input');
    const descripcionInput = document.getElementById('descripcion-input');
    const imagenInput = document.getElementById('imagen-input');
    const registroIdInput = document.getElementById('registro-id-input');
    const imagenPreview = document.getElementById('imagen-preview');
    const uploadTextContainer = document.getElementById('upload-text-container');

    // Configurar botones de eliminar
    configurarBotonesEliminar();

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
        modal.style.display = '';
        modal.classList.add('show');
        modalTitle.textContent = 'Agregar Flora o Fauna';
        submitBtn.textContent = 'Subir';
        form.action = window.location.pathname;
        registroIdInput.value = '';
        tipoInput.value = '';
        nombreInput.value = '';
        descripcionInput.value = '';
        imagenInput.value = '';
        imagenPreview.innerHTML = '';
        if (uploadTextContainer) uploadTextContainer.style.display = '';
        imagenInput.required = true;
    });

    // Abrir modal para editar
    document.querySelectorAll('.btn-edit').forEach(function (btn) {
        btn.addEventListener('click', function () {
            modal.style.display = '';
            modal.classList.add('show');
            modalTitle.textContent = 'Editar Flora o Fauna';
            submitBtn.textContent = 'Actualizar';
            tipoInput.value = btn.getAttribute('data-tipo');
            nombreInput.value = btn.getAttribute('data-nombre');
            descripcionInput.value = btn.getAttribute('data-descripcion');
            registroIdInput.value = btn.getAttribute('data-id');
            form.action = `/flora-fauna/editar/${btn.getAttribute('data-id')}/`;
            imagenInput.value = '';
            imagenInput.required = false;
            
            // Mostrar preview de imagen actual
            const imgUrl = btn.getAttribute('data-imagen-url');
            if (imgUrl) {
                imagenPreview.innerHTML = `
                <div style="text-align:center;">
                    <img src="${imgUrl}" alt="Imagen actual" style="max-width:100%; max-height:200px; border-radius:6px; margin-bottom:10px;">
                    <br>
                    <button type="button" class="btn btn-outline" id="btn-eliminar-preview">Eliminar imagen</button>
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
            modal.style.display = '';
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

    // Manejar envío del formulario
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(form);
        const registroId = formData.get('registro_id');
        const url = registroId ? `/flora-fauna/editar/${registroId}/` : window.location.pathname;
        
        const loadingAlert = showEcoparmAlert('Procesando', registroId ? 'Actualizando registro...' : 'Creando nuevo registro...', {
            buttonText: '',
            autoclose: false,
            showProgress: true
        });

        try {
            const response = await fetch(url, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRFToken': formData.get('csrfmiddlewaretoken'),
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            const data = await response.json();
            loadingAlert.close();

            if (data.success) {
                showEcoparmAlert('Éxito', data.message || 'Registro guardado correctamente', {
                    buttonText: 'Aceptar',
                    autocloseTime: 2000,
                    onAccept: function() {
                        form.reset();
                        modal.classList.remove('show');
                        location.reload();
                    }
                });
            } else {
                showEcoparmAlert('Error', 'Error al guardar registro: ' + (data.error || 'Error desconocido'), {
                    buttonText: 'Entendido'
                });
                
                // Mostrar errores de validación si existen
                if (data.errors) {
                    for (const field in data.errors) {
                        showInlineError(field, data.errors[field]);
                    }
                }
            }
        } catch (error) {
            loadingAlert.close();
            showEcoparmAlert('Error', 'Error al enviar: ' + error.message, {
                buttonText: 'Entendido'
            });
            console.error("Error completo:", error);
        }
    });
});

// Configurar botones de eliminar
function configurarBotonesEliminar() {
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', function() {
            const registroId = this.getAttribute('data-id');
            
            showConfirmationDialog(
                'Eliminar registro',
                '¿Estás seguro de eliminar este registro de flora/fauna?',
                async () => {
                    const loadingAlert = showEcoparmAlert('Eliminando', 'Eliminando registro...', {
                        buttonText: '',
                        autoclose: false,
                        showProgress: true
                    });
                    
                    try {
                        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
                        const formData = new FormData();
                        formData.append('csrfmiddlewaretoken', csrfToken);

                        const response = await fetch(`/flora-fauna/eliminar/${registroId}/`, {
                            method: 'POST',
                            body: formData,
                            headers: {
                                'X-CSRFToken': csrfToken,
                                'X-Requested-With': 'XMLHttpRequest'
                            }
                        });

                        const data = await response.json();
                        loadingAlert.close();

                        if (data.success) {
                            showEcoparmAlert('Éxito', data.message || 'Registro eliminado correctamente', {
                                buttonText: 'Aceptar',
                                autocloseTime: 2000,
                                onAccept: () => location.reload()
                            });
                        } else {
                            showEcoparmAlert('Error', 'Error: ' + (data.error || 'No se pudo eliminar el registro'), {
                                buttonText: 'Entendido'
                            });
                        }
                    } catch (error) {
                        loadingAlert.close();
                        showEcoparmAlert('Error', 'Error al eliminar: ' + error.message, {
                            buttonText: 'Entendido'
                        });
                        console.error('Error completo:', error);
                    }
                },
                {
                    confirmText: 'Eliminar',
                    cancelText: 'Cancelar'
                }
            );
        });
    });
}

// ==================== FUNCIONES DE ALERTAS (COPIADAS DE users_evidencias) ====================

function showEcoparmAlert(title, message, options = {}) {
    const alert = document.getElementById('custom-alert');
    const progressContainer = document.getElementById('progress-container');
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    const alertFooter = document.querySelector('.ecoparm-alert-footer');

    // Configurar contenido
    document.getElementById('alert-title').textContent = title;
    document.getElementById('alert-message').textContent = message;

    // Configurar progreso si se especifica
    if (options.progress !== undefined) {
        progressContainer.style.display = 'block';
        progressFill.style.width = options.progress + '%';
        progressText.textContent = options.progress + '%';
    } else {
        progressContainer.style.display = 'none';
    }

    // Configurar botones
    alertFooter.innerHTML = ''; // Limpiar botones anteriores

    if (options.showCancel) {
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'ecoparm-alert-button cancel';
        cancelBtn.textContent = options.cancelText || 'Cancelar';
        cancelBtn.onclick = function () {
            closeAlert();
            if (options.onCancel) options.onCancel();
        };
        alertFooter.appendChild(cancelBtn);
    }

    const okBtn = document.createElement('button');
    okBtn.className = 'ecoparm-alert-button confirm';
    okBtn.textContent = options.buttonText || 'Aceptar';
    okBtn.onclick = function () {
        closeAlert();
        if (options.onAccept) options.onAccept();
    };
    alertFooter.appendChild(okBtn);

    // Mostrar alerta
    alert.classList.remove('hidden');

    // Configurar autoclose si no es una confirmación
    const autocloseTime = options.autoclose === false ? null : (options.autocloseTime || 5000);

    if (autocloseTime && !options.showCancel) {
        // Limpiar timeout anterior si existe
        if (alert.timeoutId) {
            clearTimeout(alert.timeoutId);
        }

        alert.timeoutId = setTimeout(() => {
            closeAlert();
            if (options.onAccept) options.onAccept();
        }, autocloseTime);
    }

    function closeAlert() {
        alert.classList.add('hidden');
        if (alert.timeoutId) {
            clearTimeout(alert.timeoutId);
            alert.timeoutId = null;
        }
    }

    return {
        close: closeAlert,
        addButton: function(text, action, isPrimary = true) {
            const button = document.createElement('button');
            button.className = `ecoparm-alert-button ${isPrimary ? 'confirm' : 'cancel'}`;
            button.textContent = text;
            button.onclick = function() {
                if (action) action();
                closeAlert();
            };
            alertFooter.appendChild(button);
            return button;
        }
    };
}

function showConfirmationDialog(title, message, confirmCallback, options = {}) {
    return showEcoparmAlert(title, message, {
        buttonText: options.confirmText || 'Confirmar',
        autoclose: false,
        onAccept: confirmCallback,
        showCancel: true,
        cancelText: options.cancelText || 'Cancelar'
    });
}

function showInlineError(inputId, message, hint = '') {
    const inputElement = document.getElementById(inputId);
    const errorContainer = document.getElementById('inline-error');

    if (inputElement) {
        inputElement.classList.add('input-error');

        // Configurar mensajes
        document.getElementById('error-message-text').textContent = message;
        document.getElementById('error-hint-text').textContent = hint;

        // Posicionar después del campo
        inputElement.insertAdjacentElement('afterend', errorContainer);
        errorContainer.style.display = 'block';
    }
}

function hideInlineError(inputId) {
    const inputElement = document.getElementById(inputId);
    const errorContainer = document.getElementById('inline-error');

    if (inputElement) {
        inputElement.classList.remove('input-error');
    }
    errorContainer.style.display = 'none';
}