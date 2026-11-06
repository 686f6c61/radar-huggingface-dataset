# xmikejo/sherpa-onnx-nemo-parakeet-tdt-0.6b-v2-int8

## Resumen

El repositorio `xmikejo/sherpa-onnx-nemo-parakeet-tdt-0.6b-v2-int8` es una distribución en formato ONNX del modelo de reconocimiento automático del habla (ASR) **NVIDIA NeMo Parakeet TDT 0.6B v2**, cuantizado a enteros de 8 bits y empaquetado para su uso con el runtime **sherpa-onnx**. No se trata de un modelo entrenado por el autor del repositorio, sino de una conversión y reempaquetado del checkpoint original de NVIDIA para despliegue en entornos de inferencia ligeros basados en ONNX Runtime.

El modelo subyacente, Parakeet TDT 0.6B v2, pertenece a la familia Parakeet de NVIDIA y emplea una arquitectura **TDT (Token-and-Duration Transducer)**, una variante de los transductores RNN que predice de forma conjunta tokens de texto y duraciones de emisión, lo que permite decodificación no autorregresiva por bloques y una latencia significativamente menor que los modelos CTC o attention-based convencionales. Con aproximadamente 600 millones de parámetros, está pensado para transcripción de voz en inglés (la variante v2 de Parakeet está orientada al inglés) con alta precisión y throughput elevado.

La relevancia de esta ficha radica en que el repositorio concreto proporciona únicamente los artefactos ONNX cuantizados (int8), sin model card técnica detallada, sin benchmarks publicados en el propio repositorio y sin información sobre el proceso exacto de conversión. Por tanto, los datos de arquitectura y entrenamiento que se recogen a continuación corresponden al modelo original de NVIDIA, no a una validación independiente de esta conversión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | TDT (Token-and-Duration Transducer), encoder conformer + decoder transducer (modelo base: NVIDIA NeMo Parakeet TDT 0.6B v2) |
| Parámetros totales | ~0,6 mil millones (600 M) según el nombre del modelo; no verificado en este repositorio |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo ASR; ventana de audio dependiente del encoder, no documentada en este repo) |
| Tipos de cuantización | int8 (única variante publicada en este repositorio) |
| Idiomas soportados | no disponibles en este repositorio; el modelo base Parakeet TDT 0.6B v2 está orientado al inglés |
| Licencia | cc-by-4.0 |
| Formato de pesos | ONNX (cuantizado int8), empaquetado para sherpa-onnx |

## Arquitectura y entrenamiento

El modelo base es un transductor TDT de NVIDIA NeMo. La arquitectura combina un encoder de tipo conformer (con atención multi-cabeza y convoluciones depthwise) que procesa las características acústicas, y un decoder/predictor que, junto con un joint network, produce simultáneamente la distribución sobre tokens y sobre duraciones de emisión. Esta predicción conjunta de duración permite al decodificador avanzar varios pasos por iteración, reduciendo el coste computacional de la decodificación frente a transductores RNN-T clásicos y frente a modelos attention encoder-decoder.

No se dispone en la información proporcionada de datos sobre el número de horas de audio de entrenamiento, la composición del dataset, ni si hubo etapas de fine-tuning supervisado o técnicas de aumento de datos. Tampoco se documenta en este repositorio el procedimiento de cuantización int8 aplicado (calibración, operadores cuantizados, precisión de las capas de atención). El repositorio contiene únicamente los artefactos ONNX y la licencia; no incluye scripts de conversión ni notas técnicas del autor.

## Capacidades

- Reconocimiento automático del habla (ASR) offline: transcripción de audio a texto en una sola pasada.
- Decodificación TDT no autorregresiva por bloques, con menor latencia que alternativas CTC o attention-based.
- Salida de transcripciones con puntuación y capitalización (característica del modelo base Parakeet v2; no verificada en esta conversión).
- Ejecución sobre ONNX Runtime mediante sherpa-onnx, lo que permite despliegue en CPU y en dispositivos embebidos sin dependencia de PyTorch.
- No se documenta soporte de tool calling, agentes, visión, audio generativo ni modos de razonamiento extendido: es un modelo puramente ASR.
- Capacidades multilingües: no disponibles en este repositorio; el modelo base está orientado al inglés.

## Casos de uso

