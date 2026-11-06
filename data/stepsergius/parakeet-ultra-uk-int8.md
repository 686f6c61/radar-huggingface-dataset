# stepsergius/parakeet-ultra-uk-int8

## Resumen

Parakeet Ultra UK INT8 es una exportación cuantizada a int8 del modelo de reconocimiento automático del habla (ASR) `moondream/parakeet-ultra`, que a su vez es un post-entrenamiento de `nvidia/parakeet-tdt-0.6b-v3`. El artefacto lo publica el usuario `stepsergius` empaquetado para sherpa-onnx, con el objetivo declarado de integrarse en Klavko para Windows. Se trata, por tanto, de una conversión de formato y cuantización más que de un modelo entrenado desde cero por el autor del repositorio.

La arquitectura subyacente es un transductor TDT (Token-and-Duration Transducer) de NeMo con aproximadamente 0,6 mil millones de parámetros, compuesto por encoder, decoder y joiner exportados por separado a ONNX. El contexto y los idiomas son los del modelo base: 25 lenguas europeas, con el ucraniano como foco principal de la evaluación publicada.

Su relevancia práctica es doble: por un lado, ofrece una mejora medible sobre el modelo v3 original en ucraniano (14,41 % → 11,41 % de WER en FLEURS dev) y, por otro, al estar en int8 y formato sherpa-onnx, rebaja los requisitos de despliegue en CPU y facilita la integración en aplicaciones de escritorio sin GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NeMo TDT (Token-and-Duration Transducer): encoder + decoder + joiner |
| Parametros totales | ~0,6 B (heredados de parakeet-tdt-0.6b-v3) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (exportación cuantizada de encoder, decoder y joiner) |
| Idiomas soportados | uk, en, de, fr, es, it, pl, pt, nl, cs, sk, bg, hr, da, et, fi, el, hu, lv, lt, mt, ro, sl, sv, ru (25) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (exportación sherpa-onnx) |

## Arquitectura y entrenamiento

El modelo es un transductor TDT de NVIDIA NeMo. La exportación parte de los pesos de `moondream/parakeet-ultra` en disposición de transformers y los inyecta en la estructura del modelo NeMo de `nvidia/parakeet-tdt-0.6b-v3`: según la model card, se transfieren las 723 tensores aprendidos de Ultra con las mismas formas, mientras que del preprocesador se conservan la ventana y el banco de filtros de v3. Posteriormente se exportan encoder, decoder y joiner y se cuantizan siguiendo el mismo procedimiento que la exportación oficial de sherpa-onnx para parakeet-tdt-0.6b-v3, manteniendo la metadata y la marca "tdt" en la URL para que sherpa-onnx reconozca el tipo de modelo.

No se detallan en la información disponible los datos de entrenamiento del modelo base (número de tokens, composición del corpus, uso de RLHF o DPO) ni innovaciones adicionales más allá de la propia arquitectura TDT, que combina predicción de tokens con predicción de duración para acelerar la decodificación. Tampoco se especifica el proceso de post-entrenamiento aplicado por moondream sobre v3.

## Capacidades

- Reconocimiento automático del habla (transcripción de audio a texto) en 25 idiomas europeos.
- Especial énfasis en ucraniano, idioma sobre el que se publica la evaluación de referencia.
- Decodificación TDT, que predice duraciones de token para reducir pasos de inferencia.
- Ejecución en CPU mediante sherpa-onnx, sin necesidad de GPU.
- Integración pensada para aplicaciones de escritorio (Klavko para Windows).
- No se documenta soporte de tool calling, agentes, visión, audio generativo ni modo de razonamiento; es un modelo puramente ASR.

## Casos de uso

