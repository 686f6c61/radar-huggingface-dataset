# tpmaerk/parakeet-ultra-sherpa-onnx-int8

## Resumen

Parakeet Ultra sherpa-onnx int8 es una conversión de formato del modelo de reconocimiento automático de voz (ASR) Parakeet Ultra de Moondream, un ajuste fino del NVIDIA Parakeet TDT 0.6B v3. El repositorio, publicado por el usuario tpmaerk, no entrena ningún peso nuevo: únicamente remapea el checkpoint original al formato `nemo_transducer` que entiende sherpa-onnx y lo exporta a ONNX con cuantización int8 dinámica. Su objetivo es servir como sustituto directo del bundle `csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8` en aplicaciones de transcripción local, sin necesidad de GPU.

La arquitectura subyacente es un encoder FastConformer (24 capas, dimensión de modelo 1024) con decodificador y joiner de tipo TDT (Token-and-Duration Transducer), sobre un total de aproximadamente 600 millones de parámetros. El modelo trabaja sobre audio, soporta alemán, inglés y otros idiomas multilingües (hasta 25 lenguas europeas según las conversiones derivadas) y se distribuye bajo licencia CC BY 4.0.

Su relevancia práctica está en el rendimiento medido por el propio autor: sobre el split de test FLEURS de_de (862 clips, 189 minutos) obtiene un WER del 5.42 % con un factor de tiempo real de 46.2x en CPU, frente al 6.82 % y 44.5x del bundle V3 int8 equivalente. Es decir, mejora la precisión del modelo base manteniendo velocidad de transcripción en tiempo real sobre hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (encoder) + TDT (Token-and-Duration Transducer) para decodificador y joiner |
| Parametros totales | Aproximadamente 0.6B (modelo base parakeet-tdt-0.6b-v3); encoder FastConformer 24x1024 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo ASR sobre audio; no se especifica la ventana de audio máxima) |
| Tipos de cuantizacion | int8 (cuantización dinámica aplicada en la exportación ONNX); el checkpoint fuente usaba F16 convertido a F32 antes de exportar |
| Idiomas soportados | Alemán (de), inglés (en) y multilingüe (hasta 25 lenguas europeas según conversiones derivadas del mismo modelo base) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX int8 (encoder.int8.onnx, decoder.int8.onnx, joiner.int8.onnx) junto con tokens.txt; el checkpoint original de Parakeet Ultra está en safetensors |

## Arquitectura y entrenamiento

El modelo es un transducer de voz de tipo TDT construido sobre un encoder FastConformer de 24 capas y dimensión 1024, con un decodificador y un joiner que predicen simultáneamente el token y su duración. Esta es la arquitectura estándar de la familia NVIDIA Parakeet TDT 0.6B v3, y Parakeet Ultra la conserva íntegramente (FastConformer 24x1024, decodificador TDT, 25 idiomas europeos). El ajuste fino Parakeet Ultra de Moondream añade entrenamiento adicional sobre esos pesos, pero en esta ficha no se dispone de detalles sobre el dataset, el número de tokens de audio ni la composición del corpus usados en ese ajuste (no disponible en la información proporcionada).

Esta conversión concreta no implica entrenamiento. El checkpoint `model.safetensors` de Parakeet Ultra (revisión 73175eb7) se remapeó al state dict de NeMo de `nvidia/parakeet-tdt-0.6b-v3` (revisión 541d1f99) sólo renombrando claves (la inversa de `convert_nemo_to_hf.py` de transformers). Los seis tensores `vad_head.*` de Ultra, que no forman parte de la arquitectura NeMo, se descartaron, y los pesos almacenados en F16 se convirtieron a F32. La exportación se hizo con `export_onnx.py` del script `scripts/nemo/parakeet-tdt-0.6b-v3` de k2-fsa/sherpa-onnx aplicando cuantización int8 dinámica. El autor verificó que aplicar la misma cadena de conversión a V3 reproduce las transcripciones del bundle de csukuangfj en los 862 clips de test de FLEURS alemán, y que dos exportaciones producen archivos idénticos byte a byte.

