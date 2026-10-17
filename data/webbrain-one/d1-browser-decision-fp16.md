# webbrain-one/d1-browser-decision-fp16

## Resumen

d1-browser-decision-fp16 es la versión con pesos FP16 de webbrain-one/d1-browser-decision-fp32, un derivado experimental y sin audio de LiquidAI/d1-omni-600M. No es un modelo generativo: puntúa opciones con nombre para preguntas de tipo `choice`, `noul` y `score` ordinal a partir de estado texto/JSON y capturas de pantalla opcionales, y no produce texto ni tokens.

Lo desarrolla webbrain-one para la extensión WebBrain, que lo descarga como proveedor de decisión opcional en el dispositivo. Su interés práctico es que reduce el paquete de 1.900.356.386 bytes a 950.872.204 bytes y el mayor búfer de 256 MiB a 128 MiB, manteniendo la paridad de decisión con FP32 en las pruebas publicadas.

La arquitectura se distribuye como tres grafos ONNX y se ejecuta con ONNX Runtime en WebGPU o CPU/WASM. La licencia es LFM Open License v1.0, no Apache/MIT, y el modelo se marca como experimental; no hay benchmarks estándar ni datos de idiomas en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder multimodal con capas de atención completa, módulo de visión y proyector, exportado a ONNX; modelo de decisión no generativo |
| Parámetros totales | ~600M (según el nombre del modelo base d1-omni-600M; no confirmado) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible para el contexto nativo; límite operativo de 2.048 tokens para filas solo de texto en WebGPU |
| Tipos de cuantización | FP16 en pesos (tensores de >=4.096 elementos); FP32 en activaciones, atención, softmax y acumulación; paquete FP32 base disponible |
| Idiomas soportados | No disponibles |
| Licencia | LFM Open License v1.0 (`license_name: lfm1.0`; `license: other`) |
| Formato de pesos | ONNX (tres grafos) con datos externos; no safetensors ni GGUF |

## Arquitectura y entrenamiento

El paquete contiene tres grafos ONNX de un encoder multimodal con capas de atención completa densas, módulo de visión y proyector. El modelo no genera texto: puntúa opciones con nombre para preguntas de tipo `choice`, `noul` y `score` ordinal a partir de estado texto/JSON y capturas opcionales. Las salidas de visión y proyector pueden permanecer en la GPU entre grafos mediante `preferredOutputLocation: 'gpu-buffer'`. Esta release no entrena, no fusiona, no selecciona ni reexporta desde PyTorch: son los grafos FP32 publicados con los pesos redondeados una vez.

En la conversión, todo tensor de pesos con al menos 4.096 elementos se guarda en FP16 y se convierte a FP32 donde se usa; la tabla de embeddings de tokens se recoge en FP16 y solo las filas recogidas se convierten. Activaciones, atención, softmax y acumulación permanecen en FP32. ONNX Runtime pliega en constantes las demás conversiones al crear las sesiones, por lo que la memoria GPU de esos pesos queda cerca del paquete FP32. No se detallan datos de entrenamiento, número de tokens, composición del dataset ni RLHF/DPO; la model card remite a la del FP32 para el historial y las limitaciones de datos.

## Capacidades

- Puntuación de opciones con nombre para preguntas de tipo `choice`, `noul` y `score` ordinal.
- Entrada de estado texto/JSON y capturas de pantalla opcionales.
- No genera texto ni tokens; la salida es una puntuación o una elección entre opciones.
- Puede resolver varias preguntas en una misma solicitud, por ejemplo una captura y dos preguntas.
- Ejecución en navegador mediante ONNX Runtime con WebGPU o CPU/WASM.
- Capacidad de visión limitada a usar capturas como entrada; no se documenta OCR ni descripción de imágenes.
- No se documenta tool calling, function calling, agentes, razonamiento multi-paso, modo thinking, audio ni soporte multilingüe.

## Casos de uso

- Detección de finalización de tareas web: la extensión envía una captura y el estado JSON de la página, y el modelo puntúa la opción `completion found`; con 0,75 s de mediana en RTX 5090 permite comprobaciones interactivas sin salir del navegador.
- Selección de opciones en formularios y asistentes de navegación: dado un conjunto de opciones con nombre, el modelo las puntúa para preguntas de tipo `choice` y permite elegir la más probable en el dispositivo.
- Puntuación ordinal de progreso: para checklists o flujos multi-paso, usa preguntas `score` ordinal sobre el estado de la página y la captura para estimar el grado de avance.
- Automatización de pruebas de UI: en pipelines de QA, compara el estado esperado con la pantalla actual y puntúa opciones de resultado; la ejecución local evita enviar capturas a un servidor.
- Soporte técnico asistido: clasifica una captura y el JSON de estado en categorías predefinidas para enrutar incidencias, con la ventaja de que el contenido no sale del navegador.
- Asistencia de accesibilidad: puntúa opciones de descripción o de siguiente acción a partir de una captura y el estado de la página, para sugerir alternativas en la interfaz.
- Decisiones con datos sensibles en el navegador: al ser un proveedor on-device, permite evaluar estados de sesión, formularios o pantallas con datos personales sin transmitirlos a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los datos disponibles son pruebas internas de paridad y calidad sobre balanced-V3 held-out test (72 capturas, 144 preguntas).

| Comparación | Acuerdo de decisión | Diferencia máxima de probabilidad | Diferencia máxima de puntuación esperada |
|---|---:|---:|---:|
| CPU (onnxruntime-node 1.24.1), FP32 vs FP16 | 144/144 | 0,0102 (mediana 5,6e-7; percentil 95 0,0020) | 0,0178 |
| Chrome WebGPU, RTX 5090, FP32 vs FP16 | 144/144 | 0,0101 | 0,0176 |

