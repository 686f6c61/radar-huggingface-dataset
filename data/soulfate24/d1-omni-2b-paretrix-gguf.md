# Soulfate24/d1-Omni-2B-Paretrix-GGUF

## Resumen

d1-Omni-2B-Paretrix-GGUF es una colección de cuantizaciones GGUF del modelo multimodal LiquidAI/d1-Omni-2B, publicada por el usuario Soulfate24 bajo el paraguas de su suite Paretrix. El modelo base es un transformer híbrido de la familia LFM3 de Liquid AI, orientado a edge computing, con capacidades de audio-text-to-text y visión, y un total de 1.728.801.600 parámetros reales según los safetensors del repositorio. El repositorio ocupa 9,7 GB e incluye múltiples niveles de cuantización planificados de forma no uniforme.

La propuesta diferencial no es el modelo en sí, sino el método de cuantización: Paretrix es una suite empírica y activation-aware que, en lugar de aplicar una única familia de bitwidth a toda la red, mide la respuesta de cada clase de tensor a cada tipo de cuantización contra los logits BF16 de referencia y resuelve un problema de knapsack para planificar cada nivel. El autor publica una tabla de evaluación propia (JevBench, 231 decisiones tipadas) que compara cada nivel Paretrix con cuantizaciones estándar de llama.cpp (Q8_0, Q6_K-imx, Q5_K_M-imx, IQ4_XS-imx, IQ3_M-imx).

Es relevante ahora porque propone niveles intermedios (entre 738 MiB y 1.594 MiB) que mantienen o mejoran la precisión del BF16 en una tarea de decisión concreta, con tamaños inferiores a los de las cuantizaciones estándar equivalentes. La licencia heredada es lfm1.0, lo que condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido de la familia LFM3 (según tags: liquid, lfm3, multimodal); detalles internos no disponibles |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con planificación no uniforme Paretrix: Fidelity-48pc, Precision-42pc, Quality-36pc, Compact-33pc, Mini-30pc, Nano-27pc, Femto-21pc, Pico-24pc; bases estándar Q8_0, Q6_K-imx, Q5_K_M-imx, IQ4_XS-imx, IQ3_M-imx |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | lfm1.0 (other) |
| Formato de pesos | GGUF (repositorio con custom_code y compatibilidad con llama.cpp); pesos originales en safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo base LiquidAI/d1-Omni-2B pertenece a la familia LFM3 de Liquid AI, etiquetada como "liquid" y "edge", lo que sugiere un diseño orientado a despliegue en dispositivos con recursos limitados. Los tags indican naturaleza multimodal (audio, vision, audio-text-to-text) y un perfil de "decision model" con "system-one", es decir, orientado a decisiones rápidas y clasificación/extracción más que a razonamiento extendido. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

La innovación técnica documentada en esta ficha es el proceso de cuantización Paretrix. Partiendo de tres bases estándar (Q8_0, Q6_K-imx, IQ4_XS-imx), el método mueve cada clase de tensor individualmente a cada tipo de cuantización y mide el efecto contra los logits BF16; con esas celdas de medida, un knapsack exacto planifica cada nivel y un duelo en el régimen de veredicto decide si el plan sustituye al campeón. El autor afirma que lo medido en un modelo se hereda al siguiente modelo de la familia. No se documentan detalles de entrenamiento del modelo base ni innovaciones de decodificación (atención lineal, decodificación especulativa, etc.).

## Capacidades

