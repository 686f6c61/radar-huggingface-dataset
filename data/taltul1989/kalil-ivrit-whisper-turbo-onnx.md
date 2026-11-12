# taltul1989/kalil-ivrit-whisper-turbo-onnx

## Resumen

Kalil Hebrew Whisper Turbo (ONNX) es una distribución de pesos del modelo de reconocimiento automático del habla `ivrit-ai/whisper-large-v3-turbo`, convertidos a formato ONNX y empaquetados para su ejecución en el navegador mediante la librería `transformers.js`. El autor, `taltul1989`, publica esta copia como artefacto de soporte de su aplicación web "קליל כתוביות" (Kalil subtitles), una herramienta de subtitulado automático en hebreo que corre íntegramente en el cliente. No introduce modificaciones en los pesos: se trata de una redistribución de conversiones ya existentes.

El modelo resuelve un problema muy concreto: disponer de transcripción de audio en hebreo con marcas de tiempo a nivel de palabra sin enviar el audio a un servidor. Al estar basado en la arquitectura Whisper large-v3-turbo (transformer encoder-decoder), hereda la capacidad multilingüe del original, aunque esta variante está afinada y orientada específicamente al hebreo. El repositorio ocupa 2,0 GB e incluye variantes cuantizadas en fp16 y q4 para equilibrar calidad y tamaño en el navegador.

Su relevancia actual es de nicho pero clara: demuestra un patrón de despliegue de ASR de gama alta en el edge (WebGPU/WASM vía ONNX Runtime Web), útil para desarrolladores que necesitan privacidad por diseño, funcionamiento offline o integración en aplicaciones web sin infraestructura de inferencia propia. La licencia Apache-2.0 facilita su reutilización comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo) |
| Parametros totales | no disponible (el modelo base Whisper large-v3-turbo se sitúa en torno a 809 M, dato no confirmado en la información proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s por segmento, propia de Whisper; no confirmado en la ficha) |
| Tipos de cuantizacion | fp16 (encoder) y q4 (encoder y decoder merged) |
| Idiomas soportados | hebreo (he) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`encoder_model_fp16`, `encoder_model_q4`, `decoder_model_merged_q4`) más tokenizer y ficheros de configuración |

## Arquitectura y entrenamiento

La arquitectura subyacente es Whisper large-v3-turbo, un transformer encoder-decoder con atención estándar diseñado para transcripción y traducción de audio. La variante "turbo" reduce el número de capas del decoder respecto a large-v3, lo que disminuye la latencia de decodificación a costa de una pérdida mínima de precisión. El modelo original de ivrit.ai fue afinado sobre el checkpoint de OpenAI para especializarlo en hebreo; esta distribución no altera los pesos, solo los convierte a ONNX e incluye la variante con marcas de tiempo a nivel de palabra generada por `instush`.

No se dispone en la información proporcionada de detalles sobre el volumen de datos de entrenamiento, la composición del corpus en hebreo ni si se aplicaron etapas de RLHF o DPO (en ASR no son habituales). La innovación técnica relevante aquí no está en el entrenamiento sino en el empaquetado: conversión a ONNX con decoder fusionado (`decoder_model_merged`) y cuantización q4, pensada para ejecución en navegador con `transformers.js` y ONNX Runtime Web.

## Capacidades

- Reconocimiento automático del habla en hebreo con salida de texto.
- Marcas de tiempo a nivel de palabra (word-level timestamps), gracias a la conversión de `instush`.
- Ejecución en el navegador del cliente mediante `transformers.js` y ONNX Runtime Web (WASM/WebGPU).
- Funcionamiento offline una vez cargados los pesos, sin envío de audio a servidores.
- Dos perfiles de cuantización para adaptar el consumo de memoria y la velocidad.
- No se documenta soporte de tool calling, agentes, visión ni audio más allá de la transcripción.

## Casos de uso

- Subtitulado automático en hebreo en el navegador: la aplicación de referencia (קליל כתוביות) usa estos pesos para generar subtítulos sincronizados a nivel de palabra directamente en el cliente, sin backend.
- Herramientas de accesibilidad web: integración en reproductores o plataformas de vídeo para generar subtítulos en hebreo bajo demanda, manteniendo el audio en el dispositivo del usuario.
- Transcripción con privacidad por diseño: entornos con requisitos de confidencialidad (periodismo, legal, sanidad) donde el audio no puede salir del equipo del usuario y se acepta un rendimiento menor a cambio de no depender de la nube.
- Aplicaciones offline o de campo: uso en escenarios con conectividad limitada, cargando los pesos una vez y operando sin red.
- Prototipado rápido de funcionalidades ASR en hebreo: al estar en ONNX y `transformers.js`, se puede integrar en una aplicación web sin montar infraestructura de inferencia.
- Investigación en despliegue edge de ASR: sirve como referencia para medir calidad y latencia de un modelo Whisper turbo cuantizado en navegador frente a alternativas en servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio completo ocupa 2,0 GB; la variante q4 reduce sustancialmente la memoria necesaria en tiempo de ejecución, aunque no se especifican cifras exactas en la información proporcionada.
- GPU recomendadas: no disponible. Al ejecutarse en navegador, el rendimiento depende de la disponibilidad de WebGPU en el cliente.
- Compatibilidad con GPU de consumo: no confirmada; el diseño apunta a ejecución en cliente (WASM/WebGPU) más que a GPU dedicada de servidor.
- Opciones de despliegue: `transformers.js` con ONNX Runtime Web (WASM y WebGPU). No se documentan despliegues con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este formato).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/audio | Idiomas | Licencia | Formato/despliegue |
|---|---|---|---|---|---|
| Kalil Hebrew Whisper Turbo ONNX (este) | no disponible (base large-v3-turbo) | segmentos de audio (Whisper) | he | Apache-2.0 | ONNX, navegador |
| ivrit-ai/whisper-large-v3-turbo (base) | no disponible | segmentos de audio (Whisper) | he | Apache-2.0 | safetensors, servidor |
| instush/ivrit-whisper-large-v3-turbo-timestamped-onnx | no disponible | segmentos de audio (Whisper) | he | Apache-2.0 | ONNX con timestamps |
| Whisper large-v3-turbo (OpenAI) | no disponible | segmentos de audio (Whisper) | multilingüe | MIT (según el original; no confirmado aquí) | múltiples |

Los datos de rendimiento comparativo no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Especializado en hebreo: no debe esperarse calidad multilingüe aunque el modelo base la tuviera; esta variante está orientada a `he`.
- Riesgo de alucinación y errores en audio con ruido, acentos marcados o solapamiento de hablantes, inherente a los modelos Whisper.
- La cuantización q4 puede degradar la precisión de transcripción frente a fp16; conviene validar en el dominio de uso.
- El rendimiento en navegador depende de WebGPU/WASM del cliente; no hay cifras de latencia publicadas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: poca validación comunitaria.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de la conversión intermedia citadas.
- No se documentan sesgos específicos más allá de los conocidos en ASR; no disponible información adicional.

## Enlaces

- Hugging Face: https://huggingface.co/taltul1989/kalil-ivrit-whisper-turbo-onnx
- Modelo base: https://huggingface.co/ivrit-ai/whisper-large-v3-turbo
- Conversión ONNX con timestamps: https://huggingface.co/instush/ivrit-whisper-large-v3-turbo-timestamped-onnx
- Aplicación de referencia: https://taltul1989.github.io/kalil-subs/
