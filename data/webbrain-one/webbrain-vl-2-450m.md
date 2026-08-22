# webbrain-one/webbrain-vl-2-450M

## Resumen

WebBrain-VL 2 450M es un modelo de visión-lenguaje especializado en la comprensión de interfaces de navegador, desarrollado por el equipo de WebBrain a partir del modelo base LiquidAI/LFM2.5-VL-450M. Con 448,7 millones de parámetros, convierte una captura de pantalla del viewport en un formato de observación estructurado en seis secciones que el agente planificador de WebBrain consume para automatizar tareas en el navegador. Su propósito principal es servir como capa visual local y compacta para agentes de automatización web, especialmente cuando no se dispone de un modelo de visión de mayor tamaño.

El modelo se entrenó mediante fine-tuning con LoRA (rank 16, alpha 32) sobre un corpus de 50.000 capturas de pantalla de navegador, etiquetadas por un modelo profesor (Qwen3.6-35B-A3B). La licencia es LFM Open License v1.0, una licencia de código abierto con condiciones de redistribución y atribución. Su peso es inferior a un gigabyte, lo que permite ejecutarlo en el navegador mediante WebGPU, como se demuestra en la integración de WebBrain 31.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer (basado en LFM2.5-VL-450M) |
| Parametros totales | 448.718.848 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | no disponible (solo safetensors original) |
| Idiomas soportados | no disponibles |
| Licencia | LFM Open License v1.0 (licencia `other` con nombre `lfm1.0`) |
| Formato de pesos | safetensors (tambien disponible adaptador LoRA y ONNX) |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM2.5-VL-450M, un modelo de visión-lenguaje de 450M de parámetros. El fine-tuning se realizó mediante LoRA (rank 16, alpha 32, dropout 0.05) sobre el modelo completo, seguido de una fusión de los pesos. El entrenamiento se llevó a cabo durante una época, con un batch efectivo de 16, learning rate de 1e-4 con programación coseno y un 3% de warmup, en precisión BF16 con gradient checkpointing. Se seleccionó el checkpoint en el paso 2.929, que alcanzó una pérdida de validación de 0.324976, ligeramente inferior al paso 2.500 (0.326301).

El corpus de entrenamiento contiene 50.000 capturas de pantalla únicas de navegador, procedentes de cuatro fuentes: datos sintéticos propios (33.354 filas, CC-BY-4.0), WebSight de HuggingFaceM4 (9.561 filas), miniwob-plusplus de Farama-Foundation (4.592 filas) y screenparse de docling-project (2.493 filas). Las etiquetas fueron generadas por el modelo profesor qwen/qwen3.6-35b-a3b (49.634 respuestas) y su variante cuantizada Qwen/Qwen3.6-35B-A3B-Q4_K_M (366 respuestas). El corpus está equilibrado para cubrir capacidades específicas del navegador: OCR multilingüe (8.000), formularios (4.500), autenticación (2.500), modales/consentimiento (3.500), estados de carga (2.500), tablas (3.500), dashboards (2.500), calendarios (2.500), oclusión/contraste (1.500) y páginas generales (2.354). Se realizaron comprobaciones de deduplicación y de fugas entre train y validación, confirmando cero solapamiento con la suite de evaluación de 100 casos.

## Capacidades

- Descripción estructurada de capturas de pantalla de navegador en seis secciones de observación, listas para un agente planificador.
- Identificación de texto visible en la interfaz, incluyendo texto pequeño, bajo contraste y multilingüe (aunque con limitaciones).
- Detección de elementos de formulario, estado de inputs, errores de formulario, diálogos, mensajes de consentimiento, overlays, indicadores de carga y bloqueos de página.
- Reconocimiento de elementos visuales como tablas, calendarios, dashboards y modales.
- Capacidad de funcionar como alternativa local compacta cuando no se dispone de un VLM grande.
- No es un modelo de visión general: su rendimiento fuera de capturas de navegador no ha sido medido y probablemente sea limitado.

## Casos de uso

- **Automatización de navegador con agente local**: el modelo convierte la captura de pantalla actual en una descripción estructurada que el agente de WebBrain usa para decidir el siguiente paso (hacer clic, escribir, navegar). Su tamaño permite ejecutarlo en el navegador con WebGPU, sin depender de servicios en la nube.
- **Testing de interfaces de usuario**: puede integrarse en pipelines de pruebas para verificar que los elementos de la página (formularios, botones, errores) se renderizan correctamente, comparando la observación generada con el estado esperado.
- **Asistente de accesibilidad**: puede describir el contenido de una página para usuarios con discapacidad visual, extrayendo texto y estado de los elementos interactivos.
- **Extracción de datos de pantalla**: en combinación con un agente de automatización, puede extraer información de dashboards, tablas o formularios convirtiendo la captura en texto estructurado que luego se procesa con un LLM.
- **Depuración de páginas web**: al detectar errores de formulario, overlays o bloques de consentimiento, puede ayudar a identificar problemas de UX en desarrollo.
- **Sistema de monitorización de aplicaciones**: puede analizar periódicamente capturas de pantalla de una aplicación web para detectar estados de carga, errores o elementos inesperados, generando alertas.

