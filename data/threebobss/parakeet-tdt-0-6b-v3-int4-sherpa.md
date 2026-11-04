# threebobss/parakeet-tdt-0.6b-v3-int4-sherpa

## Resumen

Parakeet Ultra int4 para sherpa-onnx es un paquete de inferencia de reconocimiento automático del habla (ASR) listo para ejecutarse en dispositivo, derivado de Parakeet-TDT-0.6B-v3 de NVIDIA y posteriormente reentrenado por Moondream bajo el nombre Parakeet Ultra. El autor de esta ficha, threebobss, ha sustituido los pesos originales en la exportación ONNX de sherpa-onnx y ha cuantizado el encoder a 4 bits y el decoder y el joiner a 8 bits, reduciendo el peso del encoder a unos 391 MB. El resultado es un conjunto de ficheros ONNX que se cargan con sherpa-onnx 2.0.1 usando `model_type="nemo_transducer"`.

La arquitectura subyacente es un transducer TDT (Token-and-Duration Transducer) de aproximadamente 0,6 mil millones de parámetros, con encoder, decoder y joiner separados. El modelo está pensado para dictado y transcripción en tiempo real sobre hardware modesto, sin necesidad de GPU dedicada ni de servicios en la nube. Soporta ocho idiomas europeos (inglés, alemán, francés, español, portugués, italiano, rumano y neerlandés) y se distribuye bajo licencia CC-BY-4.0.

Su relevancia actual radica en la combinación de un modelo ASR multilingüe de tamaño medio con una cuantización agresiva del encoder que lo hace viable en CPU y en dispositivos de borde, manteniendo el formato estándar de sherpa-onnx y, por tanto, la integración directa en aplicaciones de escritorio, móviles o embebidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer transducer TDT (encoder, decoder y joiner separados) |
| Parametros totales | 0,6 B (aproximado, según la denominación Parakeet-TDT-0.6B-v3) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Encoder INT4 (bloque de 64, asimétrico); decoder y joiner INT8 (cuantización dinámica con `onnxruntime.quantization.quantize_dynamic`) |
| Idiomas soportados | en, de, fr, es, pt, it, ro, nl |
| Licencia | CC-BY-4.0 (Silero VAD incluido bajo MIT) |
| Formato de pesos | ONNX (encoder.int4.onnx, decoder.int8.onnx, joiner.int8.onnx) |

## Arquitectura y entrenamiento

El modelo es un transducer de tipo TDT, una variante de RNN-Transducer en la que el predictor emite conjuntamente tokens y duraciones, lo que reduce el número de pasos de decodificación y mejora la latencia frente a un transducer clásico. La red se divide en tres componentes: un encoder que procesa las características acústicas, un decoder (predictor) que modela el historial de tokens y un joiner que combina ambos para producir la distribución sobre el vocabulario y las duraciones.

Los pesos proceden de Parakeet-TDT-0.6B-v3 de NVIDIA, reentrenados posteriormente por Moondream como Parakeet Ultra. No se dispone de información sobre el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO; estos datos no están disponibles en la información proporcionada. La innovación técnica de esta ficha concreta es la cuantización: el encoder se cuantiza a 4 bits con bloques de 64 y esquema asimétrico, y sus convoluciones pointwise se reescriben como `MatMul` para que puedan cuantizarse; el decoder y el joiner se cuantizan a 8 bits de forma dinámica. La cabeza de detección de actividad de voz de Moondream no se incluye; en su lugar se distribuye Silero VAD como fichero independiente.

## Capacidades

- Transcripción de voz a texto en ocho idiomas: inglés, alemán, francés, español, portugués, italiano, rumano y neerlandés.
- Reconocimiento en tiempo real o casi real sobre CPU, adecuado para dictado y subtitulado.
- Detección de actividad de voz mediante Silero VAD, incluida en el paquete de ficheros.
- Ejecución en dispositivo sin dependencia de servicios en la nube, gracias al formato ONNX y a la cuantización INT4/INT8.
- Integración con sherpa-onnx 2.0.1 mediante `model_type="nemo_transducer"`.
- No se ha documentado soporte de tool calling, agentes, razonamiento multi-paso, visión, audio de entrada más allá del propio ASR ni modo de pensamiento; estas capacidades no están disponibles en la información proporcionada.

## Casos de uso

