# vezilka-ai/vezilka-moonshine-base-mk

## Resumen

Vezilka Moonshine Base (Macedonian) es un ajuste fino completo de UsefulSensors/moonshine-base, un modelo de reconocimiento automatico del habla (ASR) de 61,5 millones de parametros, especializado en macedonio. Lo desarrolla vezilka-ai en el marco del proyecto VEZILKA, apoyado por el Ministerio de Educacion y Ciencia de Macedonia del Norte y cofinanciado por la Comision Europea a traves de EuroHPC JU. El modelo resuelve un problema concreto: la escasez de sistemas ASR de calidad para una lengua eslava meridional con recursos limitados.

La arquitectura subyacente es Moonshine, un encoder-decoder que procesa directamente la forma de onda a 16 kHz en lugar de trabajar sobre espectrogramas de longitud fija, de modo que el coste computacional escala con la duracion real del audio. El ajuste se realizo sobre el checkpoint del paso 244.000 de un entrenamiento planificado de 284.226 pasos, con una tasa de aprendizaje maxima de 5e-4 y 3 epocas sobre una mezcla de datos que combina clases universitarias, sesiones parlamentarias, audiolibros, donaciones ciudadanas y los subconjuntos en macedonio de Common Voice y FLEURS.

Es relevante ahora porque demuestra que un modelo de 61,5 M de parametros, con licencia Apache-2.0 y un repositorio de solo 0,2 GB, puede alcanzar un WER del 10,21 % en un benchmark de clases tecnicas con referencias revisadas manualmente. Eso lo sitúa en el rango de despliegue en CPU y dispositivos con recursos muy limitados, algo poco habitual en ASR de calidad para lenguas de bajos recursos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Moonshine (encoder-decoder sobre forma de onda, base) |
| Parametros totales | 61.513.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; el decoder tiene 194 posiciones (generacion recomendada <= 192 tokens) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | macedonio (mk) |
| Licencia | Apache-2.0 (modelo base bajo MIT) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo (full fine-tune) de UsefulSensors/moonshine-base, un transformer encoder-decoder disenado para ASR que consume la forma de onda cruda a 16 kHz. A diferencia de los pipelines clasicos basados en log-Mel, Moonshine calcula directamente sobre la senal temporal, lo que hace que el coste de computo dependa de la duracion del clip y no de un recorte fijo. El decoder dispone de 194 posiciones, por lo que el autor recomienda limitar la generacion a 192 tokens como maximo.

