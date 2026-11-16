# subtitleking/oddadmix-whisper-large-v3-ar-dialectal-onnx

## Resumen

`subtitleking/oddadmix-whisper-large-v3-ar-dialectal-onnx` es una conversión a ONNX del checkpoint `oddadmix/whisper-large-v3-arabic-dialectal-v2`, un ajuste fino de Whisper large-v3 orientado al reconocimiento automático de habla en árabe dialectal. El modelo original lo desarrolla el usuario de Hugging Face `oddadmix` y se entrena sobre el corpus lahgtna, que reúne aproximadamente 255 horas de audio en distintos dialectos árabes. La conversión la firma `subtitleking` y su único propósito es permitir la inferencia en navegador mediante Transformers.js sobre WebGPU, que es el escenario de uso de la aplicación SubtitleKing.

La relevancia de esta ficha es doble. Por un lado, documenta un caso de especialización lingüística poco frecuente: el árabe dialectal está infrarrepresentado en los modelos ASR generalistas, que suelen rendir bien en árabe estándar moderno (MSA) pero degradan con variedades coloquiales. Por otro, ilustra un patrón de despliegue emergente: exportar un modelo grande a ONNX con encoder en fp16 y decoder cuantizado a 4 bits para ejecutarlo en el cliente, sin servidor, aprovechando la GPU del navegador.

El repositorio ocupa 2,1 GB y no registra descargas ni interacciones en el momento de la consulta. La licencia es Apache-2.0, heredada del checkpoint original, y el único idioma declarado es `ar`. No se han publicado resultados de benchmarks ni detalles del proceso de entrenamiento más allá de la mención al corpus lahgtna.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3), exportado a ONNX |
| Parametros totales | no disponible (Whisper large-v3 tiene ~1.550 M; el autor no lo indica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper large-v3 usa ventanas de 30 s de audio) |
| Tipos de cuantizacion | Encoder fp16 con I/O fp32; decoder 4-bit MatMul (bloque 32, simetrico) con past key values |
| Idiomas soportados | Arabe (`ar`), con enfasis en dialectos |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`encoder_model_fp16.onnx`, `decoder_model_merged_q4.onnx`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es Whisper large-v3, un transformer encoder-decoder con atención completa que procesa espectrogramas log-Mel de 30 segundos y genera transcripciones autoregresivas con tokens de control de idioma y tarea. El checkpoint original fue ajustado por `oddadmix` sobre el corpus lahgtna, descrito como unas 255 horas de audio en dialectos árabes. No se detalla en la información disponible la composición exacta del dataset, el número de pasos de entrenamiento, la presencia de RLHF/DPO ni las técnicas de aumento de datos empleadas.

La contribución de este repositorio es exclusivamente de formato. La conversión se realizó con la exportación ONNX de Optimum en modo `automatic-speech-recognition-with-past`, generando un encoder en fp16 con entradas y salidas fp32 y un decoder fusionado (`decoder_model_merged`) cuantizado a 4 bits con MatMul de bloque 32 simétrico, conservando las past key values para decodificación incremental. El proceso es reproducible mediante `tools/convert-whisper/` del repositorio de SubtitleKing. No hay innovaciones arquitectónicas propias: el valor está en la reducción de tamaño y en la compatibilidad con WebGPU.

## Capacidades

- Reconocimiento automático de habla (ASR) en árabe, con especialización en variedades dialectales frente al árabe estándar moderno.
- Transcripción de audio en ventanas de hasta 30 segundos, con decodificación autoregresiva y past key values.
- Detección y fijación del idioma de entrada mediante tokens de control de Whisper (`ar`).
- Ejecución en navegador con Transformers.js sobre WebGPU, sin backend propio.
- No soporta tool calling ni function calling: es un modelo ASR puro, no un LLM conversacional.
- No dispone de modo de razonamiento explícito, visión, audio generativo ni capacidades de agente multi-paso.
- Capacidad multilingüe limitada al árabe según la model card; no se declaran otras lenguas.

## Casos de uso

