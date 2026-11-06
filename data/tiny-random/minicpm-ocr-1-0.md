# tiny-random/minicpm-ocr-1.0

## Resumen

`tiny-random/minicpm-ocr-1.0` es un modelo de prueba generado automáticamente por `tiny-random` a partir de `openbmb/MiniCPM-OCR-1.0`, el modelo OCR multimodal de OpenBMB. No se trata de un modelo funcional para producción: es un checkpoint con pesos inicializados aleatoriamente y dimensiones reducidas, diseñado exclusivamente para depuración y para validar pipelines de inferencia con la arquitectura MiniCPM-OCR.

El modelo conserva la estructura arquitectónica de su base (atención híbrida con ciclos linear/full, torre visual con downsampling 4x, M-RoPE y embeddings atados) pero con anchos y profundidades drásticamente reducidos: 8 capas de backbone frente a 24, hidden width de 16 frente a 1.024, y 4 capas visuales frente a 27. El resultado son 7.575.584 parámetros totales en BF16, con un único fichero `model.safetensors` de 15,18 MB.

Su relevancia es puramente instrumental: permite a desarrolladores verificar que su entorno (Transformers ≥ 5.21.0, CUDA, Triton, Pillow) y su código de carga e inferencia funcionan con la familia MiniCPM-OCR antes de descargar el checkpoint real de 1,30B parámetros. No debe confundirse con un modelo OCR operativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MiniCPM-OCR (transformer híbrido: ciclos linear-attention + full-attention, con torre visual) |
| Parametros totales | 7.575.584 (BF16) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint publicado en BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16, `model.safetensors`, 15,18 MB) |

## Arquitectura y entrenamiento

El modelo replica la arquitectura de `openbmb/MiniCPM-OCR-1.0` con dimensiones reducidas. El backbone consta de 8 capas organizadas en dos ciclos completos de tres capas linear-attention seguidas de una full-attention (cadencia 3+1), frente a los seis ciclos de 24 capas del modelo original. La anchura oculta es de 16 y la MLP de 32. La atención usa 8 cabezas Q, 2 cabezas KV y dimensión de cabeza 256; la ruta de linear-attention emplea 16 cabezas clave/valor de dimensión 128. El vocabulario mantiene 248.100 filas con embeddings atados a la cabeza de salida, por lo que el checkpoint contiene una única tabla de tokens.

La torre visual tiene 4 capas, anchura 128 y un merger de inserción tras la capa 2 (en el original: 27 capas, anchura 1.152, merger tras la capa 6). El downsampling visual es 4x, igual que en el modelo base. Se conserva M-RoPE con secciones 11/11/10 y fracción parcial 0,25, y la predicción multi-token (MTP) está desactivada. No hay información sobre datos de entrenamiento, tokens vistos ni fases de RLHF/DPO: el checkpoint es de inicialización aleatoria, sin entrenamiento. La ruta de linear-attention requiere CUDA y Triton (verificada en una NVIDIA A800-SXM4-80GB según la model card).

## Capacidades

- Generación de texto condicionada a imagen (pipeline `image-text-to-text`): acepta una imagen y un prompt textual y produce tokens de salida.
- Procesamiento de imágenes de documento con downsampling 4x y control de `max_slice_nums` y `use_image_id` en el procesador.
- Compatibilidad con la API `AutoModelForImageTextToText` y `AutoProcessor` de Transformers ≥ 5.21.0.
- Soporte de plantilla de chat conversacional (`apply_chat_template`) con mensajes multimodales imagen+texto.
- Inferencia determinista con `do_sample=False` y generación con `max_new_tokens`.
- Capacidades OCR reales (lectura de documentos, tablas, fórmulas): no disponibles en este checkpoint, ya que los pesos son aleatorios.

## Casos de uso