El entrenamiento consistio en 3 epocas con un 1 % de warm-up y una tasa de aprendizaje maxima de 5e-4, detenido en el paso 244.000 de los 284.226 planificados. La mezcla de datos incluye la exportacion de la coleccion Vezilka-ASRI (clases de FINKI, sesiones parlamentarias y audiolibros de NSSRM con transcripciones automaticas), donaciones aceptadas del programa Doniraj (envio submissions-20260831), conjuntos de transcripciones de YouTube y television del proyecto (videa_so_transkript_od_yt, alfa_audios, sitel_audios), un conjunto de jerga tecnica y los subconjuntos en macedonio de Mozilla Common Voice (CC0-1.0) y Google FLEURS (CC-BY-4.0). No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Reconocimiento automatico del habla en macedonio sobre audio a 16 kHz en formato de forma de onda.
- Transcripcion de audio de duracion variable con coste proporcional a la longitud del clip.
- Manejo de vocabulario tecnico y academico, gracias al conjunto de jerga y a las clases de FINKI incluidas en el entrenamiento.
- Robustez ante dominios diversos: discurso parlamentario, audiolibros, contenido de YouTube y television, y habla espontanea de donaciones ciudadanas.
- Integracion directa con el pipeline `automatic-speech-recognition` de transformers.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible` en el repositorio).
- No se documentan capacidades de tool calling, agentes, vision, audio generativo ni modo de razonamiento extendido.

## Casos de uso

- Transcripcion de clases universitarias: el modelo se entrena explicitamente con clases de FINKI y logra un WER del 10,21 % en el benchmark de cinco clases reservadas, por lo que es adecuado para generar apuntes y subtitulos de docencia tecnica en macedonio.
- Subtitulado de contenido audiovisual: los conjuntos de YouTube y television del entrenamiento lo hacen apropiado para generar subtitulos automaticos de videos y emisiones en macedonio, con la ventaja de que el coste escala con la duracion real del clip.
- Actas parlamentarias y transcripcion institucional: la inclusion de sesiones parlamentarias en la mezcla de entrenamiento lo orienta a la transcripcion de sesiones plenarias y reuniones oficiales, donde el vocabulario formal y la diccion estandar son frecuentes.
- Audiolibros y accesibilidad: las transcripciones de audiolibros de NSSRM permiten usar el modelo para convertir audiolibros en macedonio a texto, facilitando indices de busqueda y versiones accesibles.
- Despliegue en entornos con recursos limitados: con 61,5 M de parametros y un repositorio de 0,2 GB, el modelo puede ejecutarse en CPU o en GPUs de gama baja, lo que lo hace viable para servicios municipales, ONG o centros educativos sin infraestructura dedicada.
- Investigacion en lenguas de bajos recursos: sirve como linea base reproducible para experimentos de ASR en macedonio, con un benchmark publico y referencias revisadas manualmente que permiten comparaciones controladas.
- Procesamiento por lotes de archivo sonoro: la API de pipeline de transformers y la compatibilidad con endpoints permiten integrarlo en flujos de transcripcion masiva de archivos historicos o donaciones ciudadanas.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados de forma independiente). Benchmark: Vezilka FINKI Lecture ASR Benchmark, configuracion `finki-benchmark` del dataset vezilka-ai/macedonian-speech, split test. Metricas normalizadas en % (NFC, minusculas, sin puntuacion), CUDA, float32, batch 1, beam 4.

| Vista | Clips | WER | CER | S | I | D |
|---|---:|---:|---:|---:|---:|---:|
| full | 1.406 | 10,21 | 3,94 | 3.447 | 1.115 | 945 |
| speaker_balanced | 892 | 9,20 | 3,48 | 2.012 | 629 | 510 |

No se han publicado en la informacion disponible resultados en benchmarks estandar como MMLU, HumanEval o GSM8K, que ademas no aplican a una tarea de ASR. Tampoco se proporcionan comparaciones numericas con otros modelos ASR en macedonio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 61,5 M de parametros en float32 el peso ronda los 0,25 GB, y en float16 aproximadamente 0,12 GB, a lo que hay que sumar el estado de activaciones y el audio de entrada.
- GPU recomendadas: no se especifican en la informacion proporcionada. Por tamano, el modelo es apto para GPUs de consumo como RTX 3060, RTX 4060 o superiores, e incluso para GPUs de portatil con memoria modesta.
- Cabe en GPU de consumo: si, con amplio margen, dado el reducido numero de parametros y el repositorio de 0,2 GB.
- Opciones de despliegue: pipeline de transformers (documentado por el autor), endpoints compatibles; no se confirma soporte de vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput estimados: no disponibles. El autor solo indica que el coste escala con la duracion del clip porque el modelo lee la forma de onda a 16 kHz, y que la generacion debe limitarse a 192 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | WER declarado | Disponibilidad |
|---|---|---|---|---|---|---|
| vezilka-moonshine-base-mk | 61,5 M | decoder de 194 posiciones | macedonio | Apache-2.0 | 10,21 % (FINKI full) | HuggingFace, transformers |
| UsefulSensors/moonshine-base (base) | 61,5 M | decoder de 194 posiciones | ingles (principal) | MIT | no disponible para macedonio | HuggingFace |
| Whisper (variantes pequenas) | no disponible en la informacion | no disponible | multilingue | MIT | no disponible para macedonio | HuggingFace, OpenAI |

La comparacion se limita al modelo base del que deriva, ya que la informacion proporcionada no incluye resultados de otros sistemas ASR en macedonio ni sus especificaciones. No hay datos que permitan afirmar superioridad o inferioridad frente a alternativas multilingues en este idioma.

## Limitaciones y advertencias

- Cobertura limitada a un unico idioma: solo macedonio; no se documenta soporte de code-switching ni de otras lenguas.
- Riesgo de alucinacion y de errores de sustitucion: el benchmark muestra 1.115 sustituciones, 945 deleciones y 3.447 aciertos en la vista full, lo que indica que persisten errores en terminos tecnicos y nombres propios.
- Entrenamiento parcial: el ajuste se detuvo en el paso 244.000 de 284.226, por lo que el modelo no completo el plan de entrenamiento previsto.
- Dependencia de transcripciones automaticas: buena parte de la mezcla de entrenamiento (Vezilka-ASRI, YouTube, television) usa transcripciones automaticas, lo que puede propagar errores sistematicos.
- Limite de generacion: el decoder tiene 194 posiciones y el autor recomienda no superar los 192 tokens, lo que restringe la transcripcion de clips muy largos en una sola pasada.
- Licencia: Apache-2.0 permite uso comercial, pero el modelo base es MIT y las condiciones de los datasets de origen (Common Voice CC0-1.0, FLEURS CC-BY-4.0, donaciones ciudadanas) deben revisarse para usos derivados.
- Resultados no verificados: las metricas del model-index estan marcadas como `verified: false` y el articulo de datos que las respalda esta en revision.
- Sin datos publicados sobre sesgos demograficos, de acento o de genero; conviene evaluar en el dominio concreto antes de produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vezilka-ai/vezilka-moonshine-base-mk
- Modelo base: https://huggingface.co/UsefulSensors/moonshine-base
- Dataset de evaluacion y entrenamiento: https://huggingface.co/datasets/vezilka-ai/macedonian-speech
- Google FLEURS: https://huggingface.co/datasets/google/fleurs
- Proyecto VEZILKA (Grant Agreement No. 101263128): no disponible en la informacion proporcionada
- Articulo de datos (Gajdov, Karamachoski, Stojcheva, Mishkovski y Mishev): en revision, sin enlace disponible