- **Transcripción de reuniones y notas de voz en local**: al ejecutarse sobre ONNX Runtime con pesos int8, el modelo puede desplegarse en portátiles y servidores sin GPU dedicada, transcribiendo audio de forma privada sin enviar datos a la nube.
- **Subtitulado automático de vídeo**: integrado en pipelines de postproducción, permite generar pistas de subtítulos en inglés a partir de la banda sonora, con la ventaja de la baja latencia de la decodificación TDT para procesar lotes grandes de material.
- **Asistentes de voz en dispositivos embebidos**: el tamaño compacto (~0,6 B de parámetros, ~0,7 GB en int8) y el runtime sherpa-onnx facilitan su inclusión en Raspberry Pi, Jetson o dispositivos móviles para comandos de voz y dictado.
- **Análisis de llamadas de atención al cliente**: transcripción por lotes de grabaciones telefónicas para extracción de métricas, búsqueda de palabras clave y control de calidad, aprovechando el throughput del modelo en CPU.
- **Accesibilidad y dictado para personas con movilidad reducida**: transcripción en tiempo real de voz a texto en aplicaciones de escritorio, con independencia de servicios externos.
- **Indexación y búsqueda de archivos de audio**: conversión masiva de archivos de audio a texto para construir índices de búsqueda semántica o sistemas de recuperación de información sobre archivos de voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de WER, latencia ni throughput, ni comparaciones con otros modelos. Cualquier cifra de rendimiento del modelo base Parakeet TDT 0.6B v2 debe consultarse en la documentación oficial de NVIDIA NeMo, no en este repositorio.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el repositorio ocupa 0,7 GB en int8; la inferencia en GPU requeriría aproximadamente 1-2 GB de VRAM incluyendo buffers de activaciones y runtime, aunque no se ha verificado en esta conversión.
- **GPU recomendadas**: cualquier GPU con soporte de ONNX Runtime CUDA (RTX 3060 en adelante, A100, H100). Para CPU, cualquier procesador x86-64 moderno es suficiente.
- **Consumer GPU**: sí, cabe holgadamente en GPUs de consumo con 4 GB o más de VRAM; también es viable en CPU.
- **Opciones de despliegue**: sherpa-onnx (runtime nativo para el que está empaquetado), ONNX Runtime (CPU, CUDA, DirectML, CoreML), y potencialmente integraciones de sherpa-onnx en Python, C++, Android, iOS y WebAssembly.
- **Latencia y throughput**: no disponibles; no se han publicado mediciones en este repositorio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / audio | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Parakeet TDT 0.6B v2 (este repo, int8 ONNX) | ~600 M | no disponible | ONNX int8 | cc-by-4.0 | Hugging Face (repo del autor) |
| Whisper large-v3 | ~1.550 M | 30 s por ventana | safetensors, GGUF, ONNX | MIT (código) / pesos con licencia permisiva | Hugging Face, múltiples runtimes |
| Whisper small | ~244 M | 30 s por ventana | safetensors, GGUF, ONNX | MIT | Hugging Face |
| Wav2Vec2 / HuBERT base | ~95 M | no disponible | safetensors, ONNX | Apache 2.0 / MIT según checkpoint | Hugging Face |

La comparación se limita a parámetros, formato y licencia: no hay datos de WER ni latencia en este repositorio que permitan una comparación cuantitativa fiable con Whisper u otros modelos ASR.

## Limitaciones y advertencias

- **Idioma**: el modelo base Parakeet TDT 0.6B v2 está orientado al inglés; no se documenta soporte multilingüe en este repositorio.
- **Ausencia de model card técnica**: el repositorio no incluye información sobre el proceso de cuantización, la calibración int8 ni posibles degradaciones de precisión respecto al modelo original en fp32/fp16.
- **Riesgo de alucinación en ASR**: como todo modelo de transcripción, puede generar texto plausible en segmentos con ruido, silencios largos o audio ininteligible.
- **Sesgos**: no documentados; los modelos ASR pueden presentar sesgos de rendimiento según acento, dialecto, género o calidad del micrófono.
- **Licencia**: cc-by-4.0 permite uso comercial con atribución; debe conservarse la atribución al autor del repositorio y, en su caso, a NVIDIA como creador del modelo base. Verificar la licencia del checkpoint original de NVIDIA antes de un despliegue comercial.
- **Repositorio sin mantenimiento aparente**: 0 descargas y 0 likes en el momento de la consulta; sin garantías de soporte ni actualizaciones.
- **Formato específico**: los artefactos están empaquetados para sherpa-onnx; su uso con otros runtimes ONNX puede requerir ajustes en el preprocesado de audio y en la decodificación TDT.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/xmikejo/sherpa-onnx-nemo-parakeet-tdt-0.6b-v2-int8
- Modelo base en Hugging Face (NVIDIA): https://huggingface.co/nvidia/parakeet-tdt-0.6b-v2
- Documentación de NVIDIA NeMo sobre Parakeet: https://docs.nvidia.com/nemo-framework/user-guide/latest/nemotoolkit/asr/models.html
- Runtime sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- ONNX Runtime: https://onnxruntime.ai/