- Generación de texto conversacional (tag conversational) y pipeline audio-text-to-text.
- Procesamiento de audio: el pipeline declarado es audio-text-to-text, lo que implica entrada de audio y salida de texto.
- Visión: el tag vision indica soporte de entrada de imágenes, aunque no se detalla la tarea concreta.
- Clasificación y extracción: los tags classification y extraction apuntan a tareas de etiquetado y extracción estructurada.
- Modelo de decisión: perfil "decision-model" y "system-one", orientado a respuestas rápidas de veredicto más que a cadenas de razonamiento largas.
- Calibración: tag calibration, relevante para decisiones con umbrales o puntuaciones.
- Multilingüe: 16 idiomas declarados (en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible; el perfil system-one sugiere lo contrario.
- Modo thinking: no disponible.

## Casos de uso

- Clasificación de tickets de soporte: el modelo puede asignar categorías y prioridades a partir de texto o audio transcrito, aprovechando su perfil de decisión y su tamaño reducido para ejecutarse en CPU o GPU de gama baja con los niveles Mini-30pc o Nano-27pc.
- Extracción de entidades en documentos: con los tags extraction y classification, encaja en pipelines de extracción de campos estructurados (fechas, importes, nombres) sobre texto multilingüe en los 16 idiomas soportados.
- Enrutamiento de llamadas con audio: al ser audio-text-to-text, puede recibir audio de entrada y emitir una decisión de enrutamiento o etiqueta, con latencias p50 declaradas de 44-51 ms en la tabla del autor (medidas en JevBench).
- Moderación y veredictos binarios: el régimen "decisive" reportado al 100 % en casi todos los niveles Paretrix lo hace apto para filtros de aceptación/rechazo con umbral calibrado.
- Despliegue en edge con llama.cpp: los GGUF de 738 MiB (Femto-21pc) a 1.594 MiB (Fidelity-48pc) permiten ejecución en dispositivos con poca memoria, integrándose en aplicaciones locales de escritorio o embebidas.
- Evaluación comparativa de cuantizaciones: el repositorio sirve como referencia práctica para medir el impacto de distintos esquemas de cuantización sobre una tarea de decisión concreta, útil para equipos que calibran sus propios pipelines.
- Procesamiento multimodal ligero: combinación de audio y visión en un modelo de 1,7 mil millones de parámetros para tareas de etiquetado conjunto en entornos con restricciones de cómputo.

## Benchmarks y rendimiento

Los únicos datos publicados son los de JevBench (231 decisiones tipadas) incluidos en la model card del autor. No hay resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

| Modelo | MiB | acc | same | flips | decisive | opt KL | p50 ms |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| BF16 (referencia) | 3306 | 74.9 | ref | | | — | — |
| Q8_0 (stock) | 1761 | 74.9 | 99.6 | 1 | 100.0 | 0.0003 | 45 |
| Fidelity-48pc | 1594 | 74.9 | 98.7 | 3 | 100.0 | 0.0005 | 48 |
| Precision-42pc | 1418 | 75.3 | 98.7 | 3 | 100.0 | 0.0006 | 51 |
| Q6_K-imx (stock) | 1362 | 75.3 | 99.6 | 1 | 100.0 | 0.0007 | 47 |
| Quality-36pc | 1219 | 74.9 | 97.8 | 5 | 100.0 | 0.0019 | 50 |
| Q5_K_M-imx (stock) | 1200 | 76.2 | 96.1 | 9 | 100.0 | 0.0019 | 47 |
| Compact-33pc | 1121 | 74.5 | 97.0 | 7 | 100.0 | 0.0028 | 47 |
| Mini-30pc | 1021 | 76.6 | 97.0 | 7 | 100.0 | 0.0043 | 47 |
| IQ4_XS-imx (stock) | 957 | 74.5 | 92.6 | 17 | 97.9 | 0.0120 | 44 |
| Nano-27pc | 927 | 76.2 | 94.8 | 12 | 99.5 | 0.0082 | 46 |
| Pico-24pc | 833 | 77.9 | 93.9 | 14 | 99.0 | 0.0109 | 44 |
| IQ3_M-imx (stock) | 829 | 75.8 | 93.5 | 15 | 97.9 | 0.0318 | 46 |
| Femto-21pc | 738 | 77.1 | 94.4 | 13 | 99.0 | 0.0234 | 48 |

Lectura de la tabla: Pico-24pc (833 MiB) alcanza 77.9 de accuracy frente a 74.9 del BF16 y 75.8 de IQ3_M-imx con tamaño similar (829 MiB), pero con un KL de 0.0109 frente a 0.0318. Mini-30pc (1021 MiB) obtiene 76.6 de accuracy con KL 0.0043, frente a 74.5 y 0.0120 de IQ4_XS-imx (957 MiB). Los datos son autoinformados por el autor y se refieren exclusivamente a JevBench.

## Requisitos de hardware

- VRAM estimada: entre 738 MiB y 1.594 MiB para los niveles Paretrix, más overhead de contexto y del runtime; el BF16 de referencia ocupa 3306 MiB.
- GPU recomendadas: no disponibles de forma explícita; por tamaño, cualquier GPU consumer con 2-4 GB libres es suficiente para los niveles pequeños.
- Cabe en GPU consumer: sí, todos los niveles Paretrix caben en GPUs de gama baja y en iGPU con memoria unificada suficiente.
- Opciones de despliegue: llama.cpp (compatibilidad declarada en tags), GGUF; el modelo base usa transformers con custom_code. vLLM, Ollama y TGI no se mencionan en la información disponible.
- Latencia y throughput: la tabla del autor reporta p50 de 44-51 ms por decisión en JevBench para todos los niveles, incluido BF16 (sin dato de p50 para BF16). No hay datos de throughput ni de latencia en generación libre.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (edge, 1-2B, multimodal audio-texto). La comparativa más cercana disponible es interna al repositorio, entre niveles de cuantización del mismo modelo:

| Nivel | MiB | acc (JevBench) | opt KL | Licencia |
| :--- | ---: | ---: | ---: | :--- |
| BF16 referencia | 3306 | 74.9 | — | lfm1.0 |
| Fidelity-48pc | 1594 | 74.9 | 0.0005 | lfm1.0 |
| Mini-30pc | 1021 | 76.6 | 0.0043 | lfm1.0 |
| Pico-24pc | 833 | 77.9 | 0.0109 | lfm1.0 |
| Femto-21pc | 738 | 77.1 | 0.0234 | lfm1.0 |

Comparativa con alternativas de otros autores: no disponible.

## Limitaciones y advertencias

- Los benchmarks son autoinformados por el autor y se limitan a JevBench (231 decisiones tipadas); no hay validación independiente ni resultados en benchmarks estándar.
- El accuracy superior al BF16 en varios niveles (Pico-24pc, Femto-21pc, Mini-30pc) es un artefacto posible de la métrica concreta y no debe interpretarse como mejora general del modelo.
- Riesgo de alucinación: no documentado en la información disponible; al ser un modelo de decisión y clasificación, el riesgo se traslada a falsos positivos/negativos en las etiquetas.
- Sesgos conocidos: no disponibles.
- Limitaciones de contexto e idioma: la longitud de contexto no está publicada; los 16 idiomas declarados no implican calidad homogénea y no hay evaluaciones por idioma.
- Licencia lfm1.0: es una licencia "other" que puede imponer restricciones al uso comercial; debe revisarse el archivo LICENSE antes de cualquier despliegue en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha, sin historial de uso comunitario.
- El modelo base es de noviembre de 2026 según la fecha de creación del repo; la información sobre su entrenamiento es escasa.
- El uso de custom_code en transformers puede requerir confiar en código remoto del autor del modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Soulfate24/d1-Omni-2B-Paretrix-GGUF
- Modelo base: https://huggingface.co/LiquidAI/d1-Omni-2B
- Suite de cuantización Paretrix: https://huggingface.co/Soulfate24/Paretrix_Quantization_Suite