## Benchmarks y rendimiento

Se evaluó sobre una suite fija de 100 casos de visión de navegador, utilizando el prompt de producción de seis secciones exactamente una vez tras la selección del checkpoint. Los resultados se comparan con el modelo base y con la versión v1 del modelo WebBrain:

| Checkpoint | Pases estrictos | Media de rúbrica | Errores |
| --- | ---: | ---: | ---: |
| Base LFM2.5-VL-450M | 0/100 | 4.17% | 0 |
| WebBrain-VL v1 (16.646 ejemplos) | 30/100 | 70.06% | 0 |
| WebBrain-VL v2 (50.000 ejemplos) | 36/100 | 74.99% | 0 |

No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- Entrenamiento: una NVIDIA RTX 4090 de 24 GB, con pico de VRAM de 23.272 MiB en BF16 con gradient checkpointing.
- Inferencia: el modelo pesa menos de 1 GB (0.9 GB), por lo que puede ejecutarse en GPU consumer como RTX 3060, RTX 4060, o incluso en CPU con cuantización (aunque no se proporcionan datos de cuantización).
- Ejecución en navegador: WebBrain 31 lo utiliza como capa visual local mediante WebGPU, lo que indica que puede funcionar en hardware de consumo sin GPU dedicada.
- Opciones de despliegue: soporta el formato safetensors de transformers, y se menciona un paquete ONNX en los artefactos de reproducibilidad. No hay datos específicos de vLLM, llama.cpp u Ollama, pero al ser un modelo pequeño es compatible con estos entornos.
- Latencia: no se publican cifras de latencia, ya que depende de la implementación y el hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Uso principal |
| --- | --- | --- | --- | --- |
| WebBrain-VL 2 450M | 448,7 M | no disponible | LFM Open v1.0 | Comprensión de GUI de navegador |
| LFM2.5-VL-450M (base) | 450 M | no disponible | LFM Open v1.0 | VLM general de pequeño tamaño |
| Qwen2-VL-2B (referencia) | 2.0 B | 32k (típico) | Apache 2.0 | VLM general, visión y OCR |

WebBrain-VL 2 450M se diferencia de su base en que está específicamente afinado para la tarea de descripción de capturas de navegador, mejorando la precisión de 4.17% a 74.99% en la suite de evaluación. Comparado con alternativas generales como Qwen2-VL-2B, es mucho más ligero y especializado, pero no puede generalizar a otras tareas de visión sin una evaluación adicional. No se dispone de datos comparativos de otros modelos de la misma categoría (especialistas en GUI de navegador).

## Limitaciones y advertencias

- El modelo puede fallar con texto pequeño, de bajo contraste, ocluido o no latino.
- Puede alucinar etiquetas de UI o estados, especialmente en presencia de overlays o diálogos.
- La detección de foco, estado deshabilitado, errores de formulario exactos y señales de preparación requiere corroboración visual adicional.
- Hereda errores y sesgos de estilo de respuesta del modelo profesor (Qwen3.6-35B-A3B), que pueden contener errores de OCR o alucinaciones.
- No se ha medido la regresión en imágenes generales; no debe usarse fuera de capturas de navegador sin una evaluación previa.
- Una respuesta sintácticamente válida en formato de seis secciones no garantiza que la automatización sea segura; no debe tomarse como autorización para realizar acciones de alto impacto (contraseñas, pagos, identidad).
- Licencia LFM Open v1.0 con condiciones de redistribución y atribución; hay que conservar el archivo LICENSE y las licencias de los componentes del dataset.
- El modelo no es un reemplazo general de un VLM de frontera.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/webbrain-one/webbrain-vl-2-450M
- Dataset de entrenamiento: https://huggingface.co/datasets/webbrain-one/webbrain-vl-2-450M-dataset
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-VL-450M
- Repositorio de entrenamiento: https://github.com/esokullu/lfm-finetune
- Blog de WebBrain (WebBrain 3.1): https://www.webbrain.one/blog/webbrain-31-offline-webgpu-vision
- Sitio web de WebBrain: https://www.webbrain.one/
- Repositorio de la extensión WebBrain: https://github.com/webbrain-one/webbrain
