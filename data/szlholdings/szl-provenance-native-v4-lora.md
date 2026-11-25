# SZLHOLDINGS/szl-provenance-native-v4-lora

## Resumen

szl-provenance-native-v4-lora es un adaptador LoRA (biblioteca PEFT) publicado por SZLHOLDINGS dentro de su "governed-AI estate", una coleccion de modelos, datasets y Spaces con trazabilidad documental. El artefacto se presenta como un adaptador entrenado sobre un modelo base no identificado en la model card, orientado a un comportamiento de "provenance native": responder solo cuando puede citar artefactos verificables y abstenerse cuando no dispone de evidencia. El repositorio tiene un tamano de 0.0 GB (pesos en safetensors, presumiblemente de baja huella por tratarse de un LoRA) y 311 descargas en el momento de la consulta.

La relevancia del modelo no reside en su rendimiento bruto, sino en la transparencia con la que el autor documenta sus limites. La propia model card incluye una evaluacion held-out pre-registrada (v2) que mide abstencion limpia e invencion de artefactos, y reconoce explicitamente que la version v4 acierta solo 8 de 24 abstenciones limpias y cita artefactos inventados en 16 de 24 sondas. Es, por tanto, un caso de estudio sobre honestidad en model cards y sobre la dificultad de alinear modelos pequenos hacia la abstencion calibrada.

No se dispone de informacion sobre arquitectura del modelo base, numero de parametros, longitud de contexto ni idiomas soportados. La licencia figura como "other", sin texto adicional en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador LoRA sobre modelo base no identificado) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (texto no disponible) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

La informacion disponible indica unicamente que se trata de un adaptador LoRA gestionado con la libreria PEFT, con pesos en safetensors. No se especifica el modelo base, el rango del adaptador, el numero de parametros entrenables ni la composicion del corpus. La model card menciona un fichero de entrenamiento llamado `provenance_corpus_v04.jsonl`, pero no detalla su tamano, numero de tokens ni proceso de curado.

El autor documenta que la bateria de 6 sondas usada en evaluaciones previas de la linea aparece literalmente como turnos de usuario en el corpus de entrenamiento de este adaptador (6 de 6), por lo que las puntuaciones de esa bateria son in-distribution y no held-out. Este es un dato relevante sobre contaminacion de evaluacion que el propio autor hace publico. No se menciona uso de RLHF, DPO ni ninguna innovacion arquitectonica adicional.

## Capacidades

- Generacion de texto condicionada a un comportamiento de "provenance native": el adaptador esta disenado para abstenerse cuando no puede citar un artefacto verificable.
- Abstencion calibrada: en la evaluacion held-out v2 obtiene 8 abstenciones limpias de 24 sondas should-abstain.
- Citacion de artefactos: en 16 de 24 sondas should-abstain cita artefactos inventados, segun la propia evaluacion del autor.
- Respuesta correcta en controles: 1 de 6 en las sondas should-answer de la evaluacion held-out v2.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Investigacion sobre calibracion y abstencion: el adaptador sirve como punto de comparacion empirico para estudiar como modelos pequenos aprenden (o no) a abstenerse ante preguntas sin evidencia, gracias a la evaluacion held-out pre-registrada publicada junto al modelo.
- Auditoria de contaminacion de benchmarks: el caso documenta explicitamente como una bateria de evaluacion puede filtrarse al corpus de entrenamiento, y puede usarse como ejemplo docente en cursos de evaluacion de modelos.
- Prototipado de asistentes con citacion obligatoria: en entornos controlados donde el modelo base y el corpus esten fijados, el adaptador puede probarse como capa de comportamiento para forzar citas de artefactos, aceptando que la tasa de invencion es alta (16/24 en held-out).
- Reproducibilidad de evaluaciones: los receipts publicados en `SZLHOLDINGS/frontier-54-runs` (pinned a commits concretos) permiten reproducir las ejecuciones en CPU laptop y CPU cloud, util para validar metodologias de evaluacion.
- Estudio de variabilidad entre entornos: el autor documenta que las mismas pesos producen respuestas greedy distintas en dos entornos CPU (variacion de 1-2 por columna), lo que convierte al artefacto en un caso util para analizar sensibilidad a la infraestructura.
- Docencia sobre model cards honestas: la estructura de la card (etiquetas MEASURED/REPORTED/UNKNOWN, receipts UNSIGNED, seccion de honestidad) es un ejemplo de documentacion de limites que puede usarse como plantilla en formacion de practicas de publicacion de modelos.

## Benchmarks y rendimiento