## Capacidades

- Reconocimiento automático de voz (ASR) sobre audio, con decodificación greedy.
- Transcripción multilingüe: alemán e inglés explícitamente etiquetados, más cobertura multilingüe europea (hasta 25 idiomas según las conversiones del mismo base).
- Decodificación TDT (Token-and-Duration Transducer), que predice duraciones de token para acelerar la inferencia.
- Ejecución en CPU sin GPU, con cuantización int8 dinámica, orientada a despliegue en aplicaciones locales.
- Integración directa con sherpa-onnx como `OfflineRecognizer.from_transducer` (model_type `nemo_transducer`, feature_dim 128).
- Pensado como sustituto directo (drop-in) del bundle Parakeet TDT 0.6B v3 int8 en pipelines existentes.
- Soporte de tool calling, agentes, visión, audio generativo o modo de razonamiento: no disponible (no son capacidades de este modelo).

## Casos de uso

- Transcripción por lotes local: el modelo está pensado como "local batch transcription model" (Meeting Miner), y permite procesar horas de audio sin depender de servicios en la nube, con un factor de tiempo real de 46.2x en CPU.
- Actas y notas de reuniones: transcripción de conversaciones multilingües (alemán/inglés) en equipos distribuidos, integrándolo en herramientas como Meeting Miner o DictFlow.
- Dictado en aplicaciones de escritorio: al ejecutarse en CPU con sherpa-onnx, encaja en editores de texto o herramientas de productividad que necesitan dictado continuo sin stack de GPU.
- Subtitulado y post-producción de audio/vídeo: generación de transcripciones con marcas de tiempo a partir de pipelines de audio offline, aprovechando el decodificador TDT.
- Indexación y búsqueda de contenido hablado: transcripción de archivos de audio para alimentar motores de búsqueda o sistemas de recuperación sobre podcasts, clases o entrevistas.
- Automatización de accesibilidad: generar subtítulos o transcripciones para vídeos y audio en tiempo casi real sobre hardware de consumo.
- Preprocesado en pipelines de datos: conversión de audio a texto en procesos de ingeniería de datos, aprovechando que el bundle funciona como reemplazo directo de V3 int8 sin cambiar la infraestructura.
- Despliegue embebido/edge: la versión int8 y la ejecución 100 % CPU permiten integraciones en dispositivos sin acelerador dedicado.

## Benchmarks y rendimiento

El autor aporta una medición propia (no de la model card de Parakeet Ultra) sobre el split FLEURS de_de (862 clips, 189 minutos), con sherpa-onnx 1.13.8, CPU, 4 hilos, decodificación greedy, Apple M4 Pro y normalización simple (minúsculas, sin puntuación):

| Bundle | WER | Factor de tiempo real |
|---|---|---|
| Parakeet V3 int8 (csukuangfj) | 6.82 % | 44.5x |
| Parakeet Ultra int8 (este repo) | 5.42 % | 46.2x |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que se trata de un modelo de ASR y no de un modelo de lenguaje.

## Requisitos de hardware

