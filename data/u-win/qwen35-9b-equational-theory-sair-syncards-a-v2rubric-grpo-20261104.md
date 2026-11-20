# U-WIN/qwen35-9b-equational-theory-sair-syncards-a-v2rubric-grpo-20261104

## Resumen

El modelo `U-WIN/qwen35-9b-equational-theory-sair-syncards-a-v2rubric-grpo-20261104` es un ajuste fino por aprendizaje por refuerzo (GRPO) sobre una inicialización Qwen3.5 de 9B, desarrollado por U-WIN. Su propósito es resolver problemas de teoría ecuacional (equational theory) formulados en lenguaje natural, un dominio matemático que requiere razonamiento simbólico y verificación de identidades algebraicas. El modelo parte del checkpoint `qwen35-9b-equational-theory-sair-syncards-a-notes50m-cards123-ntp-kl-0p01` y aplica un entrenamiento asíncrono con recompensas basadas en rúbricas evaluadas por un juez local congelado.

La arquitectura subyacente es un transformer multimodal (image-text-to-text) de la familia Qwen3.5, con 9.653.104.368 parámetros totales en formato bf16 y un peso de repositorio de 361 GB, lo que indica la presencia de múltiples checkpoints y pesos sin entrenar (torre visual y cabeza de predicción multi-token). El entrenamiento solo actualiza el modelo de lenguaje: 427 tensores entrenados frente a 348 heredados sin cambios del inicializador.

El modelo es relevante ahora porque documenta un pipeline completo de RL asíncrono con evaluación por rúbricas y juicio neutral de veredicto, una técnica emergente para alinear modelos en dominios donde la respuesta correcta no es trivial de verificar automáticamente. La licencia Apache 2.0 facilita su reutilización, aunque el dominio de especialización es muy acotado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), familia Qwen3.5 |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal de la familia Qwen3.5 con 9,65 mil millones de parámetros. Solo se entrena el modelo de lenguaje: la torre visual (`model.visual.*`) y la cabeza de predicción multi-token (`mtp.*`) se copian sin cambios del inicializador, y los shards correspondientes se nombran `model-untrained-*`. El entrenamiento se realizó en un nodo HAI B200 con 3 GPUs de entrenador, 3 de rollout y 2 de juez, mediante GRPO totalmente asíncrono (ejecución `lean2nl-megatron-async-s3j2t3-v2rubric-v3-20261104`).

Los prompts provienen del dataset `U-WIN/equational-theory-lean2nl-references-gpt-approved-v2-rubric` (2182 problemas, todos con etiqueta TRUE, 54 con portador finito). La evaluación usa `U-WIN/sair-stage2-nl-verified-v2-rubric` (205 problemas, 99 TRUE / 106 FALSE), con 4 muestras por problema cada 20 rollouts. La recompensa se calcula mediante calificación por rúbricas de un juez local congelado Qwen3.8-27B (política `v2rubric-verdict-neutral-user-rubric-20261104-v3`): salida JSON de dos campos (`assessment`, `score_0_to_7`), recompensa = score/7, sin mostrar solución de referencia ni etiqueta de verdad al juez. El muestreo usa temperatura 1.0 y 32.768 tokens de respuesta, con GRPO y filtrado de grupo de calificaciones no resueltas. Cada actualización consume un rollout de 24 prompts × 8 muestras (lote global 192).

## Capacidades

- Generación de texto y razonamiento matemático en el dominio de teoría ecuacional.
- Resolución de problemas formulados en lenguaje natural con verificación de identidades algebraicas.
- Capacidad multimodal heredada (image-text-to-text) por la torre visual, aunque no se entrena en este ajuste.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible explícitamente; el formato de respuesta es JSON de dos campos.
- Capacidades multilingües: no disponible.
- Modo thinking: no disponible.
- Predicción multi-token (cabeza MTP) presente pero no entrenada en este ajuste.

## Casos de uso

- Verificación de identidades algebraicas: el modelo recibe un problema de teoría ecuacional en lenguaje natural y emite una evaluación estructurada en JSON (`assessment`, `score_0_to_7`), útil como componente de un pipeline de corrección automática en entornos educativos o de investigación.
- Generación de contraejemplos en teoría de variedades: al haberse entrenado con problemas TRUE y evaluado con problemas FALSE, puede emplearse para detectar enunciados incorrectos en conjuntos de ejercicios, señalando por qué una identidad no se cumple.
- Asistencia a investigadores en álgebra universal: como generador de borradores de demostración o de explicaciones en lenguaje natural que luego se validan manualmente contra un comprobador formal (Lean).
- Etiquetado y curación de datasets matemáticos: el modelo puede puntuar pares problema-respuesta y priorizar los casos dudosos para revisión humana, gracias a su salida de puntuación granular de 0 a 7.
- Evaluación comparativa de jueces automáticos: sirve como referencia de un pipeline de RL con juez neutral de veredicto, útil para estudiar sesgos de jueces LLM en dominios formales.
- Filtrado de candidatos en generación aumentada por recuperación: dado un conjunto de soluciones propuestas, el modelo puntúa cada una y permite descartar las de baja calidad antes de pasarlas a un verificador simbólico.
- Investigación en RL asíncrono: los checkpoints por iteración (10 a 200) permiten analizar la evolución del aprendizaje y la dinámica de recompensas en un dominio especializado.

