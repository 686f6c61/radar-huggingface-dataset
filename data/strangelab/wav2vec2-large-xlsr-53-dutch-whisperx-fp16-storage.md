# strangelab/wav2vec2-large-xlsr-53-dutch-whisperx-fp16-storage

## Resumen

`strangelab/wav2vec2-large-xlsr-53-dutch-whisperx-fp16-storage` es un checkpoint derivado del modelo de reconocimiento de voz en neerlandés de Jonatas Grosman (`jonatasgrosman/wav2vec2-large-xlsr-53-dutch`), reconvertido a safetensors en FP16 por Strange Lab. No es un modelo de transcripción autónomo pensado para uso general, sino un modelo de alineación forzada (*forced alignment*) para WhisperX: recibe audio y una transcripción ya existente y devuelve las marcas temporales a nivel de palabra.

El problema que resuelve es el de la sincronización fina entre texto y audio en neerlandés dentro de pipelines de WhisperX. WhisperX usa modelos wav2vec2 CTC como alineadores por idioma; este checkpoint conserva el vocabulario y los 24 bloques del encoder del alineador neerlandés por defecto, pero almacena los pesos en FP16, lo que reduce el tamaño en disco de 1,26 GB a 631,01 MB.

Es relevante por dos motivos prácticos: permite desplegar el alineador neerlandés con la mitad de espacio de almacenamiento y mantiene exactamente la misma salida temporal que el checkpoint original en las pruebas del autor. El repositorio es de tamaño reducido (0,6 GB), con 315.478.695 parámetros reales según safetensors, licencia Apache 2.0 y soporte exclusivo del idioma neerlandés (`nl`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2 (encoder transformer, 24 bloques de encoder) con cabeza CTC |
| Parametros totales | 315.478.695 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo acústico de alineación; no se especifica ventana máxima en la información disponible) |
| Tipos de cuantizacion | pesos almacenados en FP16 (safetensors); en inferencia WhisperX los cargó como FP32 en la prueba en CPU; el ejemplo del autor usa `compute_type int8` |
| Idiomas soportados | neerlandés (`nl`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP16) |

## Arquitectura y entrenamiento

El modelo es un wav2vec2-large XLSR-53 adaptado al neerlandés por Jonatas Grosman y posteriormente reconvertido por Strange Lab. La arquitectura es la de wav2vec2: un extractor de características convolucional seguido de un encoder transformer de 24 bloques, con una cabeza de clasificación CTC sobre el vocabulario de fonemas/caracteres del alineador. El checkpoint derivado mantiene el vocabulario y los 24 bloques de encoder del modelo de alineación neerlandés por defecto de WhisperX.

No se dispone en la información proporcionada de datos sobre el volumen de tokens de audio, la composición del corpus de entrenamiento original, ni si hubo etapas de ajuste fino adicionales más allá de la adaptación de Grosman. La modificación introducida por Strange Lab es exclusivamente de almacenamiento: conversión de los pesos a FP16 en safetensors, sin cambios en la arquitectura ni en la topología. Según la model card, WhisperX 3.8.6 cargó los pesos como FP32 en la prueba realizada en CPU, lo que indica que la conversión afecta al almacenamiento y no necesariamente al tipo de cómputo en tiempo de inferencia.

## Capacidades

- Alineación forzada de palabras en audio neerlandés a partir de una transcripción suministrada.
- Generación de marcas temporales de inicio y fin por palabra (*word timestamps*) para WhisperX.
- Clasificación CTC sobre el vocabulario del alineador neerlandés.
- Integración directa en WhisperX 3.8.6 mediante `whisperx.load_align_model` o la CLI con `--align_model`.
- Ejecución en CPU con `compute_type int8` según el ejemplo del autor.
- No realiza transcripción autónoma de audio a texto: requiere el texto de entrada.
- No soporta tool calling, function calling, agentes, visión ni audio más allá de la propia tarea de alineación.
- Capacidad multilingüe: no; únicamente neerlandés.

## Casos de uso

