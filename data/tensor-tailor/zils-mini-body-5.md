# tensor-tailor/zils-mini-body-5

## Resumen

BIG-M es un modelo de decisión de tipo "decision body" desarrollado por el usuario de Hugging Face `tensor-tailor` para el pool de modelos Zils `d3-mini`, que opera en la subred 127 de Bittensor. Se trata de un fine-tune en dos etapas del cuerpo base `1lock/zils-mini-astrid-m1`, construido sobre la arquitectura Qwen3.5-4B (tensores de lenguaje y visión en bf16), con 4.539.265.536 parámetros totales y un tamaño de repositorio de 9,1 GB. Su propósito no es la generación de texto libre, sino la emisión de decisiones estructuradas (respuestas sí/no, elección entre opciones) sobre familias de preguntas concretas.

El modelo parte de una filosofía de entrenamiento orientada a la destilación de probabilidades: la primera etapa transfiere el conocimiento de cinco "cuerpos profesor" públicos mediante divergencia KL, y la segunda etapa refina con una combinación de entropía cruzada, score de Brier y regularización KL contra el checkpoint intermedio. El resultado es un modelo de 4B parámetros que prioriza la calibración de respuestas sobre la fluidez generativa.

Es relevante ahora porque ilustra un patrón emergente en el ecosistema Bittensor: modelos pequeños, altamente especializados y entrenados por mineros individuales para tareas de decisión acotadas, con licencia Apache-2.0 y pesos en safetensors. No obstante, sus métricas propias muestran un retroceso respecto a su punto de partida en varios conjuntos de desarrollo, lo que conviene tener en cuenta antes de adoptarlo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-4B, con capas Gated-DeltaNet en el bloque de lenguaje y torres de visión) |
| Parámetros totales | 4.539.265.536 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el entrenamiento limitó las filas a 2.048 tokens; la longitud máxima de inferencia no se declara) |
| Tipos de cuantización | No disponible (pesos publicados en bf16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | No disponible (los datasets de entrenamiento son mayoritariamente en inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (con `custom_code` y arquitectura `qwen3_5`) |

## Arquitectura y entrenamiento

El modelo reutiliza el chasis `d3-mini` de Zils, que corresponde a la arquitectura Qwen3.5-4B: 32 capas de lenguaje con proyecciones de atención y Gated-DeltaNet, más tensores de visión. El fine-tune se aplicó mediante LoRA sobre 152 matrices en la etapa 1 (atención y Gated-DeltaNet de las 32 capas) y sobre 248 matrices en la etapa 2 (añadiendo los MLP de las 32 capas). Ambos LoRA se fusionaron posteriormente a bf16.

La etapa 1 (denominada internamente "M7c-T2") usó LoRA de rango 16 y alpha 32, con dropout 0,05, learning rate 5e-5 con warm-up de 50 pasos y decaimiento coseno, batch 8 con acumulación 2, semilla 4343, una época sobre 49.136 filas. La pérdida combinó KL hacia las probabilidades de respuesta de cinco cuerpos profesor públicos (uno por familia de preguntas) más KL hacia las propias probabilidades de astrid-m1 sobre 12.448 filas de regularización con peso 2,0. El checkpoint resultante ("Dfin") sirvió de punto de partida para la etapa 2.

La etapa 2, que produce este cuerpo, empleó LoRA de rango 128 y alpha 256 sobre las 248 matrices mencionadas, dos épocas sobre 8.931 ítems más 2.977 filas de regularización (1.489 pasos de optimizador). La pérdida por ítem fue entropía cruzada sobre la clave más 1,0 × Brier más 0,1 × KL hacia Dfin (calculada en vivo con el LoRA desactivado). Los datos de la etapa 2 cubren ocho familias de preguntas (NLI sí/no, razonamiento sí/no, recuperación sí/no, elección ternaria NLI, veridicalidad, sentimiento, BoolQ y COPA), con filtros estrictos de solapamiento n-grama, duplicados y auditoría manual. El checkpoint publicado corresponde al 75 % de la segunda época (paso 1.117 de 1.489). La desviación relativa de los tensores de lenguaje respecto a Qwen/Qwen3.5-4B es de 0,03015, muy por debajo del límite de 0,15 que impone Zils.

## Capacidades

- Emisión de decisiones binarias (sí/no) y de elección múltiple sobre preguntas en formato de examen.
- Clasificación de inferencia de lenguaje natural (NLI) en modo sí/no y en elección de tres vías.
- Razonamiento físico y de sentido común (familias PIQA y COPA).
- Recuperación de respuestas a partir de contexto (QNLI, SQuAD 2.0).
- Verificación de hechos y veridicalidad (FEVER, MegaVeridicality).
- Análisis de sentimiento (polaridad de Amazon).
- Respuesta a preguntas booleanas (BoolQ).
- Capacidades de visión heredadas del chasis Qwen3.5-4B, aunque el entrenamiento documentado se centra en texto.
- No se documenta soporte explícito de tool calling ni de razonamiento multi-paso agéntico.
- No se documenta modo "thinking" ni capacidades de audio.

## Casos de uso

- Clasificación de tickets de soporte: el modelo puede decidir entre categorías cerradas (sí/no o elección ternaria) sobre texto de entrada, aprovechando su entrenamiento en NLI y BoolQ para enrutar consultas hacia el equipo adecuado.
- Verificación de afirmaciones en pipelines de contenido: dado un contexto y una afirmación, el modelo emite una decisión de veridicalidad, útil para moderación o control de calidad editorial.
- Filtrado de preguntas en sistemas de QA: con su capacidad de recuperación sí/no (QNLI), puede descartar pares pregunta-pasaje irrelevantes antes de invocar un modelo generativo mayor, reduciendo coste.
- Análisis de sentimiento en reseñas de producto: entrenado con polaridad de Amazon, puede clasificar reseñas como positivas o negativas en flujos de monitorización de opinión.
- Razonamiento de sentido común en asistentes domésticos: las familias PIQA y COPA permiten decidir si una acción propuesta es físicamente plausible, útil en sistemas de recomendación de tareas.
- Evaluación automática de exámenes: el formato de examen del entrenamiento lo hace adecuado para corregir preguntas de opción múltiple o de sí/no en plataformas educativas.
- Componente de decisión en un ensemble Zils: puede integrarse como "cuerpo" dentro del pool `d3-mini` de la subred 127 para votar decisiones junto a otros cuerpos.

## Benchmarks y rendimiento

Los datos disponibles son métricas propias del autor sobre conjuntos de desarrollo internos, evaluadas con el grader open-source de Zils y media de 5 secretos. No son el examen oficial de Zils y el autor las marca como "RECORD ONLY".

| Medida (misma GPU) | Este cuerpo | Dfin (inicio etapa 2) | astrid-m1 |
|---|---|---|---|
| Estimación combinada KNOWN + NEW | 80,69 | 80,40 (+0,30) | No disponible |
| Parte KNOWN / parte NEW | 79,20 / 82,93 | 80,46 / 80,29 | No disponible |
| mini_dev_gold (299 ítems) | 76,32 | 84,24 (-7,92) | 84,87 |
| — por categoría: razonamiento / lenguaje / recuperación / herramientas / artes | 53,86 / 81,41 / 80,59 / 92,16 / 83,70 | 65,78 / 89,16 / 91,05 / 94,91 / 86,10 | No disponible |
| mini_combo50 (999 ítems) | 71,10 | 76,67 (-5,57) | 76,33 |
| Bloque MINI held-out | 92,82 | No disponible | No disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9,1 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda al menos 12-16 GB para contexto corto.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para despliegue en producción con concurrencia; RTX 4090 (24 GB) para inferencia en bf16 sin problemas de espacio.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 (24 GB) y potencialmente en RTX 4080 (16 GB) con contexto reducido.
- Opciones de despliegue: al usar `custom_code` y arquitectura `qwen3_5`, requiere `trust_remote_code=True` en Transformers; vLLM y TGI pueden requerir adaptación del código personalizado. No se documenta compatibilidad con llama.cpp u Ollama (no hay GGUF publicado).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| tensor-tailor/zils-mini-body-5 (este) | 4,54B | No disponible | Apache-2.0 | Decisión (8 familias) | Hugging Face |
| 1lock/zils-mini-astrid-m1 | No disponible | No disponible | Apache-2.0 | Decisión (cuerpo base) | Hugging Face |
| qhoenix/zils-mini-decision-v2 | No disponible | No disponible | Apache-2.0 | Decisión (profesor etapa 1) | Hugging Face |
| crabby-devil/zils-mini-decision-r16b | No disponible | No disponible | Apache-2.0 | Decisión (profesor etapa 1) | Hugging Face |

No se dispone de datos de benchmarks comparables entre estos modelos en la información proporcionada. La comparación se limita a su rol en el ecosistema Zils y a la licencia.

## Limitaciones y advertencias

- El modelo retrocede respecto a su punto de partida Dfin en `mini_dev_gold` (-7,92) y `mini_combo50` (-5,57), y también por debajo de astrid-m1 en `mini_dev_gold` (76,32 frente a 84,87). La mejora solo se observa en la estimación combinada KNOWN + NEW (+0,30).
- Entrenado sobre solo ocho familias de preguntas; el propio autor reconoce que "esta etapa entrena un conjunto estrecho de tipos de pregunta". El rendimiento fuera de esas familias es incierto.
- El formato de salida es de decisión (clave de respuesta), no de texto libre; no debe usarse como modelo generativo general.
- Riesgo de alucinación en la clave emitida si la pregunta se sale de la distribución de entrenamiento.
- Idiomas soportados no documentados; los datasets son mayoritariamente en inglés, por lo que el rendimiento en castellano no está garantizado.
- Requiere `trust_remote_code=True` por el `custom_code` y la arquitectura `qwen3_5`, lo que implica ejecutar código del autor.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción.
- El checkpoint publicado es intermedio (75 % de la segunda época), no el final del entrenamiento.
- Sesgos conocidos: no documentados explícitamente; los datasets de origen (MNLI, BoolQ, COPA, etc.) arrastran sesgos de sus fuentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tensor-tailor/zils-mini-body-5
- Perfil del autor: https://huggingface.co/tensor-tailor
- Modelo base: https://huggingface.co/1lock/zils-mini-astrid-m1
- Profesor etapa 1 (qhoenix): https://huggingface.co/qhoenix/zils-mini-decision-v2
- Profesor etapa 1 (crabby-devil): https://huggingface.co/crabby-devil/zils-mini-decision-r16b
- Profesor etapa 1 (ANGExllL): https://huggingface.co/ANGExllL/zils-mini-senova-ft
- Cuerpo previo del autor: https://huggingface.co/tensor-tailor/zils-mini-body-2
- Sitio de Zils: https://zils.ai/