## Benchmarks y rendimiento

Los únicos datos publicados son la evaluación interna durante el entrenamiento sobre `sair-stage2-nl-verified-v2-rubric` (205 problemas × 4 muestras, puntuación sobre 7):

| Rollout | Global | Problemas TRUE | Problemas FALSE |
|---|---|---|---|
| 0 | 0,420 | 0,560 | 0,288 |
| 20 | 0,469 | 0,592 | 0,354 |
| 40 | 0,465 | 0,607 | 0,333 |
| 60 | 0,460 | 0,652 | 0,282 |
| 80 | 0,497 | 0,676 | 0,329 |
| 100 | 0,497 | 0,686 | 0,320 |
| 120 | 0,505 | 0,736 | 0,289 |
| 140 | 0,527 | 0,748 | 0,321 |
| 160 | 0,487 | 0,718 | 0,271 |
| 180 | 0,492 | 0,767 | 0,235 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 19,3 GB solo para pesos (9,65 mil millones de parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica se recomiendan 24 GB o más.
- Cuantización a 8 bits: alrededor de 9,7 GB de pesos; a 4 bits: alrededor de 4,8 GB, aunque no se documentan ficheros GGUF ni cuantizaciones publicadas.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o B200 para entrenamiento e inferencia a gran escala; RTX 4090 (24 GB) puede alojar los pesos en bf16 con contexto corto, pero el contexto largo y el modo multimodal requieren más memoria.
- Cabe en GPU de consumo: sí, en RTX 4090 o RTX 3090 (24 GB) con contexto moderado; en GPUs de 16 GB solo mediante cuantización, que no está publicada.
- Opciones de despliegue: transformers (librería declarada); vLLM, llama.cpp, Ollama o TGI no están confirmados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| U-WIN/qwen35-9b-equational-theory-sair-syncards-a-v2rubric-grpo-20261104 | 9,65 B | no disponible | Teoría ecuacional (RL con rúbricas) | Apache 2.0 | Hugging Face |
| U-WIN/qwen35-9b-equational-theory-sair-syncards-a-notes50m-cards123-ntp-kl-0p01 (inicializador) | 9,65 B | no disponible | Teoría ecuacional (preentrenamiento/ajuste previo) | no disponible | Hugging Face |
| Qwen3.5-9B base (familia) | ~9 B | no disponible | Propósito general multimodal | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Dominio extremadamente especializado: el ajuste se centra en teoría ecuacional; su rendimiento fuera de ese ámbito no está documentado y probablemente sea inferior al del modelo base.
- Riesgo de alucinación en demostraciones matemáticas: el juez de recompensa es un LLM (Qwen3.8-27B) y no un verificador formal, por lo que las puntuaciones altas no garantizan corrección lógica.
- Desbalance en la evaluación: los problemas FALSE obtienen puntuaciones notablemente más bajas (0,235–0,354) que los TRUE (0,560–0,767), lo que sugiere dificultad para rechazar enunciados incorrectos.
- Solo se entrena el modelo de lenguaje; la torre visual y la cabeza MTP se heredan sin ajuste, por lo que su comportamiento multimodal no está validado en este checkpoint.
- Idiomas soportados no documentados; no se garantiza un rendimiento adecuado en castellano.
- El repositorio ocupa 361 GB e incluye 20 ramas de checkpoint; el uso en producción requiere seleccionar una rama concreta y verificar el `conversion_manifest.json`.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5 puede tener condiciones adicionales que deben verificarse.
- No se documentan cuantizaciones oficiales ni resultados de benchmarks estándar, lo que dificulta la comparación con alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/U-WIN/qwen35-9b-equational-theory-sair-syncards-a-v2rubric-grpo-20261104
- Modelo inicializador: https://huggingface.co/U-WIN/qwen35-9b-equational-theory-sair-syncards-a-notes50m-cards123-ntp-kl-0p01
- Dataset de prompts: `U-WIN/equational-theory-lean2nl-references-gpt-approved-v2-rubric` (referencia @ fd284c793204)
- Dataset de evaluación: `U-WIN/sair-stage2-nl-verified-v2-rubric` (referencia @ ed7fb4630dfe)
- Herramienta de conversión: `miles-upstream/tools/convert_torch_dist_to_hf.py`
