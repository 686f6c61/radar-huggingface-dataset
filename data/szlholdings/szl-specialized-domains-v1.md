# SZLHOLDINGS/SZL-Specialized-Domains-v1

## Resumen

SZL-Specialized-Domains-v1 es un ajuste fino (fine-tune) de tipo SFT publicado por SZLHOLDINGS sobre el modelo base SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-sft-v3, a su vez derivado de la familia Qwen 3.5 con aproximadamente 873 millones de parámetros. El modelo se ha entrenado con QLoRA sobre un corpus propio de dominios especializados (`SZLHOLDINGS/specialized-domains-corpus-v1`, 117 ejemplos) que cubre cinco sistemas internos del autor: NEXUS (dinámica analógica), IMMUNE (recibos y gobernanza), szl-skills, szl-serve y validación acústica.

Se trata de un modelo pequeño, orientado a texto y a tareas muy concretas del ecosistema del autor, no de un modelo generalista. La relevancia es limitada para el público general: el propio autor declara explícitamente que no se ha ejecutado ninguna evaluación (`NOT_RUN`), no se han publicado benchmarks y no se hacen afirmaciones de capacidad. La model card lo describe como no apto para producción (`not production-eligible`) y sin endpoint que lo sirva.

La arquitectura declarada en los tags es `qwen3_5`, con pipeline `text-generation` y licencia Apache 2.0. El repositorio ocupa 1,8 GB en formato safetensors, lo que es coherente con un modelo de ~0,87B parámetros en precisión de 16 bits.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen 3.5 (según tag `qwen3_5`); detalles internos no disponibles |
| Parámetros totales | 873.438.784 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (repo publicado en safetensors; el autor menciona QLoRA en entrenamiento, no cuantizaciones de inferencia) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-sft-v3 y se ha ajustado mediante QLoRA SFT usando Unsloth y TRL sobre una GPU NVIDIA A6000 en Massed Compute, con fusión posterior y publicación en 16 bits. El corpus de entrenamiento es `SZLHOLDINGS/specialized-domains-corpus-v1`, con 117 ejemplos que cubren cinco sistemas del autor (NEXUS, IMMUNE, szl-skills, szl-serve y validación acústica). El autor etiqueta la ola de entrenamiento como `szl-specialized-domains-w22` y reporta `WAVE_EXITED_RC=0`.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset, ni si se aplicaron fases de RLHF o DPO. Tampoco se detallan innovaciones arquitectónicas propias: el modelo hereda la arquitectura del base y solo se modifica mediante el ajuste supervisado. La información sobre la arquitectura interna de Qwen 3.5 (atención, normalización, etc.) no está incluida en la model card.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base.
- Ajuste orientado a dominios internos del autor: NEXUS (dinámica analógica), IMMUNE (recibos y gobernanza), szl-skills, szl-serve y validación acústica.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el autor no hace afirmaciones de capacidad.
- Capacidades multilingües: solo se declara inglés (`en`).
- Capacidades especiales (thinking mode, visión, audio): no disponibles. Los tags incluyen `image-text-to-text`, pero la model card no describe ni valida capacidades de visión.
- Estado de evaluación: `NOT_RUN`; no hay métricas de calidad publicadas.

## Casos de uso

- Procesamiento de recibos y gobernanza interna: el ajuste incluye el sistema IMMUNE, por lo que puede emplearse para tareas de extracción y clasificación de recibos dentro del ecosistema del autor, siempre con validación determinista posterior.
- Consultas sobre dinámica analógica en el sistema NEXUS: útil como asistente de dominio cerrado para responder preguntas sobre parámetros y conceptos de ese sistema, con revisión humana.
- Soporte a herramientas internas de szl-skills y szl-serve: puede generar borradores de respuestas o documentación para estas herramientas, dado que forman parte del corpus de entrenamiento.
- Validación acústica asistida: generación de descripciones o resúmenes de resultados de validación acústica dentro del pipeline del autor.
- Prototipado de asistentes de dominio muy específico: sirve como base para experimentar con SFT sobre corpus pequeños y verificar el flujo QLoRA + Unsloth + TRL antes de escalar a modelos mayores.
- Evaluación de doctrina de uso honesto: el modelo está pensado para tratarse como "propuesta no confiable"; puede usarse en entornos de investigación para probar pipelines que exijan un controlador determinista y aprobación humana antes de cualquier acción consecuente.
- No se recomienda su uso en atención al cliente general, generación de código en producción ni tareas multilingües, dado que no hay evaluación ni cobertura declarada para ello.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente `Evaluation status: NOT_RUN` y declara que no se hacen afirmaciones de capacidad.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,8 GB en FP16 (coherente con 873M parámetros y repo de 1,8 GB); en cuantizaciones de 8 bits o 4 bits sería inferior, aunque el autor no publica versiones GGUF ni cuantizadas.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM debería poder cargar el modelo en FP16; una RTX 3060, RTX 4060 o superior es suficiente. Para entrenamiento, el autor usó una NVIDIA A6000.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU consumer modernas con 4 GB o más.
- Opciones de despliegue: transformers (librería declarada); los tags mencionan `text-generation-inference` y `unsloth`, pero no se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Evaluación publicada | Disponibilidad |
|---|---|---|---|---|---|
| SZL-Specialized-Domains-v1 | 873M | no disponible | Apache 2.0 | No (`NOT_RUN`) | HuggingFace |
| Modelo base: szl-receiptagent-qwen35-0.8b-sft-v3 | ~0,8B (por nombre) | no disponible | no disponible | no disponible | HuggingFace |
| Qwen 3.5 0.8B (familia de referencia) | ~0,8B | no disponible | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Corpus de entrenamiento muy pequeño (117 ejemplos): cobertura de dominio estrecha y alto riesgo de sobreajuste.
- Sin entrenamiento de contrapeso para abstención en esta ola: el modelo puede responder con seguridad a preguntas fuera de su dominio.
- Sin medición de alucinación ni de confabulación.
- Sin evaluación retenida ni benchmarks: cualquier afirmación de calidad carece de respaldo empírico.
- El autor lo declara no apto para producción y sin endpoint x402 que lo sirva.
- Solo se declara inglés; no hay soporte multilingüe verificado.
- Doctrina de uso honesto del autor: la salida debe tratarse como propuesta no confiable y pasar por un controlador determinista y una aprobación humana antes de cualquier acción consecuente.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación y las limitaciones anteriores desaconsejan su uso en producción sin validación adicional.
- El tag `image-text-to-text` no está respaldado por una descripción o validación de capacidades de visión en la model card.

## Enlaces

- HuggingFace: https://huggingface.co/SZLHOLDINGS/SZL-Specialized-Domains-v1
- Modelo base: https://huggingface.co/SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-sft-v3
- Dataset: `SZLHOLDINGS/specialized-domains-corpus-v1` (referenciado en la model card; URL no incluida)
- Logs de la ola: `SZLHOLDINGS/wave-logs` (referenciado en la model card; URL no incluida)
- Recibos de evaluación: `SZLHOLDINGS/model-eval-receipts` (referenciado en la model card; URL no incluida)
