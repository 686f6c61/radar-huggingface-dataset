# Thox-ai/ThoxOS-Kernel-0.8B

## Resumen

ThoxOS-Kernel-0.8B es un modelo de lenguaje de 0,8B parámetros desarrollado por Thox-ai (THOX.ai) como "estudiante" de triaje de kernel y sistema operativo. Se trata de un fine-tune con LoRA de precisión completa (fp-LoRA) sobre Qwen/Qwen3.5-0.8B, destilado a partir del modelo profesor ThoxOS-Kernel-27B y fusionado en los pesos base. Su propósito es clasificar y enrutar peticiones relacionadas con el sistema operativo y el kernel, ejecutar diagnósticos de primera línea, responder preguntas fundamentadas sobre runbooks y escalar todo lo que exceda el triaje a modelos pares o al modelo de nivel host mediante MeshStack.

El modelo está dimensionado para ejecutarse en dispositivos de borde de la familia THOX (ThoxAir y el paquete host ThoxKey) y se distribuye con pesos en safetensors y cuantizaciones GGUF (Q4_K_M, Q8_0 y Q4_0), además de empaquetado para Ollama. Su principio de diseño es explícito: el modelo propone, pero el arnés (harness) dispone; nunca ejecuta acciones del sistema directamente.

La relevancia actual radica en su enfoque de despliegue en borde con licencia Apache 2.0 y acceso público sin restricciones, orientado a agentes de sistema operativo de bajo consumo. No obstante, la model card reporta una divergencia de medición no resuelta en sus resultados de evaluación (37/49 frente a 27/49 en GATE49), lo que conviene tener en cuenta al evaluar su fiabilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tune de Qwen/Qwen3.5-0.8B, tag `qwen3_5_text`) |
| Parametros totales | 752.393.024 (0,75B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M, Q8_0, Q4_0; safetensors en precisión original |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura transformer de Qwen/Qwen3.5-0.8B y se obtiene mediante un fine-tune con LoRA de precisión completa (fp-LoRA) fusionado posteriormente en los pesos base. El entrenamiento lo realizó THOX internamente, incluyendo la conversión a GGUF. La destilación se llevó a cabo a partir del modelo profesor ThoxOS-Kernel-27B, que había superado las puertas de calidad (gate-passed). Los datos provienen del corpus v3 de Thox-ai/thoxos-kernel-sft, compuesto por el corpus humano/derivado de kernel más trazas generadas por el profesor de 27B, admitidas únicamente tras aplicar filtros: ejecución en sandbox para las filas de comandos y comprobaciones de factualidad para la prosa.

No se dispone de información sobre el número total de tokens de entrenamiento, la composición detallada del dataset ni el uso de RLHF o DPO. La innovación técnica destacable es el esquema de destilación con filtrado por ejecución en sandbox y verificación factual, así como el diseño de "el modelo propone, el arnés dispone", que separa la inferencia del modelo de la ejecución real de acciones del sistema.

## Capacidades

- Clasificación y enrutamiento de peticiones relacionadas con el sistema operativo y el kernel.
- Diagnósticos de primera línea sobre problemas de sistema.
- Respuesta a preguntas fundamentadas sobre runbooks (procedimientos operativos).
- Escalado de casos que exceden el triaje a modelos pares (ThoxMini, ThoxClip) o al modelo de nivel host mediante MeshStack.
- Generación de texto conversacional y de tipo text-generation.
- Capacidad de agente de sistema operativo (os-agent) con separación estricta entre propuesta y ejecución.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Triaje de incidencias de sistema operativo: el modelo clasifica y enruta peticiones de soporte relacionadas con kernel y SO, derivando los casos complejos al modelo host de 27B mediante MeshStack.
- Diagnóstico de primera línea en dispositivos de borde: al ejecutarse en ThoxAir y ThoxKey, puede realizar comprobaciones iniciales de estado del sistema sin depender de la nube.
- Asistente de runbooks: responde preguntas fundamentadas sobre procedimientos operativos gracias a su entrenamiento sobre el corpus de kernel filtrado por factualidad.
- Agente de soporte en Ollama: su empaquetado y cuantización Q4_K_M (529 MB) permiten desplegarlo localmente con `ollama run Thox-ai/thoxos-kernel-0.8b` para asistencia técnica ligera.
- Filtro de escalado en pipelines de agentes: actúa como primera capa que decide si una consulta la puede resolver el propio modelo o debe escalarse a un modelo mayor, reduciendo coste de inferencia.
- Prototipado de agentes de sistema en investigación: su licencia Apache 2.0 y acceso público sin restricciones permiten experimentar con arquitecturas de agente OS sin ataduras de licencia.
- Despliegue en hardware de consumo: con cuantizaciones de 500-800 MB, puede integrarse en entornos con recursos muy limitados para tareas de triaje.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados de evaluación, con una divergencia de medición no resuelta:

| Evaluación | Resultado | Fecha | Notas |
|---|---|---|---|
| GATE49 | 37/49 | 2026-11-01 | Ejecución original de la puerta |
| GATE49 (ruta normalizada) | 27/49 | 2026-11-08 | Re-medición de los pesos publicados; divergencia bajo revisión |
| GATE-K | medido en la ejecución de 2026-11-01 | 2026-11-01 | Resultados reportados en la sección Evaluation |
| Sondas P16/P17 | medido en la ejecución de 2026-11-01 | 2026-11-01 | Resultados reportados en la sección Evaluation |
| OS-task bench | medido en la ejecución de 2026-11-01 | 2026-11-01 | Resultados reportados en la sección Evaluation |
| Postura de rechazo | medido en la ejecución de 2026-11-01 | 2026-11-01 | Escapes de acciones destructivas: cero en el conjunto de sondas |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. No se han publicado resultados de cualificación de dispositivos; el modelo no está cualificado en hardware ThoxAir.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5-0,8 GB con cuantizaciones GGUF (Q4_0: 501 MB, Q4_K_M: 529 MB, Q8_0: 812 MB); alrededor de 1,5 GB en safetensors a precisión original.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, cabe en cualquier GPU consumer moderna.
- Cabe en GPU de consumo: sí, dado su tamaño (0,75B parámetros) y sus cuantizaciones inferiores a 1 GB.
- Opciones de despliegue: Ollama (`ollama run Thox-ai/thoxos-kernel-0.8b`), llama.cpp (`llama-cli`), y descarga directa de GGUF vía `hf download`. Soporte de vLLM o TGI: no disponible en la información.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| ThoxOS-Kernel-0.8B | 0,75B | no disponible | Apache 2.0 | Triaje de kernel/SO destilado | Público, sin restricciones |
| Qwen/Qwen3.5-0.8B (base) | ~0,8B | no disponible | no disponible | Modelo base generalista | Público |
| ThoxOS-Kernel-27B (profesor) | 27B | no disponible | no disponible | Triaje de kernel/SO de nivel host | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparativa se limita a parámetros, licencia y enfoque.

## Limitaciones y advertencias

- Divergencia de medición no resuelta: GATE49 pasó de 37/49 a 27/49 en la re-medición normalizada de los mismos pesos publicados; el estado es "bajo revisión" en la planificación Phase 1 / K-Core.
- No cualificado en hardware ThoxAir: no se reclaman resultados de cualificación de dispositivos.
- Idioma: solo inglés según la model card; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Riesgo de alucinación: pese al filtrado por factualidad del corpus, no se reportan métricas de tasa de alucinación.
- Sesgos conocidos: no disponible en la información proporcionada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo hereda las condiciones del modelo base Qwen/Qwen3.5-0.8B, cuyos términos no se detallan.
- Seguridad operativa: el modelo nunca debe ejecutar acciones del sistema directamente; requiere un arnés que valide y ejecute las propuestas. Los escapes de acciones destructivas se reportaron como cero en el conjunto de sondas, pero no se especifica el alcance de dicho conjunto.
- Longitud de contexto no documentada: limita la planificación de casos de uso con contexto largo.
- Modelo de nicho: su utilidad está acotada al triaje de kernel/SO; no es un modelo generalista.

## Enlaces

- Hugging Face: https://huggingface.co/Thox-ai/ThoxOS-Kernel-0.8B
- Corpus de entrenamiento: https://huggingface.co/Thox-ai/thoxos-kernel-sft
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Modelo profesor (ThoxOS-Kernel-27B): no disponible como enlace directo en la información proporcionada
- Paper, blog o repositorio adicional: no disponible en la información proporcionada
