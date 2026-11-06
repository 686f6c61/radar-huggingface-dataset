# subtitleking/ivrit-whisper-large-v3-onnx

## Resumen

ivrit-whisper-large-v3-onnx es una conversión a ONNX del checkpoint ivrit-ai/whisper-large-v3, un Whisper large-v3 ajustado por ivrit.ai para reconocimiento automático de habla en hebreo. El modelo original parte de la arquitectura Whisper large-v3 de OpenAI (transformer encoder-decoder, aproximadamente 1550 millones de parámetros) y fue afinado por ivrit.ai sobre datos en hebreo para mejorar la precisión en ese idioma. Esta versión, publicada por el usuario subtitleking, no modifica los pesos más allá de su cuantización y cambio de formato: su propósito es hacer viable la inferencia en el navegador.

La relevancia de esta ficha radica en el formato de despliegue. El repositorio incluye un encoder en fp16 y un decoder fusionado (merged, con past key values) cuantizado a 4 bits, lo que reduce el tamaño total del repo a 2,1 GB y permite ejecutar el modelo con Transformers.js sobre WebGPU en un cliente web. Es una pieza pensada para herramientas de subtitulado en tiempo real (el autor la usa en SubtitleKing), no un modelo nuevo.

El modelo es monolingüe en hebreo por diseño del ajuste fino, se distribuye bajo licencia Apache-2.0 y está disponible únicamente en formato ONNX para el ecosistema transformers.js. No se han publicado resultados de benchmarks propios en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3), exportado a ONNX |
| Parámetros totales | Aproximadamente 1550 millones (heredados de Whisper large-v3) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventana de audio de 30 segundos por segmento (estándar de Whisper) |
| Tipos de cuantización | Encoder fp16 con I/O fp32; decoder fusionado 4-bit (MatMul, bloque 32, simétrico) |
| Idiomas soportados | Hebreo (he) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`onnx/encoder_model_fp16.onnx`, `onnx/decoder_model_merged_q4.onnx`) |
| Tamaño del repositorio | 2,1 GB |
| Librería de inferencia | transformers.js (WebGPU) |
| Modelo base | ivrit-ai/whisper-large-v3 |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper large-v3: un transformer encoder-decoder con atención estándar, entrenado originalmente por OpenAI para transcripción y traducción de voz multilingüe sobre 30 segundos de audio por ventana. El ajuste fino en hebreo lo realizó ivrit.ai sobre el checkpoint large-v3; esta conversión no aporta entrenamiento adicional, solo exportación con Optimum ONNX en modo automatic-speech-recognition-with-past (decoder con past key values para decodificación autoregresiva incremental).

La innovación técnica de este repositorio es exclusivamente de despliegue: encoder en fp16 con entradas y salidas en fp32, y decoder cuantizado a 4 bits con cuantización simétrica por bloques de 32 en las MatMul. El proceso es reproducible mediante el directorio `tools/convert-whisper/` del repositorio de SubtitleKing. No hay información disponible sobre el volumen de datos de entrenamiento del ajuste fino original ni sobre el uso de RLHF o DPO.

## Capacidades

- Transcripción de voz a texto en hebreo con calidad alta (el autor la describe como la mejor opción disponible para hebreo).
- Reconocimiento de habla continua por segmentos de 30 segundos, con decodificación autoregresiva mediante past key values.
- Inferencia en navegador mediante Transformers.js con backend WebGPU, sin servidor.
- Ejecución local en el cliente, lo que evita enviar audio a infraestructura externa.
- No soporta tool calling ni function calling.
- No está diseñado para razonamiento multi-paso ni flujos de agente.
- No soporta visión ni audio más allá de la transcripción de voz.
- Capacidad multilingüe limitada: el ajuste fino está orientado a hebreo.

## Casos de uso

- Subtitulado en tiempo real en aplicaciones web: el modelo se carga con Transformers.js en el navegador y transcribe segmentos de audio de hasta 30 segundos, lo que permite generar subtítulos sin backend y con latencia controlada por el cliente.
- Herramientas de accesibilidad para contenido en hebreo: transcripción de vídeos, pódcasts o reuniones directamente en la página, sin depender de APIs de terceros.
- Edición de vídeo en el navegador: integración en editores web que necesitan pistas de subtítulos automáticas en hebreo y pueden ejecutar el decoder 4-bit en WebGPU.
- Prototipado rápido de aplicaciones de voz: al ser un único repositorio ONNX con tokenizer y configs incluidos, se puede desplegar en demos estáticas sin infraestructura de GPU.
- Procesamiento por lotes de archivos de audio en hebreo en entornos con GPU modestas: el tamaño de 2,1 GB y la cuantización 4-bit del decoder reducen los requisitos de memoria frente al checkpoint original.
- Investigación sobre reconocimiento de habla en hebreo: sirve como referencia de calidad del ajuste fino de ivrit.ai en un formato portable, útil para comparar pipelines ONNX frente a PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 2,1 GB, por lo que un presupuesto de memoria en torno a 2-4 GB es razonable para el modelo cargado, sin contar buffers de activación.
- GPU recomendadas: no disponibles en la información proporcionada. El backend objetivo es WebGPU, por lo que se requiere un navegador con soporte WebGPU y una GPU compatible.
- GPU de consumo: la cuantización 4-bit del decoder y el encoder fp16 están pensados precisamente para hardware de consumo; no se especifican modelos concretos.
- Opciones de despliegue: Transformers.js con WebGPU; el formato ONNX también puede ejecutarse con ONNX Runtime, aunque no se documenta en la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto de audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| subtitleking/ivrit-whisper-large-v3-onnx | ~1550 M | 30 s por segmento | Hebreo | Apache-2.0 | ONNX (fp16 + 4-bit) |
| ivrit-ai/whisper-large-v3 | ~1550 M | 30 s por segmento | Hebreo | Apache-2.0 | PyTorch (safetensors) |
| openai/whisper-large-v3 | ~1550 M | 30 s por segmento | Multilingüe | Apache-2.0 | PyTorch, ONNX |

La diferencia principal frente al checkpoint de ivrit.ai es el formato y la cuantización, no la calidad del modelo. Frente a whisper-large-v3 original, este modelo está especializado en hebreo y no cubre el resto de idiomas.

## Limitaciones y advertencias

- Modelo monolingüe en la práctica: el ajuste fino está orientado a hebreo y no se garantiza calidad en otros idiomas.
- Riesgo de alucinación: como todo modelo Whisper, puede generar texto plausible en segmentos con silencio, ruido o audio ininteligible.
- Sesgos: no hay información disponible sobre la composición del dataset de ajuste fino ni sobre sesgos demográficos o dialectales.
- Ventana de audio fija de 30 segundos por segmento, con la necesidad de segmentar audios largos.
- Dependencia de WebGPU: el despliegue en navegador requiere un navegador y una GPU compatibles; no hay soporte documentado para otros backends en esta versión.
- Licencia Apache-2.0, que permite uso comercial, pero el autor recomienda citar el trabajo de ivrit.ai.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni validación comunitaria.
- Este repositorio solo cambia el formato de archivo; cualquier mérito o defecto del modelo corresponde a ivrit.ai.

## Enlaces

- Hugging Face: https://huggingface.co/subtitleking/ivrit-whisper-large-v3-onnx
- Modelo base: https://huggingface.co/ivrit-ai/whisper-large-v3
- ivrit.ai: https://www.ivrit.ai
- Transformers.js: https://github.com/huggingface/transformers.js
- Repositorio de SubtitleKing (script de conversión en `tools/convert-whisper/`): no disponible como enlace directo en la información proporcionada.