- Transcripción de reuniones y notas de voz en ucraniano: el modelo ofrece un WER del 11,41 % en FLEURS dev, inferior al 14,41 % de v3, lo que lo hace adecuado para dictado y actas en entornos de oficina.
- Subtitulado de vídeo multilingüe: al cubrir 25 idiomas europeos, puede generar pistas de subtítulos para contenido en inglés, alemán, francés, español, polaco, etc., desde un único modelo.
- Asistentes de dictado en aplicaciones de escritorio: su formato ONNX int8 y su integración con sherpa-onnx permiten embeberlo en apps Windows como Klavko sin dependencias de CUDA.
- Transcripción en servidores sin GPU: al ejecutarse en CPU con 4 hilos (configuración usada en la evaluación), encaja en despliegues de bajo coste o en dispositivos edge.
- Procesamiento por lotes de archivos de audio: la exportación en tres componentes (encoder, decoder, joiner) facilita pipelines de inferencia por etapas en sherpa-onnx.
- Atención al cliente con transcripción de llamadas: permite convertir grabaciones de soporte en texto para análisis posterior, con cobertura multilingüe para mercados europeos.
- Accesibilidad: generación de transcripciones en tiempo real para personas con discapacidad auditiva en entornos de habla ucraniana o de otras lenguas europeas.

## Benchmarks y rendimiento

Evaluación publicada en la model card sobre el conjunto de desarrollo de FLEURS en ucraniano (325 grabaciones), con sherpa-onnx 1.13.8, int8 y 4 hilos:

| Metrica | parakeet-tdt-0.6b-v3 | parakeet-ultra-uk-int8 |
|---|---|---|
| WER (FLEURS dev, uk) | 14,41 % | 11,41 % |
| Tiempo de procesado | 88 s | 93 s |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparativas con otros modelos ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso de ejecución en CPU; el repositorio ocupa 0,7 GB en int8.
- GPU recomendadas: no se especifican; el modelo está exportado para sherpa-onnx, orientado a CPU.
- ¿Cabe en GPU consumer? Sí, por tamaño (0,6 B en int8), aunque la información no documenta un backend GPU para esta exportación concreta.
- Opciones de despliegue: sherpa-onnx (librería declarada); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: en la evaluación publicada, 325 grabaciones procesadas en 93 s con 4 hilos en CPU (frente a 88 s de v3), lo que supone un coste adicional de aproximadamente el 5,7 % en tiempo de procesado.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | WER uk (FLEURS dev) | Licencia | Formato |
|---|---|---|---|---|---|
| parakeet-ultra-uk-int8 | ~0,6 B | 25 | 11,41 % | CC-BY-4.0 | ONNX int8 (sherpa-onnx) |
| nvidia/parakeet-tdt-0.6b-v3 | ~0,6 B | 25 | 14,41 % | no disponible en la información | NeMo |
| moondream/parakeet-ultra | ~0,6 B | 25 | no disponible | no disponible en la información | transformers |

No se dispone de datos de otros modelos ASR comparables (por ejemplo, Whisper) en la información proporcionada.

## Limitaciones y advertencias

- El modelo es una conversión de formato y cuantización; no aporta mejoras sobre `moondream/parakeet-ultra` más allá de la propia cuantización int8.
- La única evaluación publicada se limita al ucraniano en FLEURS dev; no hay datos de WER para el resto de los 24 idiomas.
- No se documentan sesgos conocidos ni tasas de alucinación específicas; como todo modelo ASR, puede producir transcripciones plausibles pero incorrectas en audio ruidoso o con acentos no vistos.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero conviene verificar las condiciones del modelo base de NVIDIA y del post-entrenamiento de moondream, cuya licencia no se detalla en la información disponible.
- El autor del repositorio no es el desarrollador original del modelo; la trazabilidad y el mantenimiento dependen de `stepsergius`.
- El rendimiento es ligeramente inferior en velocidad que v3 (93 s frente a 88 s en la misma prueba), un coste a tener en cuenta en aplicaciones en tiempo real.
- No hay información sobre longitud máxima de audio soportada ni sobre el comportamiento en audio de larga duración.

## Enlaces

- [Hugging Face: stepsergius/parakeet-ultra-uk-int8](https://huggingface.co/stepsergius/parakeet-ultra-uk-int8)
- [Modelo base: moondream/parakeet-ultra](https://huggingface.co/moondream/parakeet-ultra)
- [Modelo original: nvidia/parakeet-tdt-0.6b-v3](https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3)
- [Repositorio sherpa-onnx](https://github.com/k2-fsa/sherpa-onnx)
