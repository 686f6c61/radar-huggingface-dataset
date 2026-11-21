# SOTAagi2030/SageLM-Support-7B-v2

## Resumen

SageLM Support 7B v2 es la segunda versión de producción de un asistente de atención al cliente desarrollado por SOTAagi2030. Según la model card, se trata de un modelo decoder-only de 7.000 millones de parámetros ajustado para triaje de tickets, redacción de respuestas y respuestas fundamentadas en políticas internas. La versión v2 añade 4,2 mil millones de tokens de transcripciones de soporte saneadas y un proceso de ajuste de preferencias en tres etapas sobre la receta de v1.0.

El modelo se publica con licencia Apache 2.0, está etiquetado como *release candidate* y solo declara soporte de inglés. La model card describe mejoras sustanciales frente a v1.0 en razonamiento aritmético (+0,160), lógica simbólica (+0,148) y finalización de código (+0,144) sobre un conjunto de evaluación interno.

Conviene señalar una discrepancia importante: los metadatos de Hugging Face indican 128 parámetros totales según los tensores en safetensors y un tamaño de repositorio de 0,0 GB, lo que contradice la denominación "7B" y el contenido de la model card. Esta ficha recoge ambos datos y advierte de la inconsistencia en la sección de limitaciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Decoder-only (transformer); detalles internos no disponibles |
| Parámetros totales | 128 según metadatos de safetensors; la model card declara 7B (dato inconsistente) |
| Parámetros activos | No aplica (no se describe como MoE) |
| Longitud de contexto | No disponible (la model card menciona degradación en tickets de más de 1.800 tokens, sin declarar ventana máxima) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

La model card describe un modelo decoder-only de 7B parámetros, sin detallar la familia arquitectónica concreta, el número de capas, la dimensionalidad oculta ni el mecanismo de atención. El entrenamiento parte de la receta de v1.0 y añade 4,2 mil millones de tokens de transcripciones de soporte saneadas, junto con un ajuste de preferencias en tres etapas (el algoritmo concreto no se especifica; podría tratarse de RLHF, DPO o variantes).

Entre los cambios técnicos destacados frente a v1.0 figuran la ampliación de la taxonomía de intenciones de tickets de 28 a 42 etiquetas, la integración del formato de llamadas a herramientas dentro de la mezcla supervisada (en lugar de un adaptador posterior) y un reajuste del comportamiento de rechazo contra la suite de políticas de 2026. No se proporcionan datos sobre composición del dataset, proporción de datos sintéticos ni proceso de filtrado.

## Capacidades

- Generación de texto conversacional orientada a atención al cliente.
- Clasificación de intenciones de tickets con una taxonomía de 42 etiquetas.
- Redacción de respuestas fundamentadas en políticas internas.
- Llamadas a herramientas integradas en el entrenamiento supervisado (formato de tool calling nativo).
- Razonamiento aritmético básico (problemas de palabras) y lógica simbólica.
- Comprensión lectora y análisis de sentimiento.
- Resumen de tickets y finalización de código (capacidad secundaria medida en la suite interna).
- Comportamiento de rechazo afinado para seguridad y moderación de toxicidad.
- Multilingüe: no disponible; solo se declara inglés.

## Casos de uso

- Triaje automático de tickets: el modelo clasifica la consulta entrante en una de las 42 categorías de intención definidas, lo que permite enrutarla al equipo adecuado y priorizar según criticidad.
- Redacción asistida de respuestas: genera borradores de respuesta fundamentados en la política interna correspondiente, que un agente humano revisa antes de enviar, tal como exige el uso previsto declarado.
- Resumen de hilos de soporte: condensa conversaciones multi-turno en un resumen operativo para el traspaso entre turnos o equipos; rinde mejor en tickets de menos de 1.800 tokens.
- Moderación y filtrado previo: utiliza sus capacidades de detección de toxicidad y rechazo de seguridad para descartar o marcar mensajes que violan políticas antes de que lleguen a un agente.
- Clasificación de sentimiento en encuestas post-soporte: analiza el tono de las respuestas de clientes para alimentar paneles de calidad y detección temprana de insatisfacción.
- Asistencia interna a agentes: como copiloto en el escritorio del agente, sugiere respuestas y recupera fragmentos de política relevantes, siempre con revisión humana en el bucle.
- Extracción estructurada vía tool calling: invoca funciones para registrar campos de ticket (categoría, urgencia, producto) en el sistema de gestión, gracias al formato de llamadas integrado en el entrenamiento.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre la suite interna SageLM Internal Evaluation Suite v2.3 (instantánea de 2026-10-02). Son métricas de precisión sobre prompts internos, no comparables directamente con benchmarks públicos.