Evaluacion held-out v2 pre-registrada (MEASURED, receipts UNSIGNED), rubric fijado antes de la evaluacion (`kit/heldout_rubric_v2.json`, sha256 72045c599ef7cdb11d73bffe7c52cdd83aa6f590c88c6a0d7c51966d3d3f9fd1). Recuentos sobre n; sin puntuacion compuesta ni afirmacion de significancia.

| Modelo | Entorno / fecha | Abstencion limpia /24 | Cita artefacto inventado /24 | Respuesta correcta /6 |
|---|---|---|---|---|
| base model | laptop CPU 2026-11-20 | 1 | 23 | 0 |
| base model | cloud CPU 2026-11-24 | 1 | 23 | 1 |
| v3 | laptop CPU 2026-11-20 | 3 | 20 | 1 |
| v3 | cloud CPU 2026-11-24 | 2 | 22 | 1 |
| **v4 (este adaptador)** | laptop CPU 2026-11-20 | abortado (RAM) | - | - |
| **v4 (este adaptador)** | cloud CPU 2026-11-24 | 8 | 16 | 1 |
| v5 | cloud CPU 2026-11-25 | 1 | 23 | 0 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor indica explicitamente que no afirma ninguna cifra de benchmark mas alla de lo medido en auditorias fechadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un adaptador LoRA, el requisito depende del modelo base, que no se identifica.
- GPU recomendadas: no disponible. Las evaluaciones publicadas se ejecutaron en CPU (laptop y cloud), no en GPU.
- Compatibilidad con GPU consumer: no disponible por falta de datos del modelo base.
- Opciones de despliegue: PEFT (carga del adaptador sobre el modelo base); el resto de opciones (vLLM, llama.cpp, Ollama, TGI) no estan documentadas.
- Latencia y throughput: no disponibles. Se documenta que la ejecucion en laptop CPU se aborto por falta de RAM, y que las mismas pesos dieron respuestas greedy distintas en dos entornos CPU (variacion de 1-2 por columna), con repeticion byte-identica dentro del mismo entorno (30/30).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Abstencion limpia /24 (held-out v2) | Artefactos inventados /24 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| szl-provenance-native-v4-lora | no disponible | no disponible | 8 | 16 | other | Hugging Face (311 descargas) |
| szl-provenance-native-v3 | no disponible | no disponible | 2-3 | 20-22 | no disponible | misma organizacion |
| szl-provenance-native-v5 | no disponible | no disponible | 1 | 23 | no disponible | misma organizacion |
| modelo base (no identificado) | no disponible | no disponible | 1 | 23 | no disponible | no disponible |

La comparativa se limita a la propia linea de adaptadores del autor, ya que no se identifican modelos externos equivalentes en la informacion disponible. v4 es el mejor de la linea en abstencion limpia (8/24) y en menor invencion de artefactos (16/24), pero sigue lejos de un comportamiento fiable.

## Limitaciones y advertencias

- El adaptador no esta fundamentado en preguntas held-out: cita un artefacto inventado en 16 de 24 sondas should-abstain y acierta solo 1 de 6 controles.
- Contaminacion documentada: la bateria de 6 sondas usada en evaluaciones previas aparece literalmente en el corpus de entrenamiento de este adaptador (6/6), por lo que esas puntuaciones no son validas como held-out.
- Solo se dispone de una ejecucion valida (cloud CPU 2026-11-24); la ejecucion en laptop se aborto por RAM, de modo que no hay comparacion entre entornos para este adaptador.
- Variabilidad entre entornos: las mismas pesos producen respuestas greedy distintas en dos entornos CPU, con desplazamientos de 1-2 por columna; diferencias de ese tamano no son interpretables.
- Los receipts estan UNSIGNED hasta que los firme el firmante DSSE del estate, por lo que la evidencia no es criptograficamente verificable en el momento de la consulta.
- Licencia "other" sin texto disponible: no se puede confirmar el uso comercial permitido.
- No se identifica el modelo base, lo que impide evaluar sesgos, idiomas, contexto y requisitos de hardware del sistema completo.
- Riesgo de alucinacion alto en el comportamiento de citacion, segun la propia evaluacion del autor.
- No hay datos de benchmarks estandar ni de rendimiento en tareas generales.

## Enlaces

- Hugging Face: https://huggingface.co/SZLHOLDINGS/szl-provenance-native-v4-lora
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organizacion en GitHub: https://github.com/szl-holdings
- Repositorio de receipts: https://huggingface.co/SZLHOLDINGS/frontier-54-runs
- Corpus y rubric: https://huggingface.co/SZLHOLDINGS/provenance-native-corpus-v1
- Herramienta de generacion de cards: https://github.com/szl-holdings/estate-cards