| Paquete | Entorno | Categorical | Completion found | False completions | Score MAE |
|---|---|---:|---:|---:|---:|
| FP32 | CPU | 92/126 | 22/24 | 1/48 | 0,5742 |
| FP16 | CPU | 92/126 | 22/24 | 1/48 | 0,5728 |
| FP32 | Chrome WebGPU, RTX 5090 | 92/126 | 22/24 | 1/48 | 0,5742 |
| FP16 | Chrome WebGPU, RTX 5090 | 92/126 | 22/24 | 1/48 | 0,5728 |

Ninguna probabilidad de finalización cruza el umbral de aceptación de WebBrain de 0,9 entre ambos paquetes.

## Requisitos de hardware

- VRAM estimada: no disponible. Como referencia, el paquete ocupa 950.872.204 bytes; el mayor búfer es de 128 MiB; ONNX Runtime pliega conversiones y la memoria GPU de pesos queda cerca del paquete FP32 de 1.900.356.386 bytes.
- Tensor de atención: cada capa de atención completa materializa un tensor FP32 de 16 × longitud × longitud por fila; con 2.048 tokens son 256 MiB. WebBrain limita el lote por ese tensor (256 MiB) y por el límite de storage binding del adaptador.
- GPU recomendadas: RTX 5090 probada con Chrome WebGPU; no se documentan otras GPU.
- CPU: probado con onnxruntime-node 1.24.1; los operadores de control y forma se ejecutan en CPU/WASM.
- ¿Cabe en consumer GPU? Sí en la RTX 5090 probada; no hay datos para GPU de menor VRAM.
- Despliegue: ONNX Runtime con WebGPU o CPU/WASM y la extensión WebBrain; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia: en RTX 5090, descarga y carga del paquete en 85 s; una solicitud con una captura y dos preguntas tarda 0,75 s de mediana y 0,88 s en el percentil 95. Throughput no disponible.

## Comparativa con modelos similares

No se conocen alternativas públicas equivalentes de decisión image-text-to-decision para navegador en la información disponible. La comparación directa es con el paquete FP32 y con el modelo upstream.

| Modelo | Parámetros | Contexto | Formato y tamaño | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| d1-browser-decision-fp16 | ~600M (no confirmado) | 2.048 tokens de texto en WebGPU; nativo no disponible | ONNX FP16; 950.872.204 bytes | LFM 1.0 | HuggingFace |
| d1-browser-decision-fp32 | ~600M (no confirmado) | Igual que FP16 | ONNX FP32; 1.900.356.386 bytes | LFM 1.0 | HuggingFace |
| LiquidAI/d1-omni-600M | 600M por nombre | No disponible | No disponible | No disponible | HuggingFace |

Frente al FP32, el FP16 mantiene 144/144 de acuerdo de decisión y la misma calidad interna; reduce descarga y caché a la mitad, pero no reduce sustancialmente la memoria GPU de pesos. Frente a LiquidAI/d1-omni-600M no hay datos de rendimiento, contexto, licencia ni formato en la información disponible.

## Limitaciones y advertencias

- Modelo experimental: las pruebas de calidad usan capturas sintéticas etiquetadas por IA, no un benchmark independiente de sitios reales.
- En la suite antigua, todas las etapas fallaron los siete ejemplos positivos de finalización; no debe tomarse como listo para producción sin validación propia.
- Riesgo de falsos positivos: 1/48 falsas finalizaciones y Score MAE de 0,5728 en la prueba interna.
- No genera texto ni tokens; no sirve como chatbot, modelo de código o generador de explicaciones.
- No hay datos de idiomas soportados ni de sesgos; la validación multilingüe no está documentada.
- En WebGPU, las filas solo de texto se limitan a 2.048 tokens y el estado se trunca; el contexto nativo no se especifica.
- La atención completa es densa y cuadrática en memoria; el lote se limita por un tensor de 256 MiB.
- FP16 reduce descarga y caché, no la memoria GPU de pesos constante-plegados, que queda cerca del FP32.
- La licencia LFM Open License v1.0 no es Apache/MIT; incluye umbrales de ingresos anuales para uso comercial y requiere revisión legal.
- No es una aprobación legal ni un aval de Liquid AI.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/webbrain-one/d1-browser-decision-fp16)
- [Modelo base FP32](https://huggingface.co/webbrain-one/d1-browser-decision-fp32)
- [LiquidAI/d1-omni-600M (revisión citada)](https://huggingface.co/LiquidAI/d1-omni-600M/tree/02b55d7076f15129e59ab3f94783f32c4b088674)
- [Repositorio WebBrain](https://github.com/webbrain-one/webbrain)
- [LICENSE del modelo](https://huggingface.co/webbrain-one/d1-browser-decision-fp16/blob/main/LICENSE)
- [NOTICE del modelo](https://huggingface.co/webbrain-one/d1-browser-decision-fp16/blob/main/NOTICE)
- [Script de conversión a FP16](https://huggingface.co/webbrain-one/d1-browser-decision-fp16/blob/main/provenance/convert_fp16.py)
- [Runtime d1-runtime.js](https://huggingface.co/webbrain-one/d1-browser-decision-fp16/blob/main/runtime/d1-runtime.js)
- [Licencia del runtime de WebBrain](https://huggingface.co/webbrain-one/d1-browser-decision-fp16/blob/main/licenses/webbrain/LICENSE)