| Categoría | Benchmark | v1.0 | v2 | Δ vs v1.0 |
|---|---|---|---|---|
| Razonamiento | Arithmetic Word Problems | 0,612 | 0,772 | +0,160 |
| Razonamiento | Symbolic Logic | 0,558 | 0,706 | +0,148 |
| Razonamiento | Commonsense QA | 0,648 | 0,759 | +0,111 |
| Lenguaje | Reading Comprehension | 0,701 | 0,799 | +0,098 |
| Lenguaje | Intent Classification | 0,742 | 0,833 | +0,091 |
| Lenguaje | Sentiment Analysis | 0,718 | 0,804 | +0,086 |
| Generación | Code Completion | 0,552 | 0,696 | +0,144 |
| Generación | Summarization | 0,601 | 0,727 | +0,126 |
| Generación | Dialogue Response | 0,618 | 0,731 | +0,113 |
| Confianza y seguridad | Safety Refusal | 0,901 | 0,936 | +0,035 |
| Confianza y seguridad | Toxicity Detection | 0,921 | 0,950 | +0,029 |
| Confianza y seguridad | Bias Mitigation | 0,702 | 0,784 | +0,082 |

Checkpoint seleccionado: `step_1800`, con una puntuación compuesta de 0,7770. No se han publicado resultados en benchmarks públicos (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma fiable. Con los metadatos reales (128 parámetros) el modelo cabría en cualquier GPU; si se confirma el tamaño de 7B declarado, en FP16 requeriría aproximadamente 14 GB de VRAM y en cuantización de 4 bits unos 4-5 GB.
- GPU recomendadas: no disponible. Para un modelo de 7B en FP16 bastaría una RTX 4090 (24 GB), A100 40 GB o H100; para el checkpoint de 128 parámetros, cualquier GPU consumer.
- GPU consumer: probablemente sí en cualquier caso, pero el dato no puede confirmarse por la inconsistencia de tamaño.
- Opciones de despliegue: compatible con `transformers` y con `endpoints_compatible` según los tags; no se confirma soporte de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La model card no incluye comparaciones con modelos de la competencia y las métricas son sobre una suite interna propietaria, por lo que no es posible establecer una comparación rigurosa con alternativas públicas de tamaño similar (por ejemplo, modelos de 7B orientados a conversación).

## Limitaciones y advertencias

- Inconsistencia crítica de tamaño: los metadatos de safetensors indican 128 parámetros y 0,0 GB de repositorio, mientras que la model card declara 7B. Verificar los pesos reales antes de cualquier uso.
- Las puntuaciones de benchmarks proceden de una suite interna y no son transferibles a benchmarks públicos.
- La calidad de resumen se degrada en tickets de más de 1.800 tokens.
- El modelo solo se ha evaluado en inglés; no hay validación en otros idiomas.
- Riesgo de alucinación en respuestas fundamentadas en políticas: el uso previsto exige revisión humana en el bucle.
- No debe emplearse para decisiones legales, médicas o de facturación, ni exponerse como endpoint público sin protección.
- Estado de *release candidate*: puede no ser una versión estable para producción.
- Licencia Apache 2.0 permite uso comercial, pero el autor restringe explícitamente el despliegue público sin supervisión.
- Sesgos: se reporta una métrica interna de mitigación de sesgo (0,784), pero no se detallan los sesgos conocidos ni la metodología de evaluación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SOTAagi2030/SageLM-Support-7B-v2
- Repositorio interno `sagelm-release`: no disponible públicamente (referenciado en la model card para incidencias)
- Paper, blog o demo: no disponibles en la información proporcionada.
