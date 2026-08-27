# striimit/parakeet-tdt-0.6b-v3-webgpu

## Resumen

Parakeet-TDT-0.6b-v3 es un modelo de reconocimiento automático del habla (ASR) desarrollado por NVIDIA, con 600 millones de parámetros, diseñado para transcripción de alta precisión en entornos ruidosos y con soporte para 25 lenguas europeas. Esta ficha describe la exportación ONNX preparada por striimit para ejecución en navegador mediante WebGPU, basada en la conversión previa de istupakov. El paquete incluye un encoder en precisión fp16 (1,24 GB), un decoder conjunto en fp32 (69 MB) y un grafo ONNX para extracción de características log-mel de 128 bins, lo que permite inferencia completamente local en el cliente sin necesidad de servidor.

La relevancia de esta versión radica en que habilita la transcripción de voz en tiempo real dentro del navegador, con privacidad total de los datos de audio y sin costes de infraestructura. El modelo original emplea una arquitectura transformer-decoder con decodificación TDT (Token-and-Duration Transducer), que combina la predicción de tokens con la duración de cada segmento, logrando un equilibrio entre latencia y precisión. La exportación ONNX mantiene la funcionalidad completa, aunque el encoder solo cubre aproximadamente 35 segundos de audio por pasada, por lo que audios más largos deben dividirse en fragmentos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con encoder FastConformer y decodificador TDT (Token-and-Duration Transducer) |
| Parametros totales | 600 millones (0,6B) |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | ~35 segundos de audio por pasada del encoder |
| Tipos de cuantizacion | fp16 (encoder), fp32 (decoder y joint) |
| Idiomas soportados | en, fi, sv, et, de, fr, es (declarados en esta exportacion; el modelo original soporta 25 lenguas europeas) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (archivos .onnx) |

## Arquitectura y entrenamiento

El modelo original de NVIDIA, parakeet-tdt-0.6b-v3, emplea un encoder basado en FastConformer (una variante eficiente del conformer) junto con un decodificador TDT que predice simultáneamente el token de salida y su duración. Esta arquitectura permite una decodificación greedy rápida y robusta, especialmente en condiciones de ruido. El modelo fue entrenado con datos de habla multilingüe de 25 lenguas europeas, con detección automática del idioma de entrada. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de técnicas como RLHF o DPO, ya que no aparece en la documentación proporcionada.

La exportación ONNX para WebGPU modifica el encoder original a precisión fp16 para reducir el peso de descarga (1,24 GB frente a 2,3 GB en fp32) y evitar los resultados incorrectos que produce la versión int8 en el runtime de WebGPU. El decoder y la red joint se mantienen en fp32 (69 MB). Además, se incluye un grafo ONNX basado en convoluciones para la extracción de características log-mel de 128 bins, que evita el operador STFT ausente en algunos runtimes. La decodificación greedy TDT se implementa en el código de llamada: cada paso del decoder produce 8198 logits (8193 de vocabulario más 5 de duración), y las entradas recurrentes son estados LSTM de forma [2, 1, 640].

## Capacidades

- Transcripción de voz a texto en tiempo real o por lotes, con alta precisión en entornos ruidosos.
- Detección automática del idioma de entrada (en el modelo original; la exportación declara 7 idiomas).
- Ejecución completamente en el navegador mediante WebGPU, sin enviar audio a ningún servidor.
- Decodificación greedy TDT integrada en el código de llamada, sin necesidad de beam search.
- Extracción de características de audio integrada en el grafo ONNX (log-mel de 128 bins).
- Soporte para audios de hasta ~35 segundos por pasada del encoder; audios más largos requieren segmentación.
- Compatible con onnxruntime-web y navegadores con soporte WebGPU (Chrome, Edge, Firefox nightly).

## Casos de uso

- Transcripción de reuniones y notas de voz en aplicaciones web: el modelo se ejecuta localmente en el navegador, lo que garantiza que las grabaciones confidenciales no salgan del dispositivo. Su ventana de 35 segundos permite procesar fragmentos de audio de forma incremental, mostrando la transcripción en tiempo real.
- Subtitulado automático de vídeos en plataformas de streaming o editores web: al integrar el modelo en el frontend, se pueden generar subtítulos sin coste de servidor. La precisión en entornos ruidosos lo hace adecuado para vídeos con música de fondo o múltiples hablantes.
- Asistentes de voz en aplicaciones de productividad: combinado con un motor de intenciones, permite dictar correos, buscar documentos o crear tareas mediante comandos de voz, todo dentro del navegador y con baja latencia gracias a la decodificación TDT.
- Accesibilidad para personas con discapacidad motora o visual: el dictado por voz en aplicaciones web se beneficia de la ejecución local, reduciendo la dependencia de servicios externos y mejorando la privacidad. El modelo soporta varios idiomas europeos, lo que amplía su utilidad en entornos multilingües.
- Análisis de llamadas de atención al cliente en tiempo real: en un softphone web, el modelo transcribe las conversaciones mientras se producen, permitiendo a los supervisores detectar problemas o extraer métricas sin enviar audio a la nube. La robustez ante ruido ambiental es clave en entornos de oficina.
- Herramientas educativas de idiomas: transcripción de pronunciación para ejercicios de repetición, comparando la salida del modelo con el texto esperado. Al ejecutarse en el navegador, funciona sin conexión y puede usarse en aulas con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo original de NVIDIA reporta métricas de WER (Word Error Rate) en varios idiomas europeos, pero estos datos no se incluyen en la documentación de esta exportación ONNX. Se recomienda consultar la model card de nvidia/parakeet-tdt-0.6b-v3 para obtener cifras oficiales.