- Dictado en aplicaciones de escritorio: el paquete se carga con sherpa-onnx y permite transcribir la voz del usuario en local, sin enviar audio a servidores externos, lo que resulta adecuado para herramientas de productividad con requisitos de privacidad.
- Subtitulado en directo de reuniones o vídeos: el modelo procesa flujos de audio con Silero VAD para segmentar el habla y generar subtítulos en varios idiomas europeos con latencia baja sobre CPU.
- Transcripción de notas de voz en aplicaciones móviles: el tamaño reducido del encoder INT4 (unos 391 MB) y del resto de ficheros permite empaquetar el modelo en aplicaciones móviles o de escritorio con recursos limitados.
- Asistentes de voz embebidos: la ejecución en dispositivo y la ausencia de dependencia de red encajan en dispositivos de borde, electrodomésticos o sistemas de automoción que necesitan reconocimiento local.
- Archivado y búsqueda de audio corporativo: transcripción por lotes de reuniones y llamadas en varios idiomas para generar índices de texto consultables, ejecutando el modelo en servidores CPU sin GPU.
- Accesibilidad: generación de transcripciones en tiempo real para personas con discapacidad auditiva en entornos con hardware modesto, aprovechando la cuantización para reducir requisitos.
- Prototipado rápido de pipelines ASR: al ser un paquete ONNX estándar de sherpa-onnx, permite integrar reconocimiento multilingüe en demos y pruebas de concepto sin entrenamiento adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al ejecutarse con sherpa-onnx sobre ONNX Runtime, puede funcionar en CPU sin VRAM dedicada.
- Tamaño en disco de los ficheros principales: encoder INT4 de 391.387.125 bytes, decoder INT8 de 11.845.274 bytes, joiner INT8 de 6.355.277 bytes, tokens de 93.939 bytes y Silero VAD de 643.854 bytes; el repositorio completo ocupa 0,8 GB.
- GPU recomendadas: no disponibles en la información proporcionada; el diseño está orientado a inferencia en CPU y dispositivos de borde.
- ¿Cabe en GPU de consumo? No se especifica; por tamaño de pesos, el encoder INT4 es inferior a 0,5 GB, por lo que en principio cabría en cualquier GPU de consumo con suficiente memoria libre, aunque no se han publicado requisitos oficiales.
- Opciones de despliegue: sherpa-onnx 2.0.1 con `model_type="nemo_transducer"`; no se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI para este paquete.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Parakeet Ultra int4 sherpa-onnx (esta ficha) | 0,6 B | no disponible | 8 (en, de, fr, es, pt, it, ro, nl) | CC-BY-4.0 | ONNX (INT4/INT8) | Cuantizado para sherpa-onnx, orientado a CPU |
| Parakeet-TDT-0.6B-v3 (NVIDIA) | 0,6 B | no disponible | no disponible en esta ficha | CC-BY-4.0 | no disponible | Modelo base original de NVIDIA |
| Parakeet Ultra (Moondream) | 0,6 B | no disponible | no disponible en esta ficha | CC-BY-4.0 | no disponible | Reentrenamiento del modelo de NVIDIA |
| Exportación fp32 de sherpa-onnx (csukuangfj) | 0,6 B | no disponible | no disponible en esta ficha | no disponible | ONNX fp32 | Exportación sin cuantizar usada como base |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El modelo está especializado en ASR; no es un modelo de propósito general y no debe esperarse de él generación de texto libre, razonamiento ni código.
- La cuantización INT4 del encoder puede degradar la precisión de transcripción frente a la versión fp32; no se han publicado métricas de la pérdida de calidad.
- Solo cubre ocho idiomas europeos; no se ha documentado soporte de otros idiomas ni de code-switching.
- No se dispone de información sobre sesgos acústicos, de género, de acento o de dominio; es recomendable evaluar el modelo en el dominio objetivo antes de usarlo en producción.
- Riesgo de alucinación en pasajes de audio ruidoso o silencioso; el uso de Silero VAD mitiga parcialmente este riesgo, pero no lo elimina.
- La licencia CC-BY-4.0 exige atribución a NVIDIA, Moondream y a los autores de la exportación y cuantización; el fichero Silero VAD se rige por MIT.
- El paquete depende de la versión 2.0.1 de sherpa-onnx y de `model_type="nemo_transducer"`; versiones distintas pueden no ser compatibles.
- No se incluye la cabeza de detección de actividad de voz de Moondream; la segmentación depende de Silero VAD.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, por lo que no existe validación comunitaria amplia documentada.

## Enlaces

- [HuggingFace: threebobss/parakeet-tdt-0.6b-v3-int4-sherpa](https://huggingface.co/threebobss/parakeet-tdt-0.6b-v3-int4-sherpa)
- [Parakeet-TDT-0.6B-v3 (NVIDIA)](https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3)
- [Parakeet Ultra (Moondream)](https://huggingface.co/moondream/parakeet-ultra)
- [Exportación fp32 de sherpa-onnx (csukuangfj)](https://huggingface.co/csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3)
- [Repositorio sherpa-onnx](https://github.com/k2-fsa/sherpa-onnx)
- [Silero VAD](https://github.com/snakers4/silero-vad)
- [Licencia CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/)