- Validación de entorno de inferencia: comprobar que Transformers ≥ 5.21.0, CUDA, Triton y Pillow están correctamente instalados antes de cargar el modelo real de 1,30B, usando el snippet verificado de la model card.
- Pruebas de integración en CI/CD: ejecutar un smoke test que cargue el modelo, procese una imagen sintética de 448x448 y verifique que los logits son finitos (`torch.isfinite(logits).all()`), sin coste de GPU significativo.
- Depuración de pipelines de preprocesado: validar el flujo de `apply_chat_template` con `downsample_mode="4x"`, `max_slice_nums=1` y `use_image_id=False` antes de trasladarlo al modelo de producción.
- Desarrollo de wrappers y servidores de inferencia: probar APIs propias (FastAPI, vLLM, TGI) contra un checkpoint de 15 MB que replica la interfaz del modelo real, reduciendo tiempos de iteración.
- Test de compatibilidad de kernels de atención: verificar que la ruta de linear-attention con Triton compila y ejecuta en el hardware objetivo sin necesidad de reservar memoria para 1,30B parámetros.
- Formación y demos: ilustrar la estructura interna de un modelo OCR multimodal (torre visual, merger, M-RoPE, embeddings atados) con un checkpoint inspeccionable en minutos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un checkpoint con pesos aleatorios, cualquier métrica de calidad (MMLU, OCRBench, DocVQA, etc.) sería no significativa.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en BF16 (7,58M parámetros ≈ 15 MB de pesos más activaciones y caché KV mínimos).
- GPU recomendadas: cualquier GPU con soporte CUDA y Triton; la model card cita verificación en NVIDIA A800-SXM4-80GB, pero el tamaño no exige ese hardware.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) e incluso en iGPU con CUDA disponible.
- Opciones de despliegue: Transformers con `AutoModelForImageTextToText` y `attn_implementation="sdpa"`; otras opciones (vLLM, llama.cpp, Ollama, TGI) no están documentadas para este checkpoint.
- Latencia y throughput: no disponibles; por el tamaño, la latencia estará dominada por el arranque del proceso y la compilación de kernels Triton más que por el cómputo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tiny-random/minicpm-ocr-1.0 | 7,58M | no disponible | Pruebas y depuración | no disponible | Hugging Face (repo público) |
| openbmb/MiniCPM-OCR-1.0 | 1,30B (BF16) | no disponible | OCR multimodal en producción | no disponible | Hugging Face |
| Otros modelos tiny-random de la familia MiniCPM | variable (M) | no disponible | Pruebas y depuración | no disponible | Hugging Face |

La comparación relevante es con su modelo base: misma arquitectura e interfaz, pero 172 veces menos parámetros y sin entrenamiento. Frente a alternativas OCR de producción de otros autores, no se dispone de datos en la información proporcionada para establecer una comparativa de rendimiento.

## Limitaciones y advertencias

- Pesos inicializados aleatoriamente: el modelo no produce salidas OCR coherentes; cualquier texto generado es ruido estadístico.
- No apto para producción ni para evaluación de calidad: no debe usarse para medir precisión, latencia real ni comportamiento lingüístico del modelo base.
- Licencia no especificada: la model card no declara licencia, por lo que el uso comercial queda sin marco legal claro hasta consultar la licencia de `openbmb/MiniCPM-OCR-1.0`.
- Idiomas no declarados: no hay información sobre cobertura lingüística.
- Dependencia estricta de CUDA y Triton para la ruta de linear-attention; no funciona en CPU ni en entornos sin Triton.
- Requiere Transformers ≥ 5.21.0 y `trust_remote_code=True`, lo que implica ejecutar código del repositorio.
- Repo generado automáticamente por DeepSeek-V4.1-Flash: la trazabilidad del proceso de creación está en `.meta/create_model.py`, `.meta/model.log` y `.meta/env.json`, pero no hay revisión humana documentada.
- Riesgo de confusión: el nombre puede llevar a error si se interpreta como un modelo OCR funcional de la familia MiniCPM.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/tiny-random/minicpm-ocr-1.0
- Modelo base: https://huggingface.co/openbmb/MiniCPM-OCR-1.0
- Script de creación: `.meta/create_model.py` (dentro del repo)
- Log de estructura: `.meta/model.log` (dentro del repo)
- Entorno de generación: `.meta/env.json` (dentro del repo)