## Requisitos de hardware

- La inferencia se ejecuta en el navegador mediante WebGPU, por lo que no requiere GPU de servidor ni VRAM dedicada en el sentido tradicional; utiliza la GPU del dispositivo del usuario.
- Tamaño total de descarga: aproximadamente 1,3 GB (encoder fp16 de 1,24 GB + decoder fp32 de 69 MB + grafo de features).
- Se recomienda una GPU integrada o dedicada con soporte WebGPU; en GPUs de gama baja (4-6 GB de VRAM) el modelo debería ejecutarse sin problemas, ya que el encoder fp16 ocupa menos de 1,3 GB en memoria.
- Navegadores compatibles: Chrome 113+, Edge 113+, Firefox nightly (con WebGPU habilitado). Safari aún no soporta WebGPU de forma estable.
- Opciones de despliegue: integración directa con onnxruntime-web en una página web; no requiere backend ni servidor de inferencia.
- Latencia estimada: no disponible en la documentación, pero al ser un modelo de 0,6B en fp16, se espera una transcripción casi en tiempo real en hardware de consumo medio.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| parakeet-tdt-0.6b-v3 (ONNX WebGPU) | 600M | 7 declarados (25 en original) | ~35 s | CC-BY-4.0 | ONNX |
| openai/whisper-small | 244M | 99 | 30 s | MIT | safetensors, GGUF, ONNX |
| openai/whisper-base | 74M | 99 | 30 s | MIT | safetensors, GGUF, ONNX |
| nvidia/parakeet-tdt-0.6b-v2 | 600M | inglés | ~35 s | CC-BY-4.0 | NeMo, ONNX |

La comparativa es cualitativa, ya que no se dispone de benchmarks comunes en la información proporcionada. Parakeet-TDT-0.6b-v3 ofrece más parámetros que Whisper-small, lo que sugiere mayor capacidad de modelado, pero está especializado en lenguas europeas y su licencia CC-BY-4.0 exige atribución. Whisper, por su parte, cubre 99 idiomas y tiene una licencia más permisiva (MIT). La versión WebGPU de Parakeet destaca por su ejecución en navegador sin servidor, algo que Whisper no ofrece de forma nativa.

## Limitaciones y advertencias

- El encoder solo cubre aproximadamente 35 segundos de audio por pasada; audios más largos deben dividirse en fragmentos, lo que puede introducir cortes en palabras o frases si no se gestiona correctamente el solapamiento.
- La exportación declara 7 idiomas (en, fi, sv, et, de, fr, es), aunque el modelo original soporta 25 lenguas europeas. Es posible que el modelo funcione con otros idiomas, pero no está garantizado ni documentado en esta versión.
- La precisión fp16 del encoder puede provocar ligeras pérdidas de calidad en comparación con fp32, aunque la documentación indica que es la única opción viable para WebGPU (int8 produce resultados incorrectos y fp32 es demasiado pesado).
- Requiere un navegador con soporte WebGPU; en navegadores sin esta tecnología, el modelo no puede ejecutarse.
- Licencia CC-BY-4.0: exige atribución a NVIDIA (modelo original) y a istupakov (exportación ONNX) en cualquier uso o redistribución.
- No se han publicado resultados de benchmarks para esta exportación específica, por lo que el rendimiento real en términos de WER debe validarse con datos propios antes de usarlo en producción.
- El modelo puede presentar sesgos en acentos o dialectos no representados en los datos de entrenamiento, especialmente en lenguas con alta variación regional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/striimit/parakeet-tdt-0.6b-v3-webgpu
- Modelo original de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Exportación ONNX base de istupakov: https://huggingface.co/istupakov/parakeet-tdt-0.6b-v3-onnx
- Proyecto onnx-asr (grafo de features): https://github.com/istupakov/onnx-asr
- Documentación de onnxruntime-web: https://onnxruntime.ai/docs/tutorials/web/
- Artículo sobre despliegue WebGPU: https://progeotek.com/parakeet-tdt-0-6b-v3-via-webgpu-browser/
- Guía de despliegue en navegador: https://www.guagege.com/2026/07/15/how-to-deploy-parakeet-tdt-0-6b-v3-via-webgpu-browser/
- Ejemplo de implementación en GitHub: https://github.com/Memphis1983/parakeet_web