- Subtitulado en tiempo real en el navegador: la aplicación SubtitleKing puede cargar el encoder fp16 y el decoder 4-bit directamente en el cliente y transcribir audio de usuario sin enviar datos a un servidor, lo que reduce latencia y mejora la privacidad.
- Transcripción de entrevistas y podcasts en dialectos árabes: el ajuste sobre lahgtna cubre variedades coloquiales que Whisper large-v3 base suele confundir con MSA, lo que mejora la fidelidad en contenido informal.
- Herramientas de accesibilidad web: integración en reproductores o plataformas de vídeo que necesiten generar subtítulos automáticos para audiencias arabófonas sin infraestructura de GPU en servidor.
- Archivado y búsqueda de material audiovisual: transcripción por lotes en el navegador de grabaciones cortas (hasta 30 s por ventana) para indexar contenido y habilitar búsqueda textual.
- Aplicaciones educativas de aprendizaje de árabe dialectal: generación de transcripciones de referencia para ejercicios de escucha y comparación de pronunciación.
- Prototipado rápido sin backend: investigadores que quieran evaluar el modelo original de `oddadmix` sin montar un servidor de inferencia pueden usar esta exportación ONNX como banco de pruebas en WebGPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 2,1 GB; en ejecución, el encoder fp16 y el decoder 4-bit requieren del orden de 2-3 GB de memoria de GPU, aunque la cifra exacta no está publicada.
- GPU recomendadas: cualquier GPU con soporte WebGPU en navegador (Chrome/Edge recientes). Para uso en servidor, A100 o H100 con ONNX Runtime, aunque no es el objetivo del repositorio.
- GPU de consumo: cabe en tarjetas con 4 GB o más de VRAM; en el navegador depende de la implementación WebGPU del sistema.
- Opciones de despliegue: Transformers.js con WebGPU (escenario previsto), ONNX Runtime (CPU/GPU) y, con conversión adicional, llama.cpp u Ollama no aplican porque es un modelo ASR, no un LLM.
- Latencia y throughput: no disponibles; dependen del hardware y del navegador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| subtitleking/oddadmix-whisper-large-v3-ar-dialectal-onnx | ~1.550 M (no confirmado por el autor) | Ventanas de 30 s | `ar` (dialectal) | Apache-2.0 | ONNX (fp16 + 4-bit) |
| openai/whisper-large-v3 | ~1.550 M | Ventanas de 30 s | Multilingue (99 idiomas) | Apache-2.0 | Safetensors, ONNX |
| oddadmix/whisper-large-v3-arabic-dialectal-v2 | ~1.550 M | Ventanas de 30 s | `ar` (dialectal) | Apache-2.0 | Safetensors (checkpoint original) |

La comparación con Whisper large-v3 base es la más informativa: este repositorio hereda su arquitectura y tamaño, pero sustituye el ajuste multilingüe generalista por uno especializado en dialectos árabes y cambia el formato a ONNX cuantizado para navegador. Frente al checkpoint original de `oddadmix`, la diferencia es únicamente de empaquetado y cuantización, no de capacidades.

## Limitaciones y advertencias

- Sesgos: al entrenarse sobre lahgtna (~255 horas), la cobertura de dialectos puede estar desequilibrada; los dialectos con menos representación en el corpus probablemente rindan peor.
- Alucinación: como todo modelo Whisper, puede generar texto plausible en segmentos con ruido, silencio o audio musical.
- Contexto: la ventana de 30 s es intrínseca a Whisper; audios más largos requieren segmentación externa y pueden perder coherencia entre fragmentos.
- Idioma: solo se declara árabe; no se garantiza un comportamiento correcto en otras lenguas.
- Licencia: Apache-2.0 permite uso comercial, pero conviene citar el trabajo original de `oddadmix` y revisar la licencia del corpus lahgtna, no detallada aquí.
- Producción: la cuantización 4-bit del decoder puede introducir una ligera pérdida de calidad frente al checkpoint fp16 original; no se han publicado métricas que la cuantifiquen.
- Madurez: el repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día; no hay evidencia de uso en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/subtitleking/oddadmix-whisper-large-v3-ar-dialectal-onnx
- Checkpoint original: https://huggingface.co/oddadmix/whisper-large-v3-arabic-dialectal-v2
- Transformers.js: https://github.com/huggingface/transformers.js
- Optimum (exportación ONNX): https://github.com/huggingface/optimum
- Whisper large-v3 (modelo base): https://huggingface.co/openai/whisper-large-v3