- Tamaño del repositorio: 0.7 GB (encoder.int8.onnx 652 MB, decoder.int8.onnx 11.8 MB, joiner.int8.onnx 6.3 MB, tokens.txt 93 KB).
- VRAM: no requiere GPU. El modelo está diseñado para inferencia en CPU con cuantización int8; la huella de memoria en RAM es del orden del tamaño de los ficheros ONNX (aproximadamente 670 MB).
- GPU recomendadas: no aplica (no se recomienda ninguna GPU específica en la información disponible). El autor ha medido en Apple M4 Pro.
- Cabe en hardware de consumo: sí, en CPU de portátiles y equipos de escritorio (Apple M4 Pro verificado; otros procesadores x86/ARM no verificados en la información disponible).
- Opciones de despliegue: sherpa-onnx (OfflineRecognizer.from_transducer con model_type `nemo_transducer`, feature_dim 128). No se mencionan vLLM, llama.cpp, Ollama o TGI (no aplicables a este formato).
- Latencia y throughput: factor de tiempo real medido de 46.2x en Apple M4 Pro con CPU, 4 hilos y decodificación greedy (aproximadamente 46 minutos de audio procesados por minuto de cómputo). Latencia exacta por clip no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | WER (FLEURS de) | RTF | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| tpmaerk/parakeet-ultra-sherpa-onnx-int8 (este) | ~0.6B | de, en, multilingüe | ONNX int8 | 5.42 % | 46.2x | CC BY 4.0 | HuggingFace |
| csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8 | ~0.6B | multilingüe (V3) | ONNX int8 | 6.82 % | 44.5x | CC BY 4.0 | HuggingFace |
| moondream/parakeet-ultra | ~0.6B | de, en, multilingüe | safetensors | no disponible | no disponible | CC BY 4.0 | HuggingFace |
| mldecode/parakeet-ultra-onnx-int8 | ~0.6B | multilingüe (25 idiomas europeos) | ONNX int8 | no disponible | no disponible | CC BY 4.0 | HuggingFace |
| Olicorne/parakeet-tdt-0.6b-v3-ultra-onnx | ~0.6B | multilingüe | ONNX | no disponible | no disponible | no disponible | HuggingFace |

Todas las alternativas comparten el mismo modelo base (Parakeet TDT 0.6B v3, ajustado por Moondream en el caso de Ultra) y difieren principalmente en la cadena de conversión y el empaquetado. El bundle de csukuangfj es la referencia declarada que este repositorio reemplaza.

## Limitaciones y advertencias

- Es una conversión de formato, no un modelo entrenado: cualquier limitación de Parakeet Ultra o del Parakeet TDT 0.6B v3 subyacente se hereda intacta.
- Los seis tensores `vad_head.*` del modelo original se descartaron por no pertenecer a la arquitectura NeMo; si una aplicación dependía de esa cabecera VAD, no está disponible en este bundle.
- La detección del modelo por parte de sherpa-onnx depende de la subcadena "tdt" en los metadatos del encoder (`url`); con versiones distintas a sherpa-onnx 1.13.x el modelo podría no cargarse.
- Riesgo de alucinación en ASR (inserciones o sustituciones plausibles en audio ruidoso o con solapamiento de voces): no se han publicado métricas específicas de robustez fuera de FLEURS.
- La cobertura multilingüe de 25 idiomas europeos se menciona para las conversiones derivadas del mismo base; no está confirmada en esta ficha para este bundle concreto.
- Los benchmarks disponibles proceden de una única evaluación del autor en alemán (FLEURS de_de) sobre Apple M4 Pro; no hay validación independiente ni resultados en inglés u otros idiomas.
- Licencia CC BY 4.0: permite uso comercial con atribución, pero exige acreditar tanto a NVIDIA como a Moondream y respetar las condiciones de la licencia original.
- No hay garantías de mantenimiento: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se documentan actualizaciones posteriores.
- No se especifica la ventana máxima de audio procesable, lo que puede afectar a la transcripción de grabaciones muy largas sin segmentación previa.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/tpmaerk/parakeet-ultra-sherpa-onnx-int8
- Modelo base (fine-tune): https://huggingface.co/moondream/parakeet-ultra
- Modelo original de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Bundle de referencia que reemplaza: https://huggingface.co/csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8
- Repositorio sherpa-onnx (k2-fsa): https://github.com/k2-fsa/sherpa-onnx
- Script de exportación usado: https://github.com/k2-fsa/sherpa-onnx/tree/master/scripts/nemo/parakeet-tdt-0.6b-v3
- Conversión independiente del mismo modelo: https://huggingface.co/Olicorne/parakeet-tdt-0.6b-v3-ultra-onnx
- Conversión alternativa a ONNX int8: https://huggingface.co/mldecode/parakeet-ultra-onnx-int8
- Conversión alternativa a sherpa-onnx: https://huggingface.co/mldecode/sherpa-onnx-parakeet-ultra-int8
- Referencia sobre Parakeet ONNX (tapWhisper): https://tapwhisper.com/models/parakeet/