- Subtitulado de vídeo en neerlandés: dado un audio y su transcripción, el modelo devuelve los tiempos por palabra necesarios para generar subtítulos SRT/VTT sincronizados, con un error mediano de frontera de 35 ms según las pruebas del autor.
- Sincronización de transcripciones en pipelines de WhisperX: se usa como `--align_model` para obtener timestamps precisos tras la fase de transcripción, reduciendo el coste de almacenamiento del alineador a la mitad (631,01 MB frente a 1,26 GB).
- Análisis lingüístico y corpus orales: alineación de grabaciones con transcripciones humanas para estudios fonéticos o de duración de segmentos, con error de percentil 90 de 96 ms frente a etiquetas humanas.
- Indexación y búsqueda en archivos de audio neerlandeses: los timestamps por palabra permiten construir índices que localizan términos concretos dentro de horas de grabación.
- Despliegue en entornos con recursos limitados: al ocupar 0,6 GB el repositorio y poder ejecutarse en CPU con int8, encaja en servidores sin GPU o en contenedores pequeños.
- Evaluación de calidad de transcripciones: comparar los límites de palabra alineados con los esperados para detectar desalineaciones sistemáticas en un pipeline ASR existente.
- Procesamiento por lotes en CPU: con un tiempo mediano de alineación en caliente de unos 282 ms en un Apple M4, es viable procesar lotes moderados sin acelerador dedicado.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Grabaciones evaluadas | 64 grabaciones en neerlandés del IFA Spoken Language Corpus, con transcripciones y límites de frase suministrados |
| Palabras comparadas | 792 |
| Coincidencia de tiempos con el checkpoint original | Idénticos tiempos de inicio y fin en las 792 palabras |
| Error mediano de frontera frente a etiquetas humanas | 35 ms |
| Error de percentil 90 frente a etiquetas humanas | 96 ms |
| Tiempo mediano de alineación en caliente | Aproximadamente 282 ms en CPU Apple M4 |

No se han publicado en la información disponible resultados de benchmarks estándar de ASR (WER, MMLU, HumanEval, GSM8K u otros), lo cual es coherente con la naturaleza del modelo: es un alineador, no un transcriptor.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 315 millones de parámetros, los pesos en FP16 ocupan aproximadamente 0,63 GB y en FP32 alrededor de 1,26 GB, por lo que la huella de memoria es reducida.
- GPU recomendadas: no se especifican en la información disponible; por tamaño, cualquier GPU con al menos 2-4 GB de memoria libre debería ser suficiente para el modelo en FP16 o FP32.
- Cabe en GPU de consumo: sí, por tamaño (por ejemplo, RTX 3060, RTX 4060 o superiores), aunque el autor no documenta pruebas en GPU.
- Despliegue: WhisperX 3.8.6 es la vía documentada, tanto por CLI como por API Python (`whisperx.load_align_model`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que además no son adecuadas para un modelo CTC de alineación.
- Latencia y throughput: mediana de aproximadamente 282 ms por alineación en caliente en CPU Apple M4; no se proporcionan datos de throughput por lote ni latencias en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| strangelab/wav2vec2-large-xlsr-53-dutch-whisperx-fp16-storage | 315.478.695 | no disponible | nl | Apache 2.0 | safetensors FP16 | Alineador para WhisperX; 631,01 MB en disco |
| jonatasgrosman/wav2vec2-large-xlsr-53-dutch | no disponible en la informacion | no disponible | nl | Apache 2.0 (modelo base citado) | no disponible en la informacion | Modelo original del que deriva; 1,26 GB según la model card |
| Alineador neerlandés por defecto de WhisperX | no disponible en la informacion | no disponible | nl | no disponible en la informacion | no disponible en la informacion | Referencia de comportamiento; según el autor, tiempos idénticos en la prueba realizada |

No se dispone de datos de benchmarks comparativos adicionales ni de otras alternativas de alineación neerlandesa en la información proporcionada.

## Limitaciones y advertencias

- Solo neerlandés: no es utilizable para otros idiomas sin un alineador específico.
- No transcribe: requiere una transcripción previa; los errores en el texto de entrada degradan la alineación.
- La evaluación se limita a 64 grabaciones del IFA Spoken Language Corpus y 792 palabras; no hay validación publicada en dominios ruidosos, acentos regionales o audio telefónico.
- El almacenamiento en FP16 puede implicar pérdida de precisión numérica frente al original en FP32; el autor no documenta diferencias de precisión más allá de la coincidencia de tiempos observada.
- WhisperX 3.8.6 cargó los pesos como FP32 en la prueba en CPU, por lo que el ahorro de memoria en ejecución no está garantizado y depende del backend.
- Riesgo de alucinación: no aplica en el sentido generativo, pero una alineación forzada puede producir fronteras erróneas si el audio y el texto no coinciden.
- Sesgos: no se documentan sesgos específicos; al derivar de un corpus de entrenamiento no detallado en la información disponible, su cobertura de variedades dialectales es desconocida.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base y del corpus IFA empleado en la evaluación.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de adopción por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/strangelab/wav2vec2-large-xlsr-53-dutch-whisperx-fp16-storage
- Modelo base original: https://huggingface.co/jonatasgrosman/wav2vec2-large-xlsr-53-dutch
- Revisión concreta del checkpoint original citada por el autor: https://huggingface.co/jonatasgrosman/wav2vec2-large-xlsr-53-dutch/tree/46f221381d200f7bef268309b3f02023ccf11fcc
- IFA Spoken Language Corpus: https://www.fon.hum.uva.nl/IFA-SpokenLanguageCorpora/IFAcorpus/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
